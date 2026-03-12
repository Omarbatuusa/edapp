import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { TenantMembership } from './tenant-membership.entity';
import { TenantRole } from './tenant-role.entity';

@Entity('tenant_membership_roles')
@Index(['membership_id', 'tenant_role_id'], { unique: true })
export class TenantMembershipRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TenantMembership, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'membership_id' })
    membership: TenantMembership;

    @Column()
    membership_id: string;

    @ManyToOne(() => TenantRole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_role_id' })
    tenant_role: TenantRole;

    @Column()
    tenant_role_id: string;

    @Column({ nullable: true })
    branch_id: string; // Optional branch scoping

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    granted_at: Date;

    @Column({ nullable: true })
    granted_by_user_id: string;
}
