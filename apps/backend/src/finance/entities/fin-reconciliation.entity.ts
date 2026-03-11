import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ReconciliationStatus { IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED' }

@Entity('fin_reconciliation')
@Index(['tenant_id', 'bank_account_id'])
export class FinReconciliation {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) bank_account_id: string;
    @Column({ type: 'uuid', nullable: true }) period_id: string;
    @Column({ type: 'date' }) statement_date: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) statement_balance: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) ledger_balance: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) reconciled_balance: number;
    @Column({ type: 'enum', enum: ReconciliationStatus, default: ReconciliationStatus.IN_PROGRESS }) status: ReconciliationStatus;
    @Column({ type: 'uuid', nullable: true }) completed_by: string;
    @Column({ type: 'timestamp', nullable: true }) completed_at: Date;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
