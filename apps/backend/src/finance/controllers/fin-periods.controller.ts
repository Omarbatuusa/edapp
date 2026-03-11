import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { FinFiscalYear, FinFiscalPeriod, FiscalYearStatus, FiscalPeriodStatus } from '../entities';
import { PeriodService } from '../services/period.service';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance')
export class FinPeriodsController {
    constructor(
        @InjectRepository(FinFiscalYear)
        private readonly yearRepo: Repository<FinFiscalYear>,
        @InjectRepository(FinFiscalPeriod)
        private readonly periodRepo: Repository<FinFiscalPeriod>,
        private readonly periodService: PeriodService,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    // ── Fiscal Years ──

    @Get('fiscal-years')
    async listFiscalYears(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const years = await this.yearRepo.find({
            where: { tenant_id: tenantId },
            order: { start_date: 'DESC' },
        });

        return { status: 'success', data: years };
    }

    @Get('fiscal-years/:id')
    async getFiscalYear(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const year = await this.yearRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!year) throw new NotFoundException('Fiscal year not found');

        const periods = await this.periodRepo.find({
            where: { fiscal_year_id: year.id, tenant_id: tenantId },
            order: { period_number: 'ASC' },
        });

        return { status: 'success', data: { ...year, periods } };
    }

    @Post('fiscal-years')
    async createFiscalYear(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: any) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        if (!body.name || !body.start_date || !body.end_date) {
            throw new BadRequestException('name, start_date, and end_date are required');
        }

        const result = await this.periodService.createFiscalYearWithPeriods(
            tenantId,
            body.name,
            body.start_date,
            body.end_date,
        );

        return {
            status: 'success',
            data: result.year,
            message: `Fiscal year created with ${result.periods.length} periods`,
        };
    }

    @Put('fiscal-years/:id')
    async updateFiscalYear(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const year = await this.yearRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!year) throw new NotFoundException('Fiscal year not found');

        if (body.name !== undefined) year.name = body.name;
        if (body.status !== undefined) {
            if (body.status === FiscalYearStatus.CLOSED) {
                year.closed_by = req.user?.uid || req.user?.sub || null;
                year.closed_at = new Date();
            }
            year.status = body.status;
        }

        const saved = await this.yearRepo.save(year);
        return { status: 'success', data: saved };
    }

    // ── Fiscal Periods ──

    @Get('periods')
    async listPeriods(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const periods = await this.periodRepo.find({
            where: { tenant_id: tenantId },
            order: { start_date: 'ASC' },
        });

        return { status: 'success', data: periods };
    }

    @Post('periods/:id/close')
    async closePeriod(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const period = await this.periodRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!period) throw new NotFoundException('Period not found');
        if (period.status !== FiscalPeriodStatus.OPEN) {
            throw new BadRequestException(`Period is already ${period.status}`);
        }

        period.status = FiscalPeriodStatus.CLOSED;
        period.locked_by = req.user?.uid || req.user?.sub || null;
        period.locked_at = new Date();

        const saved = await this.periodRepo.save(period);
        return { status: 'success', data: saved };
    }

    @Post('periods/:id/reopen')
    async reopenPeriod(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const period = await this.periodRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!period) throw new NotFoundException('Period not found');
        if (period.status === FiscalPeriodStatus.OPEN) {
            throw new BadRequestException('Period is already open');
        }

        period.status = FiscalPeriodStatus.OPEN;
        (period as any).locked_by = null;
        (period as any).locked_at = null;

        const saved = await this.periodRepo.save(period);
        return { status: 'success', data: saved };
    }

    @Post('periods/:id/lock')
    async lockPeriod(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const period = await this.periodRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!period) throw new NotFoundException('Period not found');

        period.status = FiscalPeriodStatus.LOCKED;
        period.locked_by = req.user?.uid || req.user?.sub || null;
        period.locked_at = new Date();

        const saved = await this.periodRepo.save(period);
        return { status: 'success', data: saved };
    }
}
