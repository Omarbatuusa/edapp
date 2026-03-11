import {
    Controller, Get, Post, Put, Body, Param, Req, UseGuards,
    ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import {
    FinAsset, FinBudget, FinBudgetLine,
    FinPettyCashFund, FinPettyCashTransaction, BudgetStatus,
} from '../entities';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/assets')
export class FinAssetsController {
    constructor(
        @InjectRepository(FinAsset)
        private readonly assetRepo: Repository<FinAsset>,
        @InjectRepository(FinBudget)
        private readonly budgetRepo: Repository<FinBudget>,
        @InjectRepository(FinBudgetLine)
        private readonly budgetLineRepo: Repository<FinBudgetLine>,
        @InjectRepository(FinPettyCashFund)
        private readonly pettyCashFundRepo: Repository<FinPettyCashFund>,
        @InjectRepository(FinPettyCashTransaction)
        private readonly pettyCashTxRepo: Repository<FinPettyCashTransaction>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    // ── Assets ───────────────────────────────────────────────────────

    @Get()
    async listAssets(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.assetRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post()
    async createAsset(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const asset = await this.assetRepo.save(
            this.assetRepo.create({ ...body, tenant_id: tenantId } as any),
        );
        return { status: 'success', data: asset };
    }

    @Put(':id')
    async updateAsset(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const asset = await this.assetRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!asset) throw new NotFoundException('Asset not found');
        const allowed = [
            'name', 'description', 'status', 'purchase_date', 'purchase_cost',
            'salvage_value', 'useful_life_months', 'depreciation_method',
            'location', 'serial_number', 'asset_account_id', 'depreciation_account_id',
        ];
        for (const key of allowed) {
            if (body[key] !== undefined) (asset as any)[key] = body[key];
        }
        const saved = await this.assetRepo.save(asset);
        return { status: 'success', data: saved };
    }

    // ── Budgets ──────────────────────────────────────────────────────

    @Get('budgets')
    async listBudgets(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.budgetRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post('budgets')
    async createBudget(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const { lines, ...budgetData } = body;
        const budget = await this.budgetRepo.save(
            this.budgetRepo.create({
                ...budgetData,
                tenant_id: tenantId,
                status: BudgetStatus.DRAFT,
            } as any),
        );
        if (lines?.length) {
            for (const line of lines) {
                await this.budgetLineRepo.save(
                    this.budgetLineRepo.create({
                        ...line,
                        tenant_id: tenantId,
                        budget_id: (budget as any).id,
                    } as any),
                );
            }
        }
        return { status: 'success', data: budget };
    }

    // ── Petty Cash ───────────────────────────────────────────────────

    @Get('petty-cash')
    async listPettyCashFunds(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.pettyCashFundRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post('petty-cash')
    async createPettyCashFund(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const fund = await this.pettyCashFundRepo.save(
            this.pettyCashFundRepo.create({ ...body, tenant_id: tenantId } as any),
        );
        return { status: 'success', data: fund };
    }

    @Post('petty-cash/:id/transactions')
    async recordPettyCashTransaction(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const fund = await this.pettyCashFundRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!fund) throw new NotFoundException('Petty cash fund not found');
        const tx = await this.pettyCashTxRepo.save(
            this.pettyCashTxRepo.create({
                ...body,
                tenant_id: tenantId,
                petty_cash_fund_id: id,
            } as any),
        );
        return { status: 'success', data: tx };
    }
}
