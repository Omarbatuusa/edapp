import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum WalletStatus { ACTIVE = 'ACTIVE', FROZEN = 'FROZEN', CLOSED = 'CLOSED' }

@Entity('fin_wallet')
@Index(['tenant_id', 'learner_id'], { unique: true })
export class FinWallet {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) learner_id: string;
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) balance: number;
    @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE }) status: WalletStatus;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
