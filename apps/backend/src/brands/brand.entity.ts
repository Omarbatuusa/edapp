import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum BrandStatus {
    ACTIVE = 'active',
    PAUSED = 'paused'
}

@Entity('brands')
export class Brand {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    brand_code: string; // e.g., RAINBOW, ALLIED, LEN, JEPPE

    @Column()
    brand_name: string; // e.g., "Rainbow City Schools"

    @Column({ type: 'enum', enum: BrandStatus, default: BrandStatus.ACTIVE })
    status: BrandStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations (for grouping only - no operational data on brand)
    // @OneToMany(() => Tenant, tenant => tenant.brand)
    // tenants: Tenant[];
}
