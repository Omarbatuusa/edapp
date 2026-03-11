import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BursaryStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', ACTIVE = 'ACTIVE', EXPIRED = 'EXPIRED' }

@Entity('fin_learner_bursary')
@Index(['tenant_id', 'learner_id'])
export class FinLearnerBursary {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) learner_id: string;
    @Column({ type: 'uuid' }) discount_rule_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true }) custom_amount: number;
    @Column({ type: 'date' }) start_date: string;
    @Column({ type: 'date', nullable: true }) end_date: string;
    @Column({ type: 'uuid', nullable: true }) approved_by: string;
    @Column({ type: 'enum', enum: BursaryStatus, default: BursaryStatus.PENDING }) status: BursaryStatus;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
