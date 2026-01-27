import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

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
}
