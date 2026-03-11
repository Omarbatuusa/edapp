import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PaymentPlanStatus { ACTIVE = 'ACTIVE', COMPLETED = 'COMPLETED', DEFAULTED = 'DEFAULTED' }

@Entity('fin_payment_plan')
@Index(['tenant_id', 'family_account_id'])
export class FinPaymentPlan {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) family_account_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) total_amount: number;
    @Column({ type: 'int' }) installment_count: number;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) installment_amount: number;
    @Column({ type: 'date' }) start_date: string;
    @Column({ type: 'enum', enum: PaymentPlanStatus, default: PaymentPlanStatus.ACTIVE }) status: PaymentPlanStatus;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
