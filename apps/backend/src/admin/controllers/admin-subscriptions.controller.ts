import {
    Controller, Get, Post, Put, Patch, Body, Param, Query,
    UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Tenant, TenantStatus } from '../../tenants/tenant.entity';
import { TenantSubscription, SubscriptionPlan, SubscriptionStatus, PaymentGateway } from '../../tenants/tenant-subscription.entity';
import { TenantPayment, PaymentStatus, PaymentMethod } from '../../tenants/tenant-payment.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin'];

function getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
}

@UseGuards(FirebaseAuthGuard)
@Controller('admin/subscriptions')
export class AdminSubscriptionsController {
    constructor(
        @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
        @InjectRepository(TenantSubscription) private subRepo: Repository<TenantSubscription>,
        @InjectRepository(TenantPayment) private paymentRepo: Repository<TenantPayment>,
        @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
    ) { }

    private isPlatform(req: any): boolean {
        const role = getRole(req);
        return PLATFORM_ROLES.some(r => role.includes(r));
    }

    private getUserId(req: any): string {
        return req.user?.sub || req.user?.uid || '';
    }

    private async log(req: any, action: AuditAction, details: Record<string, any>) {
        await this.auditRepo.save({
            user_id: this.getUserId(req),
            action,
            details,
            ip_address: req.ip,
        } as Partial<AuditEvent>);
    }

    // ═══════════════════════════════════════════════
    // GET /admin/subscriptions/tenant/:tenantId — Get subscription for a tenant
    // ═══════════════════════════════════════════════
    @Get('tenant/:tenantId')
    async getSubscription(@Param('tenantId') tenantId: string, @Req() req: any) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        const subscription = await this.subRepo.findOne({
            where: { tenant_id: tenantId },
            order: { created_at: 'DESC' },
        });

        const payments = await this.paymentRepo.find({
            where: { tenant_id: tenantId },
            order: { created_at: 'DESC' },
            take: 10,
        });

