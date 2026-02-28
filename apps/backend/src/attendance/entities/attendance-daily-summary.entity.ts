import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';
import { SubjectType } from './attendance-event.entity';

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    LATE = 'LATE',
    ABSENT = 'ABSENT',
    EXCUSED = 'EXCUSED',
    LEAVE = 'LEAVE',
    EARLY_PICKUP = 'EARLY_PICKUP',
    UNKNOWN = 'UNKNOWN',
}

export interface DailySummaryFlags {
    missing_checkout?: boolean;
    outside_policy?: boolean;
    overridden?: boolean;
    register_conflict?: boolean;
}

@Entity('attendance_daily_summaries')
@Index(['tenant_id', 'branch_id', 'subject_user_id', 'date'], { unique: true })
@Index(['tenant_id', 'branch_id', 'date', 'status'])
export class AttendanceDailySummary {
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
    date: string; // YYYY-MM-DD

    @Column({ nullable: true })
    class_id: string;

    @Column({ type: 'time', nullable: true })
    earliest_check_in: string; // HH:MM:SS

    @Column({ type: 'time', nullable: true })
    latest_check_out: string;

    @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.UNKNOWN })
    status: AttendanceStatus;

    @Column({ type: 'int', default: 0 })
    late_minutes: number;

    @Column({ type: 'int', default: 0 })
    early_minutes: number;

    @Column({ type: 'int', default: 0 })
    overtime_minutes: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    total_hours_worked: number; // Staff only

    @Column({ type: 'jsonb', default: {} })
    flags: DailySummaryFlags;

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    computed_at: Date;
}
