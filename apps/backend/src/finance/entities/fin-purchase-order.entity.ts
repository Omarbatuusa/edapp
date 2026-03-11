import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PurchaseOrderStatus { DRAFT = 'DRAFT', APPROVED = 'APPROVED', SENT = 'SENT', RECEIVED = 'RECEIVED', CLOSED = 'CLOSED', CANCELLED = 'CANCELLED' }

@Entity('fin_purchase_order')
@Index(['tenant_id', 'po_number'], { unique: true })
@Index(['tenant_id', 'vendor_id'])
@Index(['tenant_id', 'status'])
export class FinPurchaseOrder {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 30 }) po_number: string;
    @Column({ type: 'uuid' }) vendor_id: string;
    @Column({ type: 'date' }) order_date: string;
    @Column({ type: 'date', nullable: true }) expected_date: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) subtotal: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) tax_amount: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) total: number;
    @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT }) status: PurchaseOrderStatus;
    @Column({ type: 'text', nullable: true }) notes: string;
    @Column({ type: 'uuid', nullable: true }) created_by: string;
    @Column({ type: 'uuid', nullable: true }) approved_by: string;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
