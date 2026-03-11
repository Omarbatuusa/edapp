import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fin_petty_cash_fund')
@Index(['tenant_id', 'branch_id'])
export class FinPettyCashFund {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid', nullable: true }) branch_id: string;
    @Column({ type: 'uuid' }) custodian_user_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) float_amount: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) current_balance: number;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
