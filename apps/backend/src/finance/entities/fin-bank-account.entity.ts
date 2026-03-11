import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BankAccountType { CURRENT = 'CURRENT', SAVINGS = 'SAVINGS', CARD_CLEARING = 'CARD_CLEARING', GATEWAY_CLEARING = 'GATEWAY_CLEARING' }

@Entity('fin_bank_account')
@Index(['tenant_id'])
export class FinBankAccount {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 200 }) account_name: string;
    @Column({ type: 'varchar', length: 100 }) bank_name: string;
    @Column({ type: 'varchar', length: 20 }) account_number: string;
    @Column({ type: 'varchar', length: 10, nullable: true }) branch_code: string;
    @Column({ type: 'enum', enum: BankAccountType, default: BankAccountType.CURRENT }) account_type: BankAccountType;
    @Column({ type: 'uuid', nullable: true }) ledger_account_id: string;
    @Column({ type: 'boolean', default: true }) is_active: boolean;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
