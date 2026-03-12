import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantRole } from './tenant-role.entity';
import { Permission } from './permission.entity';

@Entity('tenant_role_permissions')
@Index(['tenant_role_id', 'permission_id'], { unique: true })
export class TenantRolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TenantRole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_role_id' })
    tenant_role: TenantRole;

    @Column()
    tenant_role_id: string;

    @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

    @Column()
    permission_id: string;
}
