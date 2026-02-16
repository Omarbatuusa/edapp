import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';
import { SecurityMode } from './tenant-security-policy.entity';

@Entity('branch_security_policies')
export class BranchSecurityPolicy {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column()
    tenantId: string;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branchId' })
    branch: Branch;

    @Column()
    branchId: string;

    @Column({
        type: 'enum',
        enum: SecurityMode,
        nullable: true,
    })
    geoMode: SecurityMode;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    geoCenterLat: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    geoCenterLng: number;

    @Column({ nullable: true })
    geoRadiusM: number;

    @Column({ nullable: true })
    geoAccuracyThresholdM: number;

    @Column({
        type: 'enum',
        enum: SecurityMode,
        nullable: true,
    })
    ipMode: SecurityMode;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    updatedByUserId: string;
}
