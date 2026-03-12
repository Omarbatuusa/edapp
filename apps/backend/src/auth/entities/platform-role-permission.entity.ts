import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PlatformRole } from './platform-role.entity';
import { Permission } from './permission.entity';

@Entity('platform_role_permissions')
@Index(['platform_role_id', 'permission_id'], { unique: true })
export class PlatformRolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PlatformRole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'platform_role_id' })
    platform_role: PlatformRole;

    @Column()
    platform_role_id: string;

    @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

    @Column()
    permission_id: string;
}
