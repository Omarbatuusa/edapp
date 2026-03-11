import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum FundRestriction { RESTRICTED = 'RESTRICTED', UNRESTRICTED = 'UNRESTRICTED' }

@Entity('fin_fund')
@Index(['tenant_id', 'fund_code'], { unique: true })
export class FinFund {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 20 }) fund_code: string;
    @Column({ type: 'varchar', length: 200 }) name: string;
    @Column({ type: 'varchar', length: 200, nullable: true }) donor: string;
    @Column({ type: 'enum', enum: FundRestriction, default: FundRestriction.UNRESTRICTED }) restriction_type: FundRestriction;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) balance: number;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
