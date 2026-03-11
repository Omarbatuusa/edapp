import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum VendorBillStatus { DRAFT = 'DRAFT', APPROVED = 'APPROVED', PARTIALLY_PAID = 'PARTIALLY_PAID', PAID = 'PAID', OVERDUE = 'OVERDUE' }

@Entity('fin_vendor_bill')
@Index(['tenant_id', 'bill_number'], { unique: true })
@Index(['tenant_id', 'vendor_id'])
@Index(['tenant_id', 'status'])
export class FinVendorBill {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 30 }) bill_number: string;
    @Column({ type: 'uuid' }) vendor_id: string;
    @Column({ type: 'uuid', nullable: true }) po_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) amount: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) tax_amount: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) total: number;
    @Column({ type: 'date' }) due_date: string;
    @Column({ type: 'enum', enum: VendorBillStatus, default: VendorBillStatus.DRAFT }) status: VendorBillStatus;
    @Column({ type: 'uuid', nullable: true }) journal_id: string;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
