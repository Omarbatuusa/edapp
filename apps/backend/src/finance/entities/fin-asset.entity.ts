import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AssetStatus { ACTIVE = 'ACTIVE', DISPOSED = 'DISPOSED', WRITTEN_OFF = 'WRITTEN_OFF' }
export enum DepreciationMethod { STRAIGHT_LINE = 'STRAIGHT_LINE', REDUCING_BALANCE = 'REDUCING_BALANCE' }

@Entity('fin_asset')
@Index(['tenant_id', 'asset_number'], { unique: true })
@Index(['tenant_id', 'status'])
export class FinAsset {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 30 }) asset_number: string;
    @Column({ type: 'varchar', length: 200 }) name: string;
    @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
    @Column({ type: 'date' }) acquisition_date: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) acquisition_cost: number;
    @Column({ type: 'uuid', nullable: true }) branch_id: string;
    @Column({ type: 'varchar', length: 200, nullable: true }) location: string;
    @Column({ type: 'uuid', nullable: true }) custodian_user_id: string;
    @Column({ type: 'enum', enum: DepreciationMethod, default: DepreciationMethod.STRAIGHT_LINE }) depreciation_method: DepreciationMethod;
    @Column({ type: 'int', default: 60 }) useful_life_months: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) salvage_value: number;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) accumulated_depreciation: number;
    @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.ACTIVE }) status: AssetStatus;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
