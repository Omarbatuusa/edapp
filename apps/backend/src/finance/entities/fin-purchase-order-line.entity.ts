import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('fin_purchase_order_line')
@Index(['purchase_order_id'])
export class FinPurchaseOrderLine {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) purchase_order_id: string;
    @Column({ type: 'varchar', length: 300 }) description: string;
    @Column({ type: 'int', default: 1 }) quantity: number;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) unit_price: number;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) line_total: number;
    @Column({ type: 'uuid', nullable: true }) account_id: string;
    @Column({ type: 'uuid', nullable: true }) tax_rate_id: string;
}
