import { Controller, Get, Query, Param, Req, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import {
    FinAccount, FinAccountType,
    FinJournalLine, FinJournal, JournalStatus,
    FinLedgerBalance, FinFiscalPeriod,
} from '../entities';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/reports')
export class FinReportsController {
    constructor(
        @InjectRepository(FinAccount)
        private readonly accountRepo: Repository<FinAccount>,
        @InjectRepository(FinJournal)
        private readonly journalRepo: Repository<FinJournal>,
        @InjectRepository(FinJournalLine)
        private readonly lineRepo: Repository<FinJournalLine>,
        @InjectRepository(FinLedgerBalance)
        private readonly balanceRepo: Repository<FinLedgerBalance>,
        @InjectRepository(FinFiscalPeriod)
        private readonly periodRepo: Repository<FinFiscalPeriod>,
        private readonly dataSource: DataSource,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    @Get('trial-balance')
    async trialBalance(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('as_of') asOf?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const dateFilter = asOf || new Date().toISOString().split('T')[0];

        // Sum all posted journal lines up to the given date
        const rows = await this.dataSource.query(
            `SELECT
                a.id, a.code, a.name, a.account_type, a.sub_type, a.is_header,
                COALESCE(SUM(jl.debit_amount), 0)::numeric as total_debit,
                COALESCE(SUM(jl.credit_amount), 0)::numeric as total_credit
            FROM fin_account a
            LEFT JOIN fin_journal_line jl ON jl.account_id = a.id
            LEFT JOIN fin_journal j ON j.id = jl.journal_id
                AND j.status = 'POSTED'
                AND j.posting_date <= $2
                AND j.tenant_id = $1
            WHERE a.tenant_id = $1 AND a.is_active = true
            GROUP BY a.id, a.code, a.name, a.account_type, a.sub_type, a.is_header
            ORDER BY a.sort_order, a.code`,
            [tenantId, dateFilter],
        );

        const accounts = rows.map((r: any) => ({
            ...r,
            total_debit: parseFloat(r.total_debit),
            total_credit: parseFloat(r.total_credit),
            balance: parseFloat(r.total_debit) - parseFloat(r.total_credit),
        }));

        const totalDebit = accounts.reduce((s: number, a: any) => s + a.total_debit, 0);
        const totalCredit = accounts.reduce((s: number, a: any) => s + a.total_credit, 0);

        return {
            status: 'success',
            data: {
                as_of: dateFilter,
                accounts: accounts.filter((a: any) => a.total_debit !== 0 || a.total_credit !== 0),
                totals: {
                    total_debit: Math.round(totalDebit * 100) / 100,
                    total_credit: Math.round(totalCredit * 100) / 100,
                    difference: Math.round((totalDebit - totalCredit) * 100) / 100,
                },
            },
        };
    }

    @Get('general-ledger')
    async generalLedger(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('account_id') accountId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        if (!accountId) throw new BadRequestException('account_id is required');

        const account = await this.accountRepo.findOne({ where: { id: accountId, tenant_id: tenantId } });
        if (!account) throw new BadRequestException('Account not found');

        const fromDate = from || '1900-01-01';
        const toDate = to || '2099-12-31';

        const lines = await this.dataSource.query(
            `SELECT
                jl.id, jl.debit_amount, jl.credit_amount, jl.description as line_description,
                j.journal_number, j.journal_date, j.posting_date, j.description as journal_description,
                j.source_type, j.status
            FROM fin_journal_line jl
            JOIN fin_journal j ON j.id = jl.journal_id
            WHERE jl.account_id = $1
                AND j.tenant_id = $2
                AND j.status = 'POSTED'
                AND j.posting_date >= $3
                AND j.posting_date <= $4
            ORDER BY j.posting_date, j.journal_number, jl.line_order`,
            [accountId, tenantId, fromDate, toDate],
        );

        // Calculate running balance
        let runningBalance = 0;
        const entries = lines.map((l: any) => {
            const debit = parseFloat(l.debit_amount);
            const credit = parseFloat(l.credit_amount);
            runningBalance += debit - credit;
            return {
                ...l,
                debit_amount: debit,
                credit_amount: credit,
                running_balance: Math.round(runningBalance * 100) / 100,
            };
        });

        return {
            status: 'success',
            data: {
                account,
                from: fromDate,
                to: toDate,
                entries,
                closing_balance: Math.round(runningBalance * 100) / 100,
            },
        };
    }

    @Get('profit-loss')
    async profitAndLoss(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const fromDate = from || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        const toDate = to || new Date().toISOString().split('T')[0];

        const rows = await this.dataSource.query(
            `SELECT
                a.id, a.code, a.name, a.account_type, a.sub_type,
                COALESCE(SUM(jl.debit_amount), 0)::numeric as total_debit,
                COALESCE(SUM(jl.credit_amount), 0)::numeric as total_credit
            FROM fin_account a
            LEFT JOIN fin_journal_line jl ON jl.account_id = a.id
            LEFT JOIN fin_journal j ON j.id = jl.journal_id
                AND j.status = 'POSTED'
                AND j.posting_date >= $2
                AND j.posting_date <= $3
                AND j.tenant_id = $1
            WHERE a.tenant_id = $1
                AND a.account_type IN ('REVENUE', 'EXPENSE')
                AND a.is_active = true
                AND a.is_header = false
            GROUP BY a.id, a.code, a.name, a.account_type, a.sub_type
            HAVING COALESCE(SUM(jl.debit_amount), 0) != 0 OR COALESCE(SUM(jl.credit_amount), 0) != 0
            ORDER BY a.account_type, a.sort_order, a.code`,
            [tenantId, fromDate, toDate],
        );

        const revenue: any[] = [];
        const expenses: any[] = [];
        let totalRevenue = 0;
        let totalExpenses = 0;

        for (const r of rows) {
            const debit = parseFloat(r.total_debit);
            const credit = parseFloat(r.total_credit);

            if (r.account_type === 'REVENUE') {
                const amount = credit - debit; // Revenue has credit balance
                revenue.push({ ...r, amount: Math.round(amount * 100) / 100 });
                totalRevenue += amount;
            } else {
                const amount = debit - credit; // Expenses have debit balance
                expenses.push({ ...r, amount: Math.round(amount * 100) / 100 });
                totalExpenses += amount;
            }
        }

        return {
            status: 'success',
            data: {
                from: fromDate,
                to: toDate,
                revenue,
                expenses,
                total_revenue: Math.round(totalRevenue * 100) / 100,
                total_expenses: Math.round(totalExpenses * 100) / 100,
                net_income: Math.round((totalRevenue - totalExpenses) * 100) / 100,
            },
        };
    }

    @Get('balance-sheet')
    async balanceSheet(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('as_of') asOf?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const dateFilter = asOf || new Date().toISOString().split('T')[0];

        const rows = await this.dataSource.query(
            `SELECT
                a.id, a.code, a.name, a.account_type, a.sub_type,
                COALESCE(SUM(jl.debit_amount), 0)::numeric as total_debit,
                COALESCE(SUM(jl.credit_amount), 0)::numeric as total_credit
            FROM fin_account a
            LEFT JOIN fin_journal_line jl ON jl.account_id = a.id
            LEFT JOIN fin_journal j ON j.id = jl.journal_id
                AND j.status = 'POSTED'
                AND j.posting_date <= $2
                AND j.tenant_id = $1
            WHERE a.tenant_id = $1
                AND a.account_type IN ('ASSET', 'LIABILITY', 'EQUITY')
                AND a.is_active = true
                AND a.is_header = false
            GROUP BY a.id, a.code, a.name, a.account_type, a.sub_type
            HAVING COALESCE(SUM(jl.debit_amount), 0) != 0 OR COALESCE(SUM(jl.credit_amount), 0) != 0
            ORDER BY a.account_type, a.sort_order, a.code`,
            [tenantId, dateFilter],
        );

        const assets: any[] = [];
        const liabilities: any[] = [];
        const equity: any[] = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        for (const r of rows) {
            const debit = parseFloat(r.total_debit);
            const credit = parseFloat(r.total_credit);

            if (r.account_type === 'ASSET') {
                const balance = debit - credit; // Assets have debit balance
                assets.push({ ...r, balance: Math.round(balance * 100) / 100 });
                totalAssets += balance;
            } else if (r.account_type === 'LIABILITY') {
                const balance = credit - debit; // Liabilities have credit balance
                liabilities.push({ ...r, balance: Math.round(balance * 100) / 100 });
                totalLiabilities += balance;
            } else {
                const balance = credit - debit; // Equity has credit balance
                equity.push({ ...r, balance: Math.round(balance * 100) / 100 });
                totalEquity += balance;
            }
        }

        // Add retained earnings (net income) to equity
        const retainedEarnings = await this.calculateRetainedEarnings(tenantId, dateFilter);
        totalEquity += retainedEarnings;

        return {
            status: 'success',
            data: {
                as_of: dateFilter,
                assets,
                liabilities,
                equity,
                retained_earnings: Math.round(retainedEarnings * 100) / 100,
                total_assets: Math.round(totalAssets * 100) / 100,
                total_liabilities: Math.round(totalLiabilities * 100) / 100,
                total_equity: Math.round(totalEquity * 100) / 100,
                total_liabilities_and_equity: Math.round((totalLiabilities + totalEquity) * 100) / 100,
                is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
            },
        };
    }

    private async calculateRetainedEarnings(tenantId: string, asOf: string): Promise<number> {
        const result = await this.dataSource.query(
            `SELECT
                COALESCE(SUM(CASE WHEN a.account_type = 'REVENUE' THEN jl.credit_amount - jl.debit_amount ELSE 0 END), 0)
                - COALESCE(SUM(CASE WHEN a.account_type = 'EXPENSE' THEN jl.debit_amount - jl.credit_amount ELSE 0 END), 0)
                as retained_earnings
            FROM fin_journal_line jl
            JOIN fin_journal j ON j.id = jl.journal_id
            JOIN fin_account a ON a.id = jl.account_id
            WHERE j.tenant_id = $1
                AND j.status = 'POSTED'
                AND j.posting_date <= $2
                AND a.account_type IN ('REVENUE', 'EXPENSE')`,
            [tenantId, asOf],
        );

        return parseFloat(result[0]?.retained_earnings || '0');
    }
}
