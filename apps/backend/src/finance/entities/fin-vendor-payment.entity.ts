import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('fin_vendor_payment')
@Index(['tenant_id', 'vendor_id'])
@Index(['tenant_id', 'bill_id'])
export class FinVendorPayment {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) vendor_id: string;
    @Column({ type: 'uuid', nullable: true }) bill_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'varchar', length: 20 }) method: string;
    @Column({ type: 'varchar', length: 20, default: 'COMPLETED' }) status: string;
    @Column({ type: 'uuid', nullable: true }) journal_id: string;
    @Column({ type: 'date' }) payment_date: string;
    @CreateDateColumn() created_at: Date;
}
