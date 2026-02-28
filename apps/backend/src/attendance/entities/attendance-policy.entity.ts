import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';

export interface AlertRouting {
    chain: string[]; // Role names in escalation order, e.g., ['principal', 'deputy_principal', 'tenant_admin']
    escalation_minutes: number;
}

@Entity('attendance_policies')
@Index(['tenant_id', 'branch_id'], { unique: true })
export class AttendancePolicy {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => Branch, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column({ nullable: true })
    branch_id: string; // NULL = tenant-wide default

    // ========== SCHEDULE ==========

    @Column({ type: 'simple-array', default: 'MON,TUE,WED,THU,FRI' })
    working_days: string[];

    @Column({ type: 'time', default: '07:30' })
    school_start_time: string;

    @Column({ type: 'time', default: '14:00' })
    school_end_time: string;

    @Column({ type: 'time', default: '07:00' })
    staff_shift_start: string;

    @Column({ type: 'time', default: '15:30' })
    staff_shift_end: string;

    // ========== THRESHOLDS ==========

    @Column({ type: 'int', default: 10 })
    grace_minutes: number;

    @Column({ type: 'int', default: 15 })
    overtime_grace_minutes: number;

    @Column({ type: 'int', default: 0 })
    late_threshold_minutes: number; // Additional threshold beyond grace

    @Column({ type: 'int', default: 480 })
    missing_checkout_cutoff_minutes: number; // 8 hours

    @Column({ type: 'int', default: 5 })
    anti_passback_minutes: number;

    // ========== ALERTS ==========

    @Column({ type: 'jsonb', default: { chain: ['principal', 'deputy_principal'], escalation_minutes: 30 } })
    alert_routing: AlertRouting;

    // ========== STATUS ==========

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
