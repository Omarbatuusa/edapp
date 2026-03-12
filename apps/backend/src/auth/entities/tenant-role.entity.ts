import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

@Entity('tenant_roles')
@Index(['tenant_id', 'code'], { unique: true })
export class TenantRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ nullable: true })
    tenant_id: string; // NULL = system default template

    @Column()
    code: string; // e.g. 'tenant_admin', 'principal', 'teacher'

    @Column()
    label: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    role_group: string; // e.g. 'leadership', 'teaching', 'operations', 'support'

    @Column({ default: false })
    is_system: boolean;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    maps_to_lms_role: string;

    @CreateDateColumn()
    created_at: Date;
}
