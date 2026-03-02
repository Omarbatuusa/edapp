import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('learner_profiles')
@Index(['tenant_id', 'user_id'], { unique: true })
export class LearnerProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'uuid', nullable: true })
    enrollment_application_id: string;

    @Column({ nullable: true })
    date_of_birth: string;

    @Column({ nullable: true })
    gender_code: string;

    @Column({ nullable: true })
    religion_code: string;

    @Column({ nullable: true })
    race_code: string;

    @Column({ nullable: true })
    citizenship_type_code: string;

    @Column({ nullable: true })
    id_number: string;

    @Column({ nullable: true })
    passport_number: string;

    @Column({ nullable: true })
    permit_number: string;

    @Column({ nullable: true })
    permit_type_code: string;

    @Column({ nullable: true })
    photo_url: string;

    @Column({ type: 'jsonb', nullable: true })
    address: Record<string, any>;

    @Column({ nullable: true })
    phase_code: string;

    @Column({ nullable: true })
    grade_code: string;

    @Column({ type: 'uuid', nullable: true })
    class_id: string;

    @Column({ nullable: true })
    previous_school: string;

    @Column({ nullable: true })
    starting_date: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    repeated_grades: string[];

    @Column({ nullable: true })
    home_language_code: string;

    @Column({ nullable: true })
    fal_code: string;

    @Column({ nullable: true })
    hl_code: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    subject_ids: string[];

    @Column({ nullable: true })
    stream_code: string;

    @Column({ nullable: true })
    support_profile_code: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    educational_disabilities: string[];

    @Column({ type: 'jsonb', nullable: true })
    sias_data: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    aftercare_months: string[];

    @Column({ type: 'jsonb', nullable: true, default: [] })
    extracurricular_activities: string[];

    @Column({ type: 'jsonb', nullable: true })
    medical: Record<string, any>;

    @Column({ type: 'uuid', nullable: true })
    family_doctor_id: string;

    @Column({ type: 'uuid', nullable: true })
    family_id: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    documents: Array<{ doc_type: string; object_key: string; filename: string }>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
