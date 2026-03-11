import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { FinJournal, JournalStatus } from '../entities';
import { LedgerService } from '../services/ledger.service';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/journals')
export class FinJournalsController {
    constructor(
        @InjectRepository(FinJournal)
        private readonly journalRepo: Repository<FinJournal>,
        private readonly ledgerService: LedgerService,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    @Get()
    async listJournals(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('status') status?: string,
        @Query('source_type') sourceType?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const pageNum = parseInt(page || '1', 10);
        const pageSize = Math.min(parseInt(limit || '50', 10), 100);

        const where: any = { tenant_id: tenantId };
        if (status) where.status = status;
        if (sourceType) where.source_type = sourceType;

        const [data, total] = await this.journalRepo.findAndCount({
            where,
            order: { created_at: 'DESC' },
            skip: (pageNum - 1) * pageSize,
            take: pageSize,
        });

        return { status: 'success', data, meta: { total, page: pageNum, limit: pageSize } };
    }

    @Get(':id')
    async getJournal(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const result = await this.ledgerService.getJournalWithLines(id, tenantId);
        if (!result) throw new NotFoundException('Journal not found');

        return { status: 'success', data: result };
    }

    @Post()
    async createJournal(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: any) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const journal = await this.ledgerService.createJournal({
            tenant_id: tenantId,
            journal_date: body.journal_date,
            description: body.description,
            source_type: body.source_type,
            source_id: body.source_id,
            lines: body.lines,
            created_by: req.user?.uid || req.user?.sub,
            auto_post: body.auto_post || false,
        });

        return { status: 'success', data: journal };
    }

    @Post(':id/post')
    async postJournal(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const journal = await this.ledgerService.postJournal(
            id,
            tenantId,
            req.user?.uid || req.user?.sub,
        );

        return { status: 'success', data: journal };
    }

    @Post(':id/reverse')
    async reverseJournal(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const reversal = await this.ledgerService.reverseJournal(
            id,
            tenantId,
            body.reason || 'No reason provided',
            req.user?.uid || req.user?.sub,
        );

        return { status: 'success', data: reversal };
    }
}
