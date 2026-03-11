import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PaymentMethod { CARD = 'CARD', EFT = 'EFT', DEBIT_ORDER = 'DEBIT_ORDER', CASH = 'CASH', SCAN_TO_PAY = 'SCAN_TO_PAY', CHEQUE = 'CHEQUE' }
export enum PaymentStatus { INITIATED = 'INITIATED', PENDING = 'PENDING', AUTHORISED = 'AUTHORISED', SUCCEEDED = 'SUCCEEDED', FAILED = 'FAILED', EXPIRED = 'EXPIRED', CANCELLED = 'CANCELLED', REVERSED = 'REVERSED', REFUNDED = 'REFUNDED', DISPUTED = 'DISPUTED' }

@Entity('fin_payment')
@Index(['tenant_id', 'family_account_id'])
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'provider_reference'])
@Index(['idempotency_key'], { unique: true })
export class FinPayment {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) family_account_id: string;
    @Column({ type: 'uuid', nullable: true }) invoice_id: string;
    @Column({ type: 'varchar', length: 20, nullable: true }) provider: string;
    @Column({ type: 'varchar', length: 200, nullable: true }) provider_reference: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'varchar', length: 3, default: 'ZAR' }) currency: string;
    @Column({ type: 'enum', enum: PaymentMethod }) method: PaymentMethod;
    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.INITIATED }) status: PaymentStatus;
    @Column({ type: 'varchar', length: 100 }) idempotency_key: string;
    @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, any>;
    @Column({ type: 'uuid', nullable: true }) journal_id: string;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
