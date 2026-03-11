import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('fin_journal_line')
@Index(['journal_id'])
@Index(['account_id'])
@Index(['cost_centre_id'])
@Index(['branch_id'])
export class FinJournalLine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    journal_id: string;

    @Column({ type: 'uuid' })
    account_id: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    debit_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    credit_amount: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'uuid', nullable: true })
    cost_centre_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'jsonb', nullable: true })
    dimension_tags: Record<string, string>;

    @Column({ type: 'int', default: 0 })
    line_order: number;

    @CreateDateColumn()
    created_at: Date;
}
