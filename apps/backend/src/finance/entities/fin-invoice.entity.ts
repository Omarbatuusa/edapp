import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum InvoiceStatus { DRAFT = 'DRAFT', ISSUED = 'ISSUED', PARTIALLY_PAID = 'PARTIALLY_PAID', PAID = 'PAID', OVERDUE = 'OVERDUE', CANCELLED = 'CANCELLED', WRITTEN_OFF = 'WRITTEN_OFF' }

@Entity('fin_invoice')
@Index(['tenant_id', 'invoice_number'], { unique: true })
@Index(['tenant_id', 'family_account_id'])
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'due_date'])
export class FinInvoice {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 30 }) invoice_number: string;
    @Column({ type: 'uuid' }) family_account_id: string;
    @Column({ type: 'uuid', nullable: true }) learner_id: string;
    @Column({ type: 'date' }) issue_date: string;
    @Column({ type: 'date' }) due_date: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) subtotal: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) tax_amount: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) total: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) amount_paid: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) balance_due: number;
    @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT }) status: InvoiceStatus;
    @Column({ type: 'uuid', nullable: true }) journal_id: string;
    @Column({ type: 'text', nullable: true }) notes: string;
    @Column({ type: 'uuid', nullable: true }) created_by: string;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
