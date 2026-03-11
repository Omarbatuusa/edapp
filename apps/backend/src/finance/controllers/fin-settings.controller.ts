import { Controller, Get, Put, Post, Body, Param, Req, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { FinTenantSettings, FinAccount, FinTaxRate } from '../entities';
import { DEFAULT_CHART_OF_ACCOUNTS, DEFAULT_TAX_RATES } from '../seeds/default-chart-of-accounts';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/settings')
export class FinSettingsController {
    constructor(
        @InjectRepository(FinTenantSettings)
        private readonly settingsRepo: Repository<FinTenantSettings>,
        @InjectRepository(FinAccount)
        private readonly accountRepo: Repository<FinAccount>,
        @InjectRepository(FinTaxRate)
        private readonly taxRateRepo: Repository<FinTaxRate>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    @Get()
    async getSettings(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        let settings: any = await this.settingsRepo.findOne({ where: { tenant_id: tenantId } });
        if (!settings) {
            // Auto-create default settings
            settings = await this.settingsRepo.save(
                this.settingsRepo.create({ tenant_id: tenantId } as any),
            );
        }
        return { status: 'success', data: settings };
    }

    @Put()
    async updateSettings(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: any) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        let settings: any = await this.settingsRepo.findOne({ where: { tenant_id: tenantId } });
        if (!settings) {
            settings = this.settingsRepo.create({ tenant_id: tenantId } as any);
        }
        const allowed = [
            'base_currency', 'tax_enabled', 'default_tax_rate',
            'default_payment_terms_days', 'fiscal_year_start_month', 'auto_numbering_config',
        ];
        for (const key of allowed) {
            if (body[key] !== undefined) (settings as any)[key] = body[key];
        }
        const saved = await this.settingsRepo.save(settings);
        return { status: 'success', data: saved };
    }

    @Post('initialize')
    async initializeFinance(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const settings = await this.settingsRepo.findOne({ where: { tenant_id: tenantId } });
        if (settings?.finance_initialized) {
            return { status: 'success', message: 'Finance already initialized' };
        }

        // Seed default chart of accounts
        const codeToIdMap = new Map<string, string>();
        for (const seed of DEFAULT_CHART_OF_ACCOUNTS) {
            const parentId = seed.parent_code ? codeToIdMap.get(seed.parent_code) || null : null;
            const account: any = await this.accountRepo.save(
                this.accountRepo.create({
                    tenant_id: tenantId,
                    code: seed.code,
                    name: seed.name,
                    account_type: seed.account_type,
                    sub_type: seed.sub_type,
                    parent_id: parentId,
                    is_header: seed.is_header,
                    is_system: seed.is_system,
                    sort_order: seed.sort_order,
                } as any),
            );
            codeToIdMap.set(seed.code, account.id);
        }

        // Seed default tax rates
        for (const tax of DEFAULT_TAX_RATES) {
            await this.taxRateRepo.save(
                this.taxRateRepo.create({
                    tenant_id: tenantId,
                    code: tax.code,
                    label: tax.label,
                    rate: tax.rate,
                    is_default: tax.is_default,
                } as any),
            );
        }

        // Mark as initialized
        if (settings) {
            settings.finance_initialized = true;
            await this.settingsRepo.save(settings);
        } else {
            await this.settingsRepo.save(
                this.settingsRepo.create({
                    tenant_id: tenantId,
                    finance_initialized: true,
                } as any),
            );
        }

        return {
            status: 'success',
            message: `Finance initialized: ${DEFAULT_CHART_OF_ACCOUNTS.length} accounts, ${DEFAULT_TAX_RATES.length} tax rates created`,
        };
    }
}
