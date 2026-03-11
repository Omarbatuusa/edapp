import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum HoldType { EXAM_RESULTS = 'EXAM_RESULTS', REPORT_CARD = 'REPORT_CARD', RE_REGISTRATION = 'RE_REGISTRATION', SERVICE_ACCESS = 'SERVICE_ACCESS' }

@Entity('fin_hold')
@Index(['tenant_id', 'family_account_id'])
@Index(['tenant_id', 'is_active'])
export class FinHold {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) family_account_id: string;
    @Column({ type: 'uuid', nullable: true }) learner_id: string;
    @Column({ type: 'enum', enum: HoldType }) hold_type: HoldType;
    @Column({ type: 'text', nullable: true }) reason: string;
    @Column({ type: 'uuid', nullable: true }) applied_by: string;
    @CreateDateColumn() applied_at: Date;
    @Column({ type: 'uuid', nullable: true }) released_by: string;
    @Column({ type: 'timestamp', nullable: true }) released_at: Date;
    @Column({ type: 'boolean', default: true }) is_active: boolean;
}
