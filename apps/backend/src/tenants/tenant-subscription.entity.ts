import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from './tenant.entity';

export enum SubscriptionPlan {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUAL = 'annual',
}

export enum SubscriptionStatus {
    TRIAL = 'trial',
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
}

export enum PaymentGateway {
    STITCH = 'stitch',
    PEACH = 'peach',
    MANUAL = 'manual',
}

@Entity('tenant_subscriptions')
@Index(['tenant_id'])
export class TenantSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @Column({ type: 'enum', enum: SubscriptionPlan })
    plan: SubscriptionPlan;

    @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
    status: SubscriptionStatus;

    // Pricing
    @Column({ type: 'int', default: 0 })
    amount_cents: number; // e.g., 99900 = R999.00

    @Column({ default: 'ZAR' })
    currency: string;

    // Dates
    @Column({ type: 'timestamptz' })
    starts_at: Date;

    @Column({ type: 'timestamptz' })
    ends_at: Date;

    @Column({ type: 'timestamptz', nullable: true })
    trial_ends_at: Date;

    // Payment gateway
    @Column({ type: 'enum', enum: PaymentGateway, nullable: true })
    payment_gateway: PaymentGateway;

    @Column({ nullable: true })
    gateway_subscription_id: string; // Reference in Stitch/Peach

    @Column({ nullable: true })
    gateway_customer_id: string;

    // Billing
    @Column({ type: 'timestamptz', nullable: true })
    last_payment_at: Date;

    @Column({ type: 'timestamptz', nullable: true })
    next_billing_at: Date;

    @Column({ default: true })
    auto_renew: boolean;

    // Cancellation
    @Column({ type: 'timestamptz', nullable: true })
    cancelled_at: Date;

    @Column({ nullable: true })
    cancellation_reason: string;

    @Column({ nullable: true })
    cancelled_by: string; // user_id who cancelled

    // Metadata
    @Column({ type: 'jsonb', nullable: true, default: {} })
    metadata: Record<string, any>; // flexible field for gateway-specific data

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
