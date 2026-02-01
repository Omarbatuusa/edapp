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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
