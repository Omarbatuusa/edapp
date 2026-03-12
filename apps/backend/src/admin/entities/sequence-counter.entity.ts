import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

@Entity('sequence_counters')
@Index(['tenant_id', 'sequence_type'], { unique: true })
export class SequenceCounter {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @Column()
    sequence_type: string; // 'family', 'learner', 'staff', 'invoice'

    @Column({ type: 'bigint', default: 0 })
    current_value: number;

    @Column()
    prefix: string; // e.g. 'ALL-001' (tenant school_code)
}
