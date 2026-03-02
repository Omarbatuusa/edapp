import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('guardian_profiles')
@Index(['tenant_id', 'user_id'])
export class GuardianProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ nullable: true })
    title_code: string;

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
    marital_status_code: string;

    @Column({ nullable: true })
    relationship_code: string;

    @Column({ nullable: true })
    photo_url: string;

    @Column({ type: 'jsonb', nullable: true })
    address: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    phone_mobile: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    phone_work: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    phone_home: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    phone_other: Record<string, any>;

    @Column({ nullable: true })
    email_primary: string;

    @Column({ nullable: true })
    email_secondary: string;

    @Column({ type: 'jsonb', nullable: true })
    communication_preferences: Record<string, any>;

    @Column({ nullable: true })
    parent_type_code: string;

    @Column({ nullable: true })
    company_name: string;

    @Column({ default: false })
    is_fee_payer: boolean;

    @Column({ nullable: true })
    payment_option_code: string;

    @Column({ nullable: true })
    occupation: string;

    @Column({ nullable: true })
    employer: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    financial_documents: Array<{ doc_type: string; object_key: string; filename: string }>;

    @Column({ default: false })
    credit_check_consent: boolean;

    @Column({ default: false })
    has_custody_order: boolean;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    documents: Array<{ doc_type: string; object_key: string; filename: string }>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
