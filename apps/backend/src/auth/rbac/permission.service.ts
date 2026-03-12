import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PlatformRole } from '../entities/platform-role.entity';
import { PlatformRolePermission } from '../entities/platform-role-permission.entity';
import { PlatformUserRole } from '../entities/platform-user-role.entity';
import { TenantRole } from '../entities/tenant-role.entity';
import { TenantRolePermission } from '../entities/tenant-role-permission.entity';
import { TenantMembership } from '../entities/tenant-membership.entity';
import { TenantMembershipRole } from '../entities/tenant-membership-role.entity';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
        @InjectRepository(PlatformRole) private platformRoleRepo: Repository<PlatformRole>,
        @InjectRepository(PlatformRolePermission) private platformRolePermRepo: Repository<PlatformRolePermission>,
        @InjectRepository(PlatformUserRole) private platformUserRoleRepo: Repository<PlatformUserRole>,
        @InjectRepository(TenantRole) private tenantRoleRepo: Repository<TenantRole>,
        @InjectRepository(TenantRolePermission) private tenantRolePermRepo: Repository<TenantRolePermission>,
        @InjectRepository(TenantMembership) private membershipRepo: Repository<TenantMembership>,
        @InjectRepository(TenantMembershipRole) private membershipRoleRepo: Repository<TenantMembershipRole>,
    ) {}

    /** Get all permission codes for a platform user */
    async getPlatformUserPermissions(userId: string): Promise<string[]> {
        const userRoles = await this.platformUserRoleRepo.find({
            where: { user_id: userId, is_active: true },
        });
        if (!userRoles.length) return [];

        const roleIds = userRoles.map(ur => ur.platform_role_id);
        const rolePerms = await this.platformRolePermRepo
            .createQueryBuilder('rp')
            .innerJoinAndSelect('rp.permission', 'p')
            .where('rp.platform_role_id IN (:...roleIds)', { roleIds })
            .andWhere('p.is_active = true')
            .getMany();

        return [...new Set(rolePerms.map(rp => `${rp.permission.namespace}.${rp.permission.action}`))];
    }

    /** Get all permission codes for a user within a specific tenant */
    async getTenantUserPermissions(userId: string, tenantId: string): Promise<string[]> {
        const membership = await this.membershipRepo.findOne({
            where: { user_id: userId, tenant_id: tenantId, status: 'active' as any },
        });
        if (!membership) return [];

        const memberRoles = await this.membershipRoleRepo.find({
            where: { membership_id: membership.id, is_active: true },
        });
        if (!memberRoles.length) return [];

        const roleIds = memberRoles.map(mr => mr.tenant_role_id);
        const rolePerms = await this.tenantRolePermRepo
            .createQueryBuilder('rp')
            .innerJoinAndSelect('rp.permission', 'p')
            .where('rp.tenant_role_id IN (:...roleIds)', { roleIds })
            .andWhere('p.is_active = true')
            .getMany();

        return [...new Set(rolePerms.map(rp => `${rp.permission.namespace}.${rp.permission.action}`))];
    }

    /** Check if a user has a specific permission in a tenant context */
    async hasPermission(userId: string, tenantId: string | null, permissionCode: string): Promise<boolean> {
        // Platform permissions (no tenant context)
        if (!tenantId) {
            const perms = await this.getPlatformUserPermissions(userId);
            return perms.includes(permissionCode);
        }

        // Check tenant permissions
        const tenantPerms = await this.getTenantUserPermissions(userId, tenantId);
        if (tenantPerms.includes(permissionCode)) return true;

        // Also check platform permissions (platform admins may have implicit access)
        const platformPerms = await this.getPlatformUserPermissions(userId);
        return platformPerms.includes(permissionCode);
    }

    /** List all permissions */
    async findAll(): Promise<Permission[]> {
        return this.permissionRepo.find({ where: { is_active: true }, order: { namespace: 'ASC', action: 'ASC' } });
    }

    /** List all platform roles */
    async findPlatformRoles(): Promise<PlatformRole[]> {
        return this.platformRoleRepo.find({ where: { is_active: true }, order: { code: 'ASC' } });
    }

    /** List all tenant roles (system defaults) */
    async findTenantRoles(tenantId?: string): Promise<TenantRole[]> {
        const qb = this.tenantRoleRepo.createQueryBuilder('tr')
            .where('tr.is_active = true')
            .andWhere('(tr.tenant_id IS NULL OR tr.tenant_id = :tenantId)', { tenantId: tenantId || '' })
            .orderBy('tr.role_group', 'ASC')
            .addOrderBy('tr.code', 'ASC');
        return qb.getMany();
    }
}