        return {
            tenant: {
                id: tenant.id,
                school_name: tenant.school_name,
                tenant_slug: tenant.tenant_slug,
                status: tenant.status,
                subscription_status: tenant.subscription_status,
                subscription_ends_at: tenant.subscription_ends_at,
                subscription_plan: tenant.subscription_plan,
                suspended_at: tenant.suspended_at,
                suspended_by: tenant.suspended_by,
                suspension_reason: tenant.suspension_reason,
            },
            subscription: subscription || null,
            recent_payments: payments,
        };
    }

    // ═══════════════════════════════════════════════
    // GET /admin/subscriptions/my — Get current tenant's subscription (for tenants themselves)
    // ═══════════════════════════════════════════════
    @Get('my')
    async getMySubscription(@Req() req: any) {
        const tenantId = req.user?.tenant_id || req.headers['x-tenant-id'];
        if (!tenantId) throw new BadRequestException('No tenant context');

        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        const subscription = await this.subRepo.findOne({
            where: { tenant_id: tenantId },
            order: { created_at: 'DESC' },
        });

        return {
            subscription_status: tenant.subscription_status,
            subscription_plan: tenant.subscription_plan,
            subscription_ends_at: tenant.subscription_ends_at,
            suspended_at: tenant.suspended_at,
            suspension_reason: tenant.suspension_reason,
            subscription: subscription || null,
        };
    }

    // ═══════════════════════════════════════════════
    // POST /admin/subscriptions — Create/set subscription (platform admin)
    // ═══════════════════════════════════════════════
    @Post()
    async createSubscription(@Body() body: any, @Req() req: any) {
        if (!this.isPlatform(req)) throw new ForbiddenException('Platform admin required');

        const { tenant_id, plan, amount_cents, starts_at, ends_at, trial_ends_at, payment_gateway, auto_renew } = body;
        if (!tenant_id || !plan || !starts_at || !ends_at) {
            throw new BadRequestException('tenant_id, plan, starts_at, and ends_at are required');
        }

        const tenant = await this.tenantRepo.findOne({ where: { id: tenant_id } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        const now = new Date();
        const endsAt = new Date(ends_at);
        const isTrialPeriod = trial_ends_at && new Date(trial_ends_at) > now;
        const status = isTrialPeriod ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE;

        const subscription = await this.subRepo.save({
            tenant_id,
            plan: plan as SubscriptionPlan,
            status,
            amount_cents: amount_cents || 0,
            currency: 'ZAR',
            starts_at: new Date(starts_at),
            ends_at: endsAt,
            trial_ends_at: trial_ends_at ? new Date(trial_ends_at) : null,
            payment_gateway: payment_gateway || null,
            auto_renew: auto_renew !== false,
            next_billing_at: endsAt,
        } as Partial<TenantSubscription>);

        // Update tenant denormalized fields
        await this.tenantRepo.update(tenant_id, {
            subscription_status: status,
            subscription_ends_at: endsAt,
            subscription_plan: plan,
            status: TenantStatus.ACTIVE,
            suspended_at: null as any,
            suspended_by: null as any,
            suspension_reason: null as any,
        });

        await this.log(req, AuditAction.SETTINGS_UPDATED, {
            entity: 'tenant_subscription',
            tenant_id,
            plan,
            starts_at,
            ends_at,
            status,
        });

        return { success: true, subscription };
    }

    // ═══════════════════════════════════════════════
    // PUT /admin/subscriptions/:id — Update subscription
    // ═══════════════════════════════════════════════
    @Put(':id')
    async updateSubscription(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        if (!this.isPlatform(req)) throw new ForbiddenException('Platform admin required');

        const sub = await this.subRepo.findOne({ where: { id } });
        if (!sub) throw new NotFoundException('Subscription not found');

        const updates: Partial<TenantSubscription> = {};
        if (body.plan) updates.plan = body.plan;
        if (body.amount_cents !== undefined) updates.amount_cents = body.amount_cents;
        if (body.ends_at) updates.ends_at = new Date(body.ends_at);
        if (body.status) updates.status = body.status;
        if (body.auto_renew !== undefined) updates.auto_renew = body.auto_renew;
        if (body.payment_gateway) updates.payment_gateway = body.payment_gateway;

        await this.subRepo.update(id, updates);

        // Sync tenant denormalized fields
        const tenantUpdates: any = {};
        if (body.status) tenantUpdates.subscription_status = body.status;
        if (body.ends_at) tenantUpdates.subscription_ends_at = new Date(body.ends_at);
        if (body.plan) tenantUpdates.subscription_plan = body.plan;
        if (Object.keys(tenantUpdates).length > 0) {
            await this.tenantRepo.update(sub.tenant_id, tenantUpdates);
        }

        return { success: true };
    }

    // ═══════════════════════════════════════════════
    // POST /admin/subscriptions/suspend/:tenantId — Suspend tenant
    // ═══════════════════════════════════════════════
    @Post('suspend/:tenantId')
    async suspendTenant(
        @Param('tenantId') tenantId: string,
        @Body() body: { reason?: string },
        @Req() req: any,
    ) {
        if (!this.isPlatform(req)) throw new ForbiddenException('Platform admin required');

        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        await this.tenantRepo.update(tenantId, {
            status: TenantStatus.SUSPENDED,
            subscription_status: 'suspended',
            suspended_at: new Date(),
            suspended_by: this.getUserId(req),
            suspension_reason: body.reason || 'Suspended by platform admin',
        });

        // Also mark subscription as cancelled if it exists
        const activeSub = await this.subRepo.findOne({
            where: { tenant_id: tenantId, status: SubscriptionStatus.ACTIVE },
        });
        if (activeSub) {
            await this.subRepo.update(activeSub.id, {
                status: SubscriptionStatus.CANCELLED,
                cancelled_at: new Date(),
                cancelled_by: this.getUserId(req),
                cancellation_reason: body.reason || 'Tenant suspended',
            });
        }

        await this.log(req, AuditAction.SETTINGS_UPDATED, {
            entity: 'tenant_suspend',
            tenant_id: tenantId,
            reason: body.reason,
        });

        return { success: true, message: 'Tenant suspended' };
    }

    // ═══════════════════════════════════════════════
    // POST /admin/subscriptions/unsuspend/:tenantId — Unsuspend tenant
    // ═══════════════════════════════════════════════
    @Post('unsuspend/:tenantId')
    async unsuspendTenant(
        @Param('tenantId') tenantId: string,
        @Req() req: any,
    ) {
        if (!this.isPlatform(req)) throw new ForbiddenException('Platform admin required');

        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        // Check if subscription is still valid
        const latestSub = await this.subRepo.findOne({
            where: { tenant_id: tenantId },
            order: { created_at: 'DESC' },
        });

        const now = new Date();
        const hasValidSub = latestSub && new Date(latestSub.ends_at) > now;

        await this.tenantRepo.update(tenantId, {
            status: TenantStatus.ACTIVE,
            subscription_status: hasValidSub ? 'active' : 'expired',
            suspended_at: null as any,
            suspended_by: null as any,
            suspension_reason: null as any,
        });

        if (hasValidSub && latestSub) {
            await this.subRepo.update(latestSub.id, { status: SubscriptionStatus.ACTIVE });
        }

        await this.log(req, AuditAction.SETTINGS_UPDATED, {
            entity: 'tenant_unsuspend',
            tenant_id: tenantId,
        });

        return { success: true, message: 'Tenant unsuspended' };
    }

    // ═══════════════════════════════════════════════
    // POST /admin/subscriptions/record-payment — Record a manual payment
    // ═══════════════════════════════════════════════
    @Post('record-payment')
    async recordPayment(@Body() body: any, @Req() req: any) {
        if (!this.isPlatform(req)) throw new ForbiddenException('Platform admin required');

        const { tenant_id, subscription_id, amount_cents, payment_method, description } = body;
        if (!tenant_id || !amount_cents) {
            throw new BadRequestException('tenant_id and amount_cents are required');
        }

        const payment = await this.paymentRepo.save({
            tenant_id,
            subscription_id: subscription_id || null,
            amount_cents,
            currency: 'ZAR',
            payment_method: payment_method || PaymentMethod.MANUAL,
            gateway: PaymentGateway.MANUAL,
            status: PaymentStatus.SUCCEEDED,
            paid_at: new Date(),
            description: description || 'Manual payment recorded',
        } as Partial<TenantPayment>);

        // Update subscription last_payment_at if linked
        if (subscription_id) {
            await this.subRepo.update(subscription_id, { last_payment_at: new Date() });
        }

        await this.log(req, AuditAction.SETTINGS_UPDATED, {
            entity: 'tenant_payment',
            tenant_id,
            amount_cents,
            payment_method,
        });

        return { success: true, payment };
    }

    // ═══════════════════════════════════════════════
    // GET /admin/subscriptions/check/:tenantSlug — Public check for subscription status
    // Used by frontend to gate access
    // ═══════════════════════════════════════════════
    @Get('check/:tenantSlug')
    async checkSubscriptionBySlug(@Param('tenantSlug') tenantSlug: string) {
        const tenant = await this.tenantRepo.findOne({ where: { tenant_slug: tenantSlug } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        const now = new Date();
        const isExpired = tenant.subscription_ends_at && new Date(tenant.subscription_ends_at) < now;
        const isSuspended = tenant.status === TenantStatus.SUSPENDED;
        const hasNoSubscription = !tenant.subscription_status;

        return {
            tenant_slug: tenantSlug,
            school_name: tenant.school_name,
            subscription_status: tenant.subscription_status || (hasNoSubscription ? null : 'expired'),
            subscription_plan: tenant.subscription_plan,
            subscription_ends_at: tenant.subscription_ends_at,
            is_suspended: isSuspended,
            is_expired: isExpired && !isSuspended,
            is_active: !isSuspended && !isExpired && tenant.subscription_status === 'active',
            suspension_reason: isSuspended ? tenant.suspension_reason : null,
        };
    }
}
