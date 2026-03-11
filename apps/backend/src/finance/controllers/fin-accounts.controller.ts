import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { FinAccount } from '../entities';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/accounts')
export class FinAccountsController {
    constructor(
        @InjectRepository(FinAccount)
        private readonly accountRepo: Repository<FinAccount>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    @Get()
    async listAccounts(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('type') accountType?: string,
        @Query('active') active?: string,
        @Query('header') header?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const where: any = { tenant_id: tenantId };
        if (accountType) where.account_type = accountType;
        if (active !== undefined) where.is_active = active === 'true';
        if (header !== undefined) where.is_header = header === 'true';

        const accounts = await this.accountRepo.find({
            where,
            order: { sort_order: 'ASC', code: 'ASC' },
        });

        return { status: 'success', data: accounts };
    }

    @Get('tree')
    async getAccountTree(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const accounts = await this.accountRepo.find({
            where: { tenant_id: tenantId },
            order: { sort_order: 'ASC', code: 'ASC' },
        });

        // Build tree structure
        const accountMap = new Map<string, any>();
        const roots: any[] = [];

        for (const acc of accounts) {
            accountMap.set(acc.id, { ...acc, children: [] });
        }

        for (const acc of accounts) {
            const node = accountMap.get(acc.id);
            if (acc.parent_id && accountMap.has(acc.parent_id)) {
                accountMap.get(acc.parent_id).children.push(node);
            } else {
                roots.push(node);
            }
        }

        return { status: 'success', data: roots };
    }

    @Get(':id')
    async getAccount(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const account = await this.accountRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!account) throw new NotFoundException('Account not found');

        return { status: 'success', data: account };
    }

    @Post()
    async createAccount(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: any) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const account = await this.accountRepo.save(
            this.accountRepo.create({
                tenant_id: tenantId,
                code: body.code,
                name: body.name,
                account_type: body.account_type,
                sub_type: body.sub_type || null,
                parent_id: body.parent_id || null,
                is_header: body.is_header || false,
                is_system: false,
                currency: body.currency || 'ZAR',
                description: body.description || null,
                sort_order: body.sort_order || 0,
            } as any),
        );

        return { status: 'success', data: account };
    }

    @Put(':id')
    async updateAccount(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();

        const account = await this.accountRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!account) throw new NotFoundException('Account not found');

        if (account.is_system) {
            // System accounts: only allow name, description, is_active changes
            const allowed = ['name', 'description', 'is_active'];
            for (const key of allowed) {
                if (body[key] !== undefined) (account as any)[key] = body[key];
            }
        } else {
            const allowed = [
                'code', 'name', 'account_type', 'sub_type', 'parent_id',
                'is_header', 'currency', 'is_active', 'description', 'sort_order',
            ];
            for (const key of allowed) {
                if (body[key] !== undefined) (account as any)[key] = body[key];
            }
        }

        const saved = await this.accountRepo.save(account);
        return { status: 'success', data: saved };
    }
}
