import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { Branch } from '../branches/branch.entity';

export enum TenantStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    ARCHIVED = 'archived'
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

    @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
    status: TenantStatus;

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
