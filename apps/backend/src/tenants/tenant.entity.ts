import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { Branch } from '../branches/branch.entity';

export enum TenantStatus {
    DRAFT = 'draft',
    ONBOARDING = 'onboarding',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    PAUSED = 'paused',
    ARCHIVED = 'archived',
}

export enum TenantType {
    SCHOOL = 'school',
    MAIN_BRANCH = 'main_branch',
    BRANCH = 'branch',
    CAMPUS = 'campus',
    TRAINING_CENTER = 'training_center',
    OTHER = 'other',
}

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Brand relationship (grouping only)
    @ManyToOne(() => Brand, { nullable: true })
    @JoinColumn({ name: 'brand_id' })
    brand: Brand;

    @Column({ nullable: true })
    brand_id: string;

    @Column({ unique: true })
    tenant_slug: string; // e.g., rainbow, allied, lia, jeppe

    @Column({ unique: true })
    school_code: string; // AAA## format e.g., RAI01, ALL01, LIA01, JEP01

    @Column()
    school_name: string; // Display name e.g., "Rainbow City Schools"

    @Column({ nullable: true })
    legal_name: string;

    @Column({ type: 'enum', enum: TenantType, default: TenantType.SCHOOL })
    tenant_type: TenantType;

    @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
    status: TenantStatus;

    @Column({ default: 'Africa/Johannesburg' })
    timezone: string;

    @Column({ default: 'ZAR' })
    currency: string;

    @Column({ default: 'ZA' })
    country_code: string;

    @Column({ nullable: true })
    logo_file_id: string;

    @Column({ nullable: true })
    cover_file_id: string;

    @Column({ type: 'jsonb', nullable: true, default: {} })
    settings: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true, default: {} })
    branding: Record<string, any>;

    // Adaptive Authentication Configuration
    @Column({ type: 'jsonb', nullable: true, default: {} })
    auth_config: {
        enable_email_password?: boolean;
        enable_email_magic_link?: boolean;
        enable_google_signin?: boolean;
        enable_apple_signin?: boolean;
        enable_student_pin?: boolean;
        pin_length?: number;
    };

    // Rate Limiting Configuration
    @Column({ type: 'jsonb', nullable: true, default: {} })
    rate_limit_config: {
        discovery_attempts_per_hour?: number;
        login_attempts_before_lockout?: number;
        lockout_duration_minutes?: number;
    };

    // QR Code Security
    @Column({ nullable: true })
    qr_token_secret: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Branches relation
    @OneToMany(() => Branch, (branch) => branch.tenant)
    branches: Branch[];
}
