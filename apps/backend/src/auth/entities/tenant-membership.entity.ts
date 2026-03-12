import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

export enum MembershipStatus {
    INVITED = 'invited',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    REMOVED = 'removed',
}

@Entity('tenant_memberships')
@Index(['user_id', 'tenant_id'], { unique: true })
export class TenantMembership {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @Column()
    user_id: string;

    @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
    status: MembershipStatus;

    @Column({ type: 'timestamp', nullable: true })
    joined_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    left_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
