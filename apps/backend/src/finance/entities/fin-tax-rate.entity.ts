import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fin_tax_rate')
@Index(['tenant_id', 'code'], { unique: true })
export class FinTaxRate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 20 })
    code: string;

    @Column({ type: 'varchar', length: 100 })
    label: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    rate: number;

    @Column({ type: 'boolean', default: false })
    is_default: boolean;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
