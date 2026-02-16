import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum SecurityMode {
    OFF = 'OFF',
    WARN = 'WARN',
    ENFORCE = 'ENFORCE',
}

@Entity('tenant_security_policies')
export class TenantSecurityPolicy {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column()
    tenantId: string;

    @Column({
        type: 'enum',
        enum: SecurityMode,
        default: SecurityMode.WARN,
    })
    geoMode: SecurityMode;

    @Column({ default: 80 })
    geoAccuracyThresholdM: number;

    @Column({ default: 120 })
    geoMaxAgeSeconds: number;

    @Column({
        type: 'enum',
        enum: SecurityMode,
        default: SecurityMode.WARN,
    })
    ipMode: SecurityMode;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    updatedByUserId: string;
}
