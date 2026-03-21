import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum BrandStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    ARCHIVED = 'archived',
}

@Entity('brands')
export class Brand {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    brand_code: string; // e.g., RAINBOW, ALLIED, LEN, JEPPE

    @Column()
    brand_name: string; // e.g., "Rainbow City Schools"

    @Column({ unique: true, nullable: true })
    brand_slug: string; // e.g., "rainbow-city-schools"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    logo_file_id: string;

    @Column({ nullable: true })
    cover_file_id: string;

    @Column({ type: 'varchar', length: 20, default: BrandStatus.ACTIVE })
    status: BrandStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations (for grouping only - no operational data on brand)
    @OneToMany(() => Tenant, tenant => tenant.brand)
    tenants: Tenant[];
}
