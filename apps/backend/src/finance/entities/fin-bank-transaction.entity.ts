import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum MatchedStatus { UNMATCHED = 'UNMATCHED', AUTO_MATCHED = 'AUTO_MATCHED', MANUALLY_MATCHED = 'MANUALLY_MATCHED', EXCLUDED = 'EXCLUDED' }

@Entity('fin_bank_transaction')
@Index(['tenant_id', 'bank_account_id'])
@Index(['tenant_id', 'matched_status'])
export class FinBankTransaction {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) bank_account_id: string;
    @Column({ type: 'date' }) transaction_date: string;
    @Column({ type: 'varchar', length: 500 }) description: string;
    @Column({ type: 'varchar', length: 100, nullable: true }) reference: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'varchar', length: 10 }) type: string;
    @Column({ type: 'enum', enum: MatchedStatus, default: MatchedStatus.UNMATCHED }) matched_status: MatchedStatus;
    @Column({ type: 'uuid', nullable: true }) matched_journal_id: string;
    @CreateDateColumn() imported_at: Date;
}
