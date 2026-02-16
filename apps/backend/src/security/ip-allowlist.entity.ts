import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';

@Entity('ip_allowlist')
export class IpAllowlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column()
    tenantId: string;

    @ManyToOne(() => Branch, { nullable: true })
    @JoinColumn({ name: 'branchId' })
    branch: Branch;

    @Column({ nullable: true })
    branchId: string;

    @Column()
    cidr: string;

    @Column({ nullable: true })
    label: string;

    @Column({ default: true })
    enabled: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    createdByUserId: string;
}
