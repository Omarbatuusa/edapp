import {
    Controller, Get, Post, Body, Param, Req, UseGuards,
    ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { FinWallet, FinWalletTransaction, WalletTransactionType } from '../entities';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/wallets')
export class FinWalletsController {
    constructor(
        @InjectRepository(FinWallet)
        private readonly walletRepo: Repository<FinWallet>,
        @InjectRepository(FinWalletTransaction)
        private readonly walletTxRepo: Repository<FinWalletTransaction>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    @Get()
    async listWallets(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.walletRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post()
    async createWallet(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const wallet = await this.walletRepo.save(
            this.walletRepo.create({ ...body, tenant_id: tenantId, balance: 0 } as any),
        );
        return { status: 'success', data: wallet };
    }

    @Post(':id/topup')
    async topUpWallet(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const wallet = await this.walletRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!wallet) throw new NotFoundException('Wallet not found');

        const amount = parseFloat(body.amount);
        if (!amount || amount <= 0) throw new BadRequestException('Invalid amount');

        (wallet as any).balance = parseFloat((wallet as any).balance || '0') + amount;
        await this.walletRepo.save(wallet);

        const tx = await this.walletTxRepo.save(
            this.walletTxRepo.create({
                tenant_id: tenantId,
                wallet_id: id,
                type: WalletTransactionType.TOPUP,
                amount,
                balance_after: (wallet as any).balance,
                description: body.description || 'Top-up',
            } as any),
        );
        return { status: 'success', data: { wallet, transaction: tx } };
    }

    @Post(':id/spend')
    async spendFromWallet(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const wallet = await this.walletRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!wallet) throw new NotFoundException('Wallet not found');

        const amount = parseFloat(body.amount);
        if (!amount || amount <= 0) throw new BadRequestException('Invalid amount');

        const currentBalance = parseFloat((wallet as any).balance || '0');
        if (currentBalance < amount) throw new BadRequestException('Insufficient balance');

        (wallet as any).balance = currentBalance - amount;
        await this.walletRepo.save(wallet);

        const tx = await this.walletTxRepo.save(
            this.walletTxRepo.create({
                tenant_id: tenantId,
                wallet_id: id,
                type: WalletTransactionType.SPEND,
                amount: -amount,
                balance_after: (wallet as any).balance,
                description: body.description || 'Spend',
            } as any),
        );
        return { status: 'success', data: { wallet, transaction: tx } };
    }

    @Get(':id/transactions')
    async getWalletTransactions(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const wallet = await this.walletRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!wallet) throw new NotFoundException('Wallet not found');

        const data = await this.walletTxRepo.find({
            where: { wallet_id: id, tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }
}
