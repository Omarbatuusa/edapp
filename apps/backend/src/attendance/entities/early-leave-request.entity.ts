import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';

export enum EarlyLeaveStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

@Entity('early_leave_requests')
@Index(['tenant_id', 'branch_id', 'status'])
@Index(['tenant_id', 'learner_user_id', 'created_at'])
export class EarlyLeaveRequest {
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

    @Column()
    learner_user_id: string; // FK to User (learner)

    @Column()
    requested_by_user_id: string; // FK to User (receptionist/admin/parent)

    @Column({ type: 'text' })
    reason: string;

    // ========== PICKUP PERSON ==========

    @Column()
    pickup_person_name: string;

    @Column()
    pickup_person_relation: string; // e.g., "Mother", "Father", "Uncle"

    @Column({ nullable: true })
    pickup_person_id_number: string; // ID/Passport number

    // ========== STATUS ==========

    @Column({ type: 'enum', enum: EarlyLeaveStatus, default: EarlyLeaveStatus.PENDING })
    status: EarlyLeaveStatus;

    @Column({ nullable: true })
    approved_by_user_id: string; // FK to User

    @Column({ type: 'timestamp', nullable: true })
    approved_at: Date;

    @Column({ type: 'text', nullable: true })
    rejected_reason: string;

    @Column({ nullable: true })
    checkout_event_id: string; // FK to AttendanceEvent (linked on pickup)

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
