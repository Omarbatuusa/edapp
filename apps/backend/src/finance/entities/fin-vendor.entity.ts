import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum VendorStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE', BLOCKED = 'BLOCKED' }

@Entity('fin_vendor')
@Index(['tenant_id', 'name'])
@Index(['tenant_id', 'status'])
export class FinVendor {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 200 }) name: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) registration_number: string;
    @Column({ type: 'varchar', length: 20, nullable: true }) vat_number: string;
    @Column({ type: 'varchar', length: 200, nullable: true }) contact_email: string;
    @Column({ type: 'varchar', length: 20, nullable: true }) contact_phone: string;
    @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
    @Column({ type: 'jsonb', nullable: true }) bank_details: Record<string, any>;
    @Column({ type: 'boolean', default: false }) bank_verified: boolean;
    @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.ACTIVE }) status: VendorStatus;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
