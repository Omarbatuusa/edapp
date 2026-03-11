import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity('fin_ledger_balance')
@Index(['tenant_id', 'account_id', 'period_id'], { unique: true })
@Index(['tenant_id', 'period_id'])
export class FinLedgerBalance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    account_id: string;

    @Column({ type: 'uuid' })
    period_id: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    opening_balance: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    debit_total: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    credit_total: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    closing_balance: number;

    @UpdateDateColumn()
    updated_at: Date;
}
