import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PaymentProviderType { PEACH = 'PEACH', STITCH = 'STITCH', MANUAL = 'MANUAL' }

@Entity('fin_payment_provider_config')
@Index(['tenant_id', 'provider'], { unique: true })
export class FinPaymentProviderConfig {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'enum', enum: PaymentProviderType }) provider: PaymentProviderType;
    @Column({ type: 'boolean', default: false }) is_active: boolean;
    @Column({ type: 'jsonb', default: () => "'{}'" }) config: Record<string, any>;
    @Column({ type: 'jsonb', default: () => "'[]'" }) supported_methods: string[];
    @Column({ type: 'boolean', default: false }) is_default: boolean;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
