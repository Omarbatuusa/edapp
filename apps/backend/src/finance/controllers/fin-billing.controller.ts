import {
    Controller, Get, Post, Body, Param, Query, Req, UseGuards,
    ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import {
    FinFamilyAccount, FinPayer, FinFeeStructure, FinFeeItem,
    FinInvoice, FinInvoiceLine, FinDiscountRule, FinHold,
    FinReceipt, FinCreditNote, InvoiceStatus,
} from '../entities';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/billing')
export class FinBillingController {
    constructor(
        @InjectRepository(FinFamilyAccount)
        private readonly familyAccountRepo: Repository<FinFamilyAccount>,
        @InjectRepository(FinPayer)
        private readonly payerRepo: Repository<FinPayer>,
        @InjectRepository(FinFeeStructure)
        private readonly feeStructureRepo: Repository<FinFeeStructure>,
        @InjectRepository(FinFeeItem)
        private readonly feeItemRepo: Repository<FinFeeItem>,
        @InjectRepository(FinInvoice)
        private readonly invoiceRepo: Repository<FinInvoice>,
        @InjectRepository(FinInvoiceLine)
        private readonly invoiceLineRepo: Repository<FinInvoiceLine>,
        @InjectRepository(FinDiscountRule)
        private readonly discountRuleRepo: Repository<FinDiscountRule>,
        @InjectRepository(FinHold)
        private readonly holdRepo: Repository<FinHold>,
        @InjectRepository(FinReceipt)
        private readonly receiptRepo: Repository<FinReceipt>,
        @InjectRepository(FinCreditNote)
        private readonly creditNoteRepo: Repository<FinCreditNote>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    // ── Family Accounts ──────────────────────────────────────────────

    @Get('family-accounts')
    async listFamilyAccounts(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const take = parseInt(limit || '25', 10);
        const skip = (parseInt(page || '1', 10) - 1) * take;
        const [data, total] = await this.familyAccountRepo.findAndCount({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
            take,
            skip,
        });
        return { status: 'success', data, meta: { total, page: skip / take + 1, limit: take } };
    }

    @Get('family-accounts/:id')
    async getFamilyAccount(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const account = await this.familyAccountRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
            relations: ['payers'],
        });
        if (!account) throw new NotFoundException('Family account not found');
        return { status: 'success', data: account };
    }

    @Post('family-accounts')
    async createFamilyAccount(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const account = await this.familyAccountRepo.save(
            this.familyAccountRepo.create({ ...body, tenant_id: tenantId } as any),
        );
        return { status: 'success', data: account };
    }

    // ── Fee Structures ───────────────────────────────────────────────

    @Get('fee-structures')
    async listFeeStructures(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.feeStructureRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Get('fee-structures/:id')
    async getFeeStructure(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const structure = await this.feeStructureRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
            relations: ['items'],
        });
        if (!structure) throw new NotFoundException('Fee structure not found');
        return { status: 'success', data: structure };
    }

    @Post('fee-structures')
    async createFeeStructure(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const { items, ...structureData } = body;
        const structure = await this.feeStructureRepo.save(
            this.feeStructureRepo.create({ ...structureData, tenant_id: tenantId } as any),
        );
        if (items?.length) {
            for (const item of items) {
                await this.feeItemRepo.save(
                    this.feeItemRepo.create({
                        ...item,
                        tenant_id: tenantId,
                        fee_structure_id: (structure as any).id,
                    } as any),
                );
            }
        }
        return { status: 'success', data: structure };
    }

    // ── Invoices ─────────────────────────────────────────────────────

    @Get('invoices')
    async listInvoices(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('status') status?: string,
        @Query('family_account_id') familyAccountId?: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const where: any = { tenant_id: tenantId };
        if (status) where.status = status;
        if (familyAccountId) where.family_account_id = familyAccountId;
        const data = await this.invoiceRepo.find({
            where,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post('invoices')
    async createInvoice(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const { lines, ...invoiceData } = body;
        const invoice = await this.invoiceRepo.save(
            this.invoiceRepo.create({
                ...invoiceData,
                tenant_id: tenantId,
                status: InvoiceStatus.DRAFT,
            } as any),
        );
        if (lines?.length) {
            for (const line of lines) {
                await this.invoiceLineRepo.save(
                    this.invoiceLineRepo.create({
                        ...line,
                        tenant_id: tenantId,
                        invoice_id: (invoice as any).id,
                    } as any),
                );
            }
        }
        return { status: 'success', data: invoice };
    }

    @Post('invoices/:id/issue')
    async issueInvoice(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const invoice = await this.invoiceRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        (invoice as any).status = InvoiceStatus.ISSUED;
        (invoice as any).issued_at = new Date();
        const saved = await this.invoiceRepo.save(invoice);
        return { status: 'success', data: saved };
    }

    // ── Discount Rules ───────────────────────────────────────────────

    @Get('discount-rules')
    async listDiscountRules(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.discountRuleRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post('discount-rules')
    async createDiscountRule(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const rule = await this.discountRuleRepo.save(
            this.discountRuleRepo.create({ ...body, tenant_id: tenantId } as any),
        );
        return { status: 'success', data: rule };
    }

    // ── Holds ────────────────────────────────────────────────────────

    @Get('holds')
    async listHolds(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.holdRepo.find({
            where: { tenant_id: tenantId, is_active: true } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post('holds')
    async createHold(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const hold = await this.holdRepo.save(
            this.holdRepo.create({ ...body, tenant_id: tenantId, is_active: true } as any),
        );
        return { status: 'success', data: hold };
    }

    @Post('holds/:id/release')
    async releaseHold(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const hold = await this.holdRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!hold) throw new NotFoundException('Hold not found');
        (hold as any).is_active = false;
        (hold as any).released_at = new Date();
        const saved = await this.holdRepo.save(hold);
        return { status: 'success', data: saved };
    }
}
