import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';

export enum SubjectType {
    LEARNER = 'LEARNER',
    STAFF = 'STAFF',
}

export enum AttendanceEventType {
    CHECK_IN = 'CHECK_IN',
    CHECK_OUT = 'CHECK_OUT',
    REGISTER_MARK = 'REGISTER_MARK',
    EARLY_LEAVE_APPROVED = 'EARLY_LEAVE_APPROVED',
    OVERRIDE = 'OVERRIDE',
    STATUS_SET = 'STATUS_SET',
}

export enum AttendanceSourceType {
    KIOSK_SCAN = 'KIOSK_SCAN',
    PWA_GEO = 'PWA_GEO',
    ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
    TEACHER_REGISTER = 'TEACHER_REGISTER',
}

export enum EventPolicyDecision {
    ALLOW = 'ALLOW',
    ALLOW_FLAGGED = 'ALLOW_FLAGGED',
    BLOCK = 'BLOCK',
}

@Entity('attendance_events')
@Index(['tenant_id', 'subject_user_id', 'captured_at_server'])
@Index(['tenant_id', 'branch_id', 'captured_at_server'])
@Index(['idempotency_key'], { unique: true })
export class AttendanceEvent {
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
    subject_user_id: string; // FK to User

    @Column({ type: 'enum', enum: AttendanceEventType })
    event_type: AttendanceEventType;

    @Column({ nullable: true })
    class_id: string; // Optional FK to SchoolClass

    @Column({ type: 'timestamp' })
    captured_at_device: Date;

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    captured_at_server: Date;

    @Column({ type: 'enum', enum: AttendanceSourceType })
    source: AttendanceSourceType;

    @Column({ nullable: true })
    device_id: string; // Kiosk device ID

    @Column({ nullable: true })
    actor_user_id: string; // Who performed the action (e.g., teacher, receptionist)

    // ========== GEO/SECURITY METADATA ==========

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    captured_lat: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    captured_lng: number;

    @Column({ type: 'float', nullable: true })
    captured_accuracy_m: number;

    @Column({ nullable: true })
    client_ip: string;

    @Column({ type: 'enum', enum: EventPolicyDecision, default: EventPolicyDecision.ALLOW })
    policy_decision: EventPolicyDecision;

    @Column({ type: 'simple-array', nullable: true })
    policy_reasons: string[];

    @Column({ type: 'text', nullable: true })
    override_reason: string;

    @Column({ default: false })
    is_offline_synced: boolean;

    @Column({ unique: true })
    idempotency_key: string; // For dedup on sync

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>; // Extensible
}
