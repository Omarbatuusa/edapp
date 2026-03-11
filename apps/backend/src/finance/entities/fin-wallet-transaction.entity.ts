import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum WalletTransactionType { TOPUP = 'TOPUP', SPEND = 'SPEND', REFUND = 'REFUND' }

@Entity('fin_wallet_transaction')
@Index(['wallet_id'])
export class FinWalletTransaction {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) wallet_id: string;
    @Column({ type: 'enum', enum: WalletTransactionType }) type: WalletTransactionType;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'varchar', length: 200, nullable: true }) reference: string;
    @Column({ type: 'varchar', length: 500, nullable: true }) description: string;
    @CreateDateColumn() created_at: Date;
}
