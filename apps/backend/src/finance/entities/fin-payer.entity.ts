import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PayerType { PARENT = 'PARENT', GUARDIAN = 'GUARDIAN', SPONSOR = 'SPONSOR', EMPLOYER = 'EMPLOYER', NGO = 'NGO' }

@Entity('fin_payer')
@Index(['tenant_id', 'family_account_id'])
@Index(['tenant_id', 'user_id'])
export class FinPayer {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) family_account_id: string;
    @Column({ type: 'uuid' }) user_id: string;
    @Column({ type: 'enum', enum: PayerType, default: PayerType.PARENT }) payer_type: PayerType;
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 }) percentage_share: number;
    @Column({ type: 'boolean', default: true }) is_primary: boolean;
    @Column({ type: 'boolean', default: true }) is_active: boolean;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
