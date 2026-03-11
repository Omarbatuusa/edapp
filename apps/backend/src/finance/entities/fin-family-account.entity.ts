import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum FamilyAccountStatus { ACTIVE = 'ACTIVE', SUSPENDED = 'SUSPENDED', CLOSED = 'CLOSED' }

@Entity('fin_family_account')
@Index(['tenant_id', 'family_id'], { unique: true })
@Index(['tenant_id', 'status'])
export class FinFamilyAccount {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) family_id: string;
    @Column({ type: 'varchar', length: 20 }) account_number: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) balance: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) credit_limit: number;
    @Column({ type: 'enum', enum: FamilyAccountStatus, default: FamilyAccountStatus.ACTIVE }) status: FamilyAccountStatus;
    @Column({ type: 'int', default: 30 }) payment_terms_days: number;
    @Column({ type: 'boolean', default: false }) auto_pay_enabled: boolean;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
