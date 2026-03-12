import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { PlatformRole } from '../entities/platform-role.entity';
import { PlatformRolePermission } from '../entities/platform-role-permission.entity';
import { PlatformUserRole } from '../entities/platform-user-role.entity';
import { TenantRole } from '../entities/tenant-role.entity';
import { TenantRolePermission } from '../entities/tenant-role-permission.entity';
import { TenantMembership } from '../entities/tenant-membership.entity';
import { TenantMembershipRole } from '../entities/tenant-membership-role.entity';
import { SupportAccessGrant } from '../entities/support-access-grant.entity';
import { PermissionService } from './permission.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Permission,
            PlatformRole,
            PlatformRolePermission,
            PlatformUserRole,
            TenantRole,
            TenantRolePermission,
            TenantMembership,
            TenantMembershipRole,
            SupportAccessGrant,
        ]),
    ],
    providers: [PermissionService],
    exports: [PermissionService, TypeOrmModule],
})
export class RbacModule {}
