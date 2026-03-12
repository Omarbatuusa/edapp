import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

export enum SupportAccessStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}

@Entity('support_access_grants')
export class SupportAccessGrant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @Column()
    platform_user_id: string; // The platform user gaining access

    @Column()
    granted_by_user_id: string;

    @Column({ type: 'text' })
    reason: string;

    @Column({ type: 'timestamp' })
    starts_at: Date;

    @Column({ type: 'timestamp' })
    expires_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    revoked_at: Date;

    @Column({ nullable: true })
    revoked_by_user_id: string;

    @Column({ type: 'enum', enum: SupportAccessStatus, default: SupportAccessStatus.ACTIVE })
    status: SupportAccessStatus;

    @CreateDateColumn()
    created_at: Date;
}
