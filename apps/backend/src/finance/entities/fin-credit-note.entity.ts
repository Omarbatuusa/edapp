import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CreditNoteStatus { DRAFT = 'DRAFT', ISSUED = 'ISSUED', APPLIED = 'APPLIED' }

@Entity('fin_credit_note')
@Index(['tenant_id', 'credit_note_number'], { unique: true })
@Index(['tenant_id', 'family_account_id'])
export class FinCreditNote {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 30 }) credit_note_number: string;
    @Column({ type: 'uuid' }) family_account_id: string;
    @Column({ type: 'uuid', nullable: true }) invoice_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'text', nullable: true }) reason: string;
    @Column({ type: 'enum', enum: CreditNoteStatus, default: CreditNoteStatus.DRAFT }) status: CreditNoteStatus;
    @Column({ type: 'uuid', nullable: true }) journal_id: string;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
