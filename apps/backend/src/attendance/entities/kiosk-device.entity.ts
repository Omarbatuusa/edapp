import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';

export enum ScanPointType {
    GATE = 'GATE',
    RECEPTION = 'RECEPTION',
    CLINIC = 'CLINIC',
    AFTERCARE = 'AFTERCARE',
    LIBRARY = 'LIBRARY',
    BUS = 'BUS',
}

@Entity('kiosk_devices')
@Index(['tenant_id', 'device_code'], { unique: true })
export class KioskDevice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column()
    branch_id: string;

    @Column()
    device_code: string; // Unique per tenant, e.g., "KIOSK-GATE-01"

    @Column()
    device_name: string; // Human-readable, e.g., "Main Gate Scanner"

    @Column({ nullable: true })
    location_label: string; // e.g., "Main Gate", "Reception Desk"

    @Column({ type: 'enum', enum: ScanPointType, default: ScanPointType.GATE })
    scan_point_type: ScanPointType;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_heartbeat_at: Date;

    @Column({ nullable: true })
    registered_by_user_id: string; // FK to User

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
