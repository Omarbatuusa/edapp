import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EnrollmentStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    WAITLISTED = 'WAITLISTED',
}

@Entity('enrollment_applications')
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'branch_id'])
export class EnrollmentApplication {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.DRAFT })
    status: EnrollmentStatus;

    @Column({ type: 'int', default: 1 })
    current_step: number;

    @Column({ type: 'jsonb', default: {} })
    placement_data: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    learner_data: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    academic_data: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    subjects_data: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    aftercare_data: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    medical_data: Record<string, any>;

    @Column({ type: 'jsonb', default: '[]' })
    guardians_data: Record<string, any>[];

    @Column({ type: 'jsonb', default: '[]' })
    emergency_contacts: Record<string, any>[];

    @Column({ type: 'jsonb', default: '[]' })
    uploaded_documents: Array<{ doc_type: string; object_key: string; filename: string; uploaded_at: string }>;

    @Column({ default: false })
    document_checklist_ack: boolean;

    @Column({ default: false })
    acceptance_ack: boolean;

    @Column({ nullable: true })
    submitted_by_email: string;

    @Column({ nullable: true })
    submitted_by_phone: string;

    @Column({ type: 'timestamp', nullable: true })
    submitted_at: Date;

    @Column({ nullable: true })
    reviewed_by_user_id: string;

    @Column({ type: 'text', nullable: true })
    rejection_reason: string;

    @Column({ type: 'uuid', nullable: true })
    created_learner_user_id: string;

    @Column({ type: 'uuid', nullable: true })
    created_family_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
