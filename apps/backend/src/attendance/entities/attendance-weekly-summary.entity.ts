import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';
import { SubjectType } from './attendance-event.entity';

@Entity('attendance_weekly_summaries')
@Index(['tenant_id', 'branch_id', 'subject_user_id', 'week_start'], { unique: true })
export class AttendanceWeeklySummary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column()
    branch_id: string;

    @Column({ type: 'enum', enum: SubjectType })
    subject_type: SubjectType;

    @Column()
    subject_user_id: string;

    @Column({ type: 'date' })
    week_start: string; // Monday of the week

    @Column({ type: 'date' })
    week_end: string; // Friday of the week

    @Column({ type: 'int', default: 0 })
    days_present: number;

    @Column({ type: 'int', default: 0 })
    days_absent: number;

    @Column({ type: 'int', default: 0 })
    days_late: number;

    @Column({ type: 'int', default: 0 })
    days_excused: number;

    @Column({ type: 'int', default: 0 })
    total_late_minutes: number;

    @Column({ type: 'int', default: 0 })
    total_early_minutes: number;

    @Column({ type: 'int', default: 0 })
    total_overtime_minutes: number;

    @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
    total_hours_worked: number;

    @Column({ type: 'jsonb', default: {} })
    exception_flags: Record<string, any>;

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    computed_at: Date;
}
