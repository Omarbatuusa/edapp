import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

export enum TenantDomainType {
    APP = 'app',      // {tenant}.edapp.co.za
    APPLY = 'apply'   // apply-{tenant}.edapp.co.za
}

@Entity('tenant_domains')
export class TenantDomain {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @Column({ type: 'enum', enum: TenantDomainType })
    type: TenantDomainType;

    @Column({ unique: true })
    host: string; // e.g., rainbow.edapp.co.za, apply-rainbow.edapp.co.za

    @Column({ default: true })
    is_primary: boolean;

    @CreateDateColumn()
    created_at: Date;
}
