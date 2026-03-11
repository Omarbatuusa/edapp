import {
    Controller, Get, Post, Put, Body, Param, Req, UseGuards,
    ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import {
    FinVendor, FinPurchaseOrder, FinPurchaseOrderLine,
    FinVendorBill, FinVendorPayment, PurchaseOrderStatus, VendorBillStatus,
} from '../entities';

const FINANCE_ADMIN_ROLES = [
    'platform_super_admin', 'platform_secretary', 'platform_support',
    'tenant_admin', 'main_branch_admin', 'brand_admin',
    'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/finance/vendors')
export class FinVendorsController {
    constructor(
        @InjectRepository(FinVendor)
        private readonly vendorRepo: Repository<FinVendor>,
        @InjectRepository(FinPurchaseOrder)
        private readonly poRepo: Repository<FinPurchaseOrder>,
        @InjectRepository(FinPurchaseOrderLine)
        private readonly poLineRepo: Repository<FinPurchaseOrderLine>,
        @InjectRepository(FinVendorBill)
        private readonly billRepo: Repository<FinVendorBill>,
        @InjectRepository(FinVendorPayment)
        private readonly vendorPaymentRepo: Repository<FinVendorPayment>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManageFinance(req: any): boolean {
        const role = this.getRole(req);
        return FINANCE_ADMIN_ROLES.some(r => role.includes(r));
    }

    // ── Vendors ──────────────────────────────────────────────────────

    @Get()
    async listVendors(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.vendorRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { name: 'ASC' } as any,
        });
        return { status: 'success', data };
    }

    @Post()
    async createVendor(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const vendor = await this.vendorRepo.save(
            this.vendorRepo.create({ ...body, tenant_id: tenantId } as any),
        );
        return { status: 'success', data: vendor };
    }

    @Put(':id')
    async updateVendor(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const vendor = await this.vendorRepo.findOne({
            where: { id, tenant_id: tenantId } as any,
        });
        if (!vendor) throw new NotFoundException('Vendor not found');
        const allowed = ['name', 'email', 'phone', 'tax_number', 'address', 'status', 'payment_terms_days', 'default_account_id'];
        for (const key of allowed) {
            if (body[key] !== undefined) (vendor as any)[key] = body[key];
        }
        const saved = await this.vendorRepo.save(vendor);
        return { status: 'success', data: saved };
    }

    // ── Vendor Bills ─────────────────────────────────────────────────

    @Get('bills')
    async listBills(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.billRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post('bills')
    async createBill(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const bill = await this.billRepo.save(
            this.billRepo.create({
                ...body,
                tenant_id: tenantId,
                status: VendorBillStatus.DRAFT,
            } as any),
        );
        return { status: 'success', data: bill };
    }

    // ── Purchase Orders ──────────────────────────────────────────────

    @Get('purchase-orders')
    async listPurchaseOrders(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const data = await this.poRepo.find({
            where: { tenant_id: tenantId } as any,
            order: { created_at: 'DESC' } as any,
        });
        return { status: 'success', data };
    }

    @Post('purchase-orders')
    async createPurchaseOrder(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: any,
    ) {
        if (!this.canManageFinance(req)) throw new ForbiddenException();
        const { lines, ...poData } = body;
        const po = await this.poRepo.save(
            this.poRepo.create({
                ...poData,
                tenant_id: tenantId,
                status: PurchaseOrderStatus.DRAFT,
            } as any),
        );
        if (lines?.length) {
            for (const line of lines) {
                await this.poLineRepo.save(
                    this.poLineRepo.create({
                        ...line,
                        tenant_id: tenantId,
                        purchase_order_id: (po as any).id,
                    } as any),
                );
            }
        }
        return { status: 'success', data: po };
    }
}
