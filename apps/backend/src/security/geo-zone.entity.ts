import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';

@Entity('geo_zones')
export class GeoZone {
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
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    centerLat: number;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    centerLng: number;

    @Column()
    radiusM: number;

    @Column({ default: true })
    enabled: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    createdByUserId: string;
}
