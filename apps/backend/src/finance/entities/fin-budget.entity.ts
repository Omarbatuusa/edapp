import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BudgetStatus { DRAFT = 'DRAFT', APPROVED = 'APPROVED', ACTIVE = 'ACTIVE' }

@Entity('fin_budget')
@Index(['tenant_id', 'fiscal_year_id'])
export class FinBudget {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) fiscal_year_id: string;
    @Column({ type: 'varchar', length: 200 }) name: string;
    @Column({ type: 'uuid', nullable: true }) branch_id: string;
    @Column({ type: 'varchar', length: 100, nullable: true }) department: string;
    @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.DRAFT }) status: BudgetStatus;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
