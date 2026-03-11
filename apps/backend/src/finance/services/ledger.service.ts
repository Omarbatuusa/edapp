import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
    FinJournal, JournalStatus, JournalSourceType,
    FinJournalLine, FinAccount,
} from '../entities';
import { NumberingService } from './numbering.service';
import { PeriodService } from './period.service';

export interface JournalLineInput {
    account_id: string;
    debit_amount: number;
    credit_amount: number;
    description?: string;
    cost_centre_id?: string;
    branch_id?: string;
    dimension_tags?: Record<string, string>;
}

export interface CreateJournalInput {
    tenant_id: string;
    journal_date: string;
    description: string;
    source_type?: JournalSourceType;
    source_id?: string;
    lines: JournalLineInput[];
    created_by?: string;
    auto_post?: boolean;
}

@Injectable()
export class LedgerService {
    constructor(
        @InjectRepository(FinJournal)
        private readonly journalRepo: Repository<FinJournal>,
        @InjectRepository(FinJournalLine)
        private readonly lineRepo: Repository<FinJournalLine>,
        @InjectRepository(FinAccount)
        private readonly accountRepo: Repository<FinAccount>,
        private readonly numberingService: NumberingService,
        private readonly periodService: PeriodService,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Create a journal entry. Validates double-entry balance.
     * If auto_post is true, posts immediately (immutable after).
     */
    async createJournal(input: CreateJournalInput): Promise<FinJournal> {
        // Validate lines
        if (!input.lines || input.lines.length < 2) {
            throw new BadRequestException('Journal must have at least 2 lines');
        }

        // Validate each line has either debit or credit (not both, not neither)
        for (const line of input.lines) {
            const debit = Number(line.debit_amount) || 0;
            const credit = Number(line.credit_amount) || 0;
            if (debit < 0 || credit < 0) {
                throw new BadRequestException('Amounts cannot be negative');
            }
            if (debit === 0 && credit === 0) {
                throw new BadRequestException('Each line must have a debit or credit amount');
            }
            if (debit > 0 && credit > 0) {
                throw new BadRequestException('A line cannot have both debit and credit amounts');
            }
        }

        // Validate double-entry balance: total debits must equal total credits
        const totalDebit = input.lines.reduce((sum, l) => sum + (Number(l.debit_amount) || 0), 0);
        const totalCredit = input.lines.reduce((sum, l) => sum + (Number(l.credit_amount) || 0), 0);
        const diff = Math.abs(totalDebit - totalCredit);
        if (diff > 0.01) {
            throw new BadRequestException(
                `Journal is unbalanced: debits (${totalDebit.toFixed(2)}) != credits (${totalCredit.toFixed(2)}). Difference: ${diff.toFixed(2)}`,
            );
        }

        // Validate all accounts exist and belong to tenant
        const accountIds = [...new Set(input.lines.map(l => l.account_id))];
        const accounts = await this.accountRepo.find({
            where: accountIds.map(id => ({ id, tenant_id: input.tenant_id })),
        });
        if (accounts.length !== accountIds.length) {
            throw new BadRequestException('One or more account IDs are invalid or do not belong to this tenant');
        }
        // Ensure no header accounts are used for posting
        const headerAccounts = accounts.filter(a => a.is_header);
        if (headerAccounts.length > 0) {
            throw new BadRequestException(`Cannot post to header accounts: ${headerAccounts.map(a => a.code).join(', ')}`);
        }

        // Get journal number
        const journalNumber = await this.numberingService.getNextNumber(input.tenant_id, 'journal');

        // Use transaction for atomicity
        return this.dataSource.transaction(async (manager) => {
            const journal = manager.create(FinJournal, {
                tenant_id: input.tenant_id,
                journal_number: journalNumber,
                journal_date: input.journal_date,
                description: input.description,
                source_type: input.source_type || JournalSourceType.MANUAL,
                source_id: input.source_id || null,
                status: JournalStatus.DRAFT,
                created_by: input.created_by || null,
                total_debit: totalDebit,
                total_credit: totalCredit,
            } as any);
            const savedJournal = await manager.save(FinJournal, journal);

            // Create lines
            const lines = input.lines.map((line, idx) =>
                manager.create(FinJournalLine, {
                    journal_id: savedJournal.id,
                    account_id: line.account_id,
                    debit_amount: Number(line.debit_amount) || 0,
                    credit_amount: Number(line.credit_amount) || 0,
                    description: line.description || null,
                    cost_centre_id: line.cost_centre_id || null,
                    branch_id: line.branch_id || null,
                    dimension_tags: line.dimension_tags || null,
                    line_order: idx + 1,
                } as any),
            );
            await manager.save(FinJournalLine, lines);

            // Auto-post if requested
            if (input.auto_post) {
                return this.postJournalInTransaction(manager, savedJournal, input.created_by);
            }

            return savedJournal;
        });
    }

    /**
     * Post a draft journal — makes it immutable.
     */
    async postJournal(journalId: string, tenantId: string, userId?: string): Promise<FinJournal> {
        return this.dataSource.transaction(async (manager) => {
            const journal = await manager.findOne(FinJournal, {
                where: { id: journalId, tenant_id: tenantId },
            });
            if (!journal) throw new BadRequestException('Journal not found');

            return this.postJournalInTransaction(manager, journal, userId);
        });
    }

    private async postJournalInTransaction(
        manager: any,
        journal: FinJournal,
        userId?: string,
    ): Promise<FinJournal> {
        if (journal.status !== JournalStatus.DRAFT) {
            throw new BadRequestException(`Cannot post journal with status ${journal.status}`);
        }

        // Ensure period is open
        const period = await this.periodService.ensurePeriodOpen(journal.tenant_id, journal.journal_date);

        journal.status = JournalStatus.POSTED;
        journal.posting_date = journal.journal_date;
        journal.period_id = period.id;
        (journal as any).posted_by = userId || null;
        journal.posted_at = new Date();

        return manager.save(FinJournal, journal);
    }

    /**
     * Reverse a posted journal — creates a new reversal journal with opposite entries.
     */
    async reverseJournal(journalId: string, tenantId: string, reason: string, userId?: string): Promise<FinJournal> {
        return this.dataSource.transaction(async (manager) => {
            const original = await manager.findOne(FinJournal, {
                where: { id: journalId, tenant_id: tenantId },
            });
            if (!original) throw new BadRequestException('Journal not found');
            if (original.status !== JournalStatus.POSTED) {
                throw new BadRequestException('Can only reverse posted journals');
            }
            if (original.reversed_by_journal_id) {
                throw new BadRequestException('Journal has already been reversed');
            }

            // Get original lines
            const originalLines = await manager.find(FinJournalLine, {
                where: { journal_id: original.id },
                order: { line_order: 'ASC' },
            });

            // Create reversal journal with swapped debits/credits
            const reversalNumber = await this.numberingService.getNextNumber(tenantId, 'journal');
            const today = new Date().toISOString().split('T')[0];

            const reversal = manager.create(FinJournal, {
                tenant_id: tenantId,
                journal_number: reversalNumber,
                journal_date: today,
                description: `Reversal of ${original.journal_number}: ${reason}`,
                source_type: JournalSourceType.REVERSAL,
                source_id: original.id,
                reversal_of_journal_id: original.id,
                status: JournalStatus.DRAFT,
                created_by: userId || null,
                total_debit: original.total_credit,
                total_credit: original.total_debit,
            } as any);
            const savedReversal = await manager.save(FinJournal, reversal);

            // Create reversed lines (swap debit/credit)
            const reversedLines = originalLines.map((line, idx) =>
                manager.create(FinJournalLine, {
                    journal_id: savedReversal.id,
                    account_id: line.account_id,
                    debit_amount: line.credit_amount,
                    credit_amount: line.debit_amount,
                    description: `Reversal: ${line.description || ''}`,
                    cost_centre_id: line.cost_centre_id,
                    branch_id: line.branch_id,
                    dimension_tags: line.dimension_tags,
                    line_order: idx + 1,
                } as any),
            );
            await manager.save(FinJournalLine, reversedLines);

            // Post the reversal immediately
            const postedReversal = await this.postJournalInTransaction(manager, savedReversal, userId);

            // Mark original as reversed
            original.reversed_by_journal_id = postedReversal.id;
            original.status = JournalStatus.REVERSED;
            await manager.save(FinJournal, original);

            return postedReversal;
        });
    }

    /**
     * Get journal with its lines.
     */
    async getJournalWithLines(journalId: string, tenantId: string) {
        const journal = await this.journalRepo.findOne({
            where: { id: journalId, tenant_id: tenantId },
        });
        if (!journal) return null;

        const lines = await this.lineRepo.find({
            where: { journal_id: journal.id },
            order: { line_order: 'ASC' },
        });

        return { ...journal, lines };
    }
}
