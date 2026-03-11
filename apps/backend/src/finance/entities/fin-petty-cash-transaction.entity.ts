import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum PettyCashType { REPLENISH = 'REPLENISH', EXPENSE = 'EXPENSE' }

@Entity('fin_petty_cash_transaction')
@Index(['fund_id'])
export class FinPettyCashTransaction {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) fund_id: string;
    @Column({ type: 'enum', enum: PettyCashType }) type: PettyCashType;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'varchar', length: 500 }) description: string;
    @Column({ type: 'varchar', length: 500, nullable: true }) receipt_image: string;
    @Column({ type: 'uuid', nullable: true }) account_id: string;
    @Column({ type: 'uuid', nullable: true }) approved_by: string;
    @CreateDateColumn() created_at: Date;
}
