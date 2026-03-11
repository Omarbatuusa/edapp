import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('fin_receipt')
@Index(['tenant_id', 'receipt_number'], { unique: true })
@Index(['tenant_id', 'family_account_id'])
export class FinReceipt {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 30 }) receipt_number: string;
    @Column({ type: 'uuid' }) family_account_id: string;
    @Column({ type: 'uuid', nullable: true }) payment_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'date' }) receipt_date: string;
    @Column({ type: 'uuid', nullable: true }) journal_id: string;
    @Column({ type: 'text', nullable: true }) notes: string;
    @CreateDateColumn() created_at: Date;
}
