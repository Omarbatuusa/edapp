import {
    Controller, Get, Post, Delete, Param, Body, Req,
    UseGuards, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { LinkedTenantAccess, LinkedAccessLevel } from '../../auth/entities/linked-tenant-access.entity';
import { Tenant } from '../../tenants/tenant.entity';

const ADMIN_ROLES = [
    'platform_super_admin', 'app_super_admin', 'brand_admin',
    'platform_secretary', 'app_secretary',
    'tenant_admin', 'tenant_brand_admin', 'main_branch_admin',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants')
export class AdminLinkedAccessController {
    constructor(
        @InjectRepository(LinkedTenantAccess) private accessRepo: Repository<LinkedTenantAccess>,
        @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManage(req: any): boolean {
        const role = this.getRole(req);
        return ADMIN_ROLES.some(r => role.includes(r));
    }

    /**
     * Grant a user access to a linked tenant
     */
    @Post(':tenantId/linked-access')
    async grant(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: {
            user_id: string;
            target_tenant_id: string;
            access_level?: string;
        },
    ) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        if (!body.user_id || !body.target_tenant_id) {
            throw new BadRequestException('user_id and target_tenant_id are required');
        }

        // Verify both tenants exist
        const source = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!source) throw new NotFoundException('Source tenant not found');

        const target = await this.tenantRepo.findOne({ where: { id: body.target_tenant_id } });
        if (!target) throw new NotFoundException('Target tenant not found');

        // Check for existing grant
        const existing = await this.accessRepo.findOne({
            where: { user_id: body.user_id, target_tenant_id: body.target_tenant_id } as any,
        });
        if (existing) {
            // Re-activate if previously deactivated
            existing.is_active = true;
            existing.access_level = (body.access_level as LinkedAccessLevel) || LinkedAccessLevel.FULL_ADMIN;
            return this.accessRepo.save(existing);
        }

        const grant = this.accessRepo.create({
            user_id: body.user_id,
            source_tenant_id: tenantId,
            target_tenant_id: body.target_tenant_id,
            access_level: (body.access_level as LinkedAccessLevel) || LinkedAccessLevel.FULL_ADMIN,
            granted_by_user_id: req.user?.uid || req.user?.dbUserId || null,
            is_active: true,
        });

        return this.accessRepo.save(grant);
    }

    /**
     * List linked access grants for a tenant
     */
    @Get(':tenantId/linked-access')
    async list(@Req() req: any, @Param('tenantId') tenantId: string) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        return this.accessRepo.find({
            where: [
                { source_tenant_id: tenantId, is_active: true },
                { target_tenant_id: tenantId, is_active: true },
            ],
            relations: ['source_tenant', 'target_tenant'],
            order: { created_at: 'DESC' },
        });
    }

    /**
     * Revoke a linked access grant
     */
    @Delete(':tenantId/linked-access/:id')
    async revoke(@Req() req: any, @Param('id') id: string) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        const grant = await this.accessRepo.findOne({ where: { id } });
        if (!grant) throw new NotFoundException('Access grant not found');

        grant.is_active = false;
        await this.accessRepo.save(grant);
        return { success: true };
    }
}

/**
 * Separate controller for the user-facing "my linked tenants" endpoint.
 * Mounted at /auth/ path since it's about the current user's access.
 */
@UseGuards(FirebaseAuthGuard)
@Controller('auth')
export class MyLinkedTenantsController {
    constructor(
        @InjectRepository(LinkedTenantAccess) private accessRepo: Repository<LinkedTenantAccess>,
        @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    ) {}

    /**
     * Get all tenants the current user can switch into
     */
    @Get('my-linked-tenants')
    async getMyLinkedTenants(@Req() req: any) {
        const userId = req.user?.uid || req.user?.dbUserId;
        if (!userId) throw new ForbiddenException('Not authenticated');

        const grants = await this.accessRepo.find({
            where: { user_id: userId, is_active: true },
            relations: ['target_tenant', 'source_tenant'],
        });

        return grants.map(g => ({
            id: g.id,
            access_level: g.access_level,
            source_tenant: g.source_tenant ? {
                id: g.source_tenant.id,
                school_name: g.source_tenant.school_name,
                tenant_slug: g.source_tenant.tenant_slug,
                tenant_type: g.source_tenant.tenant_type,
                area_label: (g.source_tenant as any).area_label,
                logo_file_id: g.source_tenant.logo_file_id,
            } : null,
            target_tenant: g.target_tenant ? {
                id: g.target_tenant.id,
                school_name: g.target_tenant.school_name,
                tenant_slug: g.target_tenant.tenant_slug,
                tenant_type: g.target_tenant.tenant_type,
                area_label: (g.target_tenant as any).area_label,
                logo_file_id: g.target_tenant.logo_file_id,
            } : null,
        }));
    }
}
