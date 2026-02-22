import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { SecurityMode } from '../security/tenant-security-policy.entity';

export enum CurriculumFramework {
    CAPS = 'CAPS',
    IEB = 'IEB',
    CAMBRIDGE = 'CAMBRIDGE',
    IB = 'IB',
    TVET = 'TVET',
    ABE = 'ABE',
    OTHER = 'OTHER',
}

@Entity('branches')
@Index(['tenant_id', 'branch_code'], { unique: true }) // Unique branch code per tenant
export class Branch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @Column()
    branch_code: string; // e.g., MIDRAND, REUVEN, ROBERTSHAM

    @Column()
    branch_name: string; // e.g., "Midrand Branch"

    @Column({ default: false })
    is_main_branch: boolean; // Exactly one per tenant

    // ========== PROFILE FIELDS (stored on branch, NOT brand) ==========

    @Column({ type: 'text', nullable: true })
    about: string;

    @Column({ type: 'text', nullable: true })
    physical_address: string; // Required for production

    @Column({ nullable: true })
    mobile_whatsapp: string;

    @Column({ nullable: true })
    phone_landline: string;

    @Column({ nullable: true })
    branch_email: string;

    @Column({ nullable: true })
    secondary_email: string;

    @Column({ type: 'text', nullable: true })
    branch_enrolment_process: string;

    @Column({ nullable: true })
    emis_number: string;

    @Column({
        type: 'enum',
        enum: CurriculumFramework,
        nullable: true,
    })
    curriculum_framework: CurriculumFramework;

    // ========== STRUCTURED ADDRESS ==========

    @Column({ nullable: true })
    google_place_id: string;

    @Column({ type: 'text', nullable: true })
    formatted_address: string;

    @Column({ type: 'jsonb', nullable: true })
    address_components: {
        street?: string;
        suburb?: string;
        city?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    geo: { lat: number; lng: number };

    // ========== PHONE E.164 METADATA ==========

    @Column({ nullable: true })
    mobile_e164: string;

    @Column({ nullable: true })
    mobile_country_iso2: string;

    @Column({ nullable: true })
    mobile_dial_code: string;

    @Column({ nullable: true })
    landline_e164: string;

    @Column({ nullable: true })
    landline_country_iso2: string;

    @Column({ nullable: true })
    landline_dial_code: string;

    // ========== EMAIL VERIFICATION ==========

    @Column({ default: false })
    branch_email_verified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    branch_email_verified_at: Date;

    // ========== BRANCH HIERARCHY ==========

    @Column({ nullable: true })
    parent_branch_id: string;

    @Column({ nullable: true })
    brand_id: string;

    @Column({ nullable: true })
    school_logo_url: string;

    @Column({ nullable: true })
    cover_photo_url: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    image_gallery_urls: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ========== SECURITY FIELDS ==========

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    lat: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    lng: number;

    @Column({ default: 100 })
    geofence_radius_m: number;

    @Column({ default: true })
    geo_required_for_staff: boolean;

    @Column({ default: false })
    geo_required_for_learners: boolean;

    @Column({ default: 80 })
    geo_min_accuracy_m: number;

    @Column({
        type: 'enum',
        enum: SecurityMode,
        default: SecurityMode.WARN,
    })
    geo_policy_mode: SecurityMode;

    @Column({ type: 'simple-array', nullable: true })
    allowed_public_ips: string[];

    @Column({
        type: 'enum',
        enum: SecurityMode,
        default: SecurityMode.WARN,
    })
    ip_policy_mode: SecurityMode;

    @Column({ default: true })
    allow_ip_autodetect: boolean;
}
