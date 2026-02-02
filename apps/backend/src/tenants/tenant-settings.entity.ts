import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_settings')
export class TenantSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @Column({ nullable: true })
    support_email: string;

    @Column({ nullable: true })
    support_name: string;

    @Column({ default: false })
    sms_enabled: boolean;

    @Column({ default: false })
    push_enabled: boolean;

    @Column({ default: true })
    email_enabled: boolean;

    // Authentication methods configuration
    @Column('simple-json', {
        nullable: true,
        default: JSON.stringify({
            google_enabled: true,
            email_password_enabled: true,
            email_magic_link_enabled: true,
            email_otp_enabled: false,
            mfa_enabled: false,
            mfa_required_roles: []
        })
    })
    auth_methods: {
        google_enabled: boolean;
        email_password_enabled: boolean;
        email_magic_link_enabled: boolean;
        email_otp_enabled: boolean;
        mfa_enabled: boolean;
        mfa_required_roles: string[];
    };

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
