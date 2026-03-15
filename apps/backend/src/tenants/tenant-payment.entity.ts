import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Tenant } from './tenant.entity';
import { TenantSubscription } from './tenant-subscription.entity';
import { PaymentGateway } from './tenant-subscription.entity';

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

export enum PaymentMethod {
    CARD = 'card',
    EFT = 'eft',
    DEBIT_ORDER = 'debit_order',
    MANUAL = 'manual',
}

@Entity('tenant_payments')
@Index(['tenant_id'])
@Index(['subscription_id'])
export class TenantPayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => TenantSubscription, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'subscription_id' })
    subscription: TenantSubscription;

    @Column({ nullable: true })
    subscription_id: string;

    @Column({ type: 'int' })
    amount_cents: number;

    @Column({ default: 'ZAR' })
    currency: string;

    @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
    payment_method: PaymentMethod;

    @Column({ type: 'enum', enum: PaymentGateway, nullable: true })
    gateway: PaymentGateway;

    @Column({ nullable: true })
    gateway_reference: string; // transaction ID from gateway

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({ nullable: true })
    failure_reason: string;

    @Column({ type: 'timestamptz', nullable: true })
    paid_at: Date;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'jsonb', nullable: true, default: {} })
    metadata: Record<string, any>;

    @CreateDateColumn()
    created_at: Date;
}
