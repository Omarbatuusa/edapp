import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('staff_profiles')
@Index(['tenant_id', 'user_id'], { unique: true })
export class StaffProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ nullable: true })
    title_code: string;

    @Column({ nullable: true })
    id_number: string;

    @Column({ nullable: true })
    date_of_birth: string;

    @Column({ nullable: true })
    gender_code: string;

    @Column({ nullable: true })
    race_code: string;

    @Column({ nullable: true })
    religion_code: string;

    @Column({ nullable: true })
    citizenship_type_code: string;

    @Column({ nullable: true })
    passport_number: string;

    @Column({ nullable: true })
    photo_url: string;

    @Column({ type: 'jsonb', nullable: true })
    address: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    phone_mobile: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    phone_work: Record<string, any>;

    @Column({ nullable: true })
    joining_date: string;

    @Column({ nullable: true })
    employment_type_code: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    assigned_roles: string[];

    @Column({ nullable: true })
    sace_number: string;

    @Column({ nullable: true })
    teaching_level_code: string;

    @Column({ nullable: true })
    reqv_level_code: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    medical_disabilities: string[];

    @Column({ nullable: true })
    medical_aid_provider_code: string;

    @Column({ nullable: true })
    medical_aid_number: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    allergies: string[];

    @Column({ type: 'jsonb', nullable: true, default: [] })
    conditions: string[];

    @Column({ type: 'uuid', nullable: true })
    family_doctor_id: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    emergency_contacts: Array<{ contact_name: string; relationship_code?: string; mobile_number?: string; alternate_number?: string; email?: string; priority_level: number }>;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    documents: Array<{ doc_type: string; object_key: string; filename: string; uploaded_at: string }>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
