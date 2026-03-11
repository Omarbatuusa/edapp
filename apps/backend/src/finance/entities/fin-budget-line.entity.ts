import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('fin_budget_line')
@Index(['budget_id', 'account_id', 'period_id'], { unique: true })
export class FinBudgetLine {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) budget_id: string;
    @Column({ type: 'uuid' }) account_id: string;
    @Column({ type: 'uuid' }) period_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) budgeted_amount: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) revised_amount: number;
}
