import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('fin_invoice_line')
@Index(['invoice_id'])
export class FinInvoiceLine {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) invoice_id: string;
    @Column({ type: 'uuid', nullable: true }) fee_item_id: string;
    @Column({ type: 'varchar', length: 300 }) description: string;
    @Column({ type: 'int', default: 1 }) quantity: number;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) unit_price: number;
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) tax_rate: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) tax_amount: number;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) line_total: number;
    @Column({ type: 'uuid', nullable: true }) account_id: string;
}
