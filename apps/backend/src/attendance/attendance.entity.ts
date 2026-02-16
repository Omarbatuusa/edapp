import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/user.entity';

export enum AttendanceSource {
    PWA = 'PWA',
    KIOSK = 'KIOSK',
    MANUAL = 'MANUAL',
}

export enum PolicyDecision {
    ALLOW = 'ALLOW',
    ALLOW_FLAGGED = 'ALLOW_FLAGGED',
    BLOCK = 'BLOCK',
}

@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column()
    branch_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: string;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Column({
        type: 'enum',
        enum: AttendanceSource,
        default: AttendanceSource.PWA,
    })
    captured_source: AttendanceSource;

    // ========== SECURITY METADATA ==========

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    captured_lat: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    captured_lng: number;

    @Column({ type: 'float', nullable: true })
    captured_accuracy_m: number;

    @Column({ nullable: true })
    client_ip: string;

    @Column({ nullable: true })
    device_id: string; // captured from client storage if available

    @Column({
        type: 'enum',
        enum: PolicyDecision,
        default: PolicyDecision.ALLOW,
    })
    policy_decision: PolicyDecision;

    @Column({ type: 'simple-array', nullable: true })
    policy_reasons: string[]; // e.g., ['GEO_OUTSIDE', 'IP_NOT_ALLOWED']

    @Column({ type: 'text', nullable: true })
    override_reason: string; // If manual override was applied

    @Column({ default: false })
    is_offline_synced: boolean;

    @CreateDateColumn()
    created_at: Date;
}
