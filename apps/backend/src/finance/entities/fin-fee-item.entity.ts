import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum FeeCategory { TUITION = 'TUITION', REGISTRATION = 'REGISTRATION', TRANSPORT = 'TRANSPORT', HOSTEL = 'HOSTEL', AFTERCARE = 'AFTERCARE', UNIFORM = 'UNIFORM', BOOKS = 'BOOKS', ACTIVITY = 'ACTIVITY', EXAM = 'EXAM', LEVY = 'LEVY', OTHER = 'OTHER' }
export enum FeeFrequency { MONTHLY = 'MONTHLY', QUARTERLY = 'QUARTERLY', TERM = 'TERM', ANNUAL = 'ANNUAL', ONCE = 'ONCE' }

@Entity('fin_fee_item')
@Index(['fee_structure_id'])
export class FinFeeItem {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) fee_structure_id: string;
    @Column({ type: 'enum', enum: FeeCategory }) category: FeeCategory;
    @Column({ type: 'varchar', length: 200 }) description: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'enum', enum: FeeFrequency, default: FeeFrequency.MONTHLY }) frequency: FeeFrequency;
    @Column({ type: 'uuid', nullable: true }) tax_rate_id: string;
    @Column({ type: 'uuid', nullable: true }) account_id: string;
    @CreateDateColumn() created_at: Date;
}
