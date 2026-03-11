import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum FinAccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE',
}

export enum FinAccountSubType {
    // Assets
    CURRENT_ASSET = 'CURRENT_ASSET',
    BANK = 'BANK',
    CASH = 'CASH',
    ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
    FIXED_ASSET = 'FIXED_ASSET',
    ACCUMULATED_DEPRECIATION = 'ACCUMULATED_DEPRECIATION',
    PREPAID = 'PREPAID',
    OTHER_ASSET = 'OTHER_ASSET',
    // Liabilities
    CURRENT_LIABILITY = 'CURRENT_LIABILITY',
    ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
    TAX_PAYABLE = 'TAX_PAYABLE',
    ACCRUED = 'ACCRUED',
    DEFERRED_REVENUE = 'DEFERRED_REVENUE',
    LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
    OTHER_LIABILITY = 'OTHER_LIABILITY',
    // Equity
    RETAINED_EARNINGS = 'RETAINED_EARNINGS',
    OPENING_BALANCE = 'OPENING_BALANCE',
    OTHER_EQUITY = 'OTHER_EQUITY',
    // Revenue
    OPERATING_REVENUE = 'OPERATING_REVENUE',
    OTHER_INCOME = 'OTHER_INCOME',
    // Expense
    OPERATING_EXPENSE = 'OPERATING_EXPENSE',
    COST_OF_SALES = 'COST_OF_SALES',
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    OTHER_EXPENSE = 'OTHER_EXPENSE',
}

@Entity('fin_account')
@Index(['tenant_id', 'code'], { unique: true })
@Index(['tenant_id', 'account_type'])
@Index(['tenant_id', 'is_active'])
export class FinAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 20 })
    code: string;

    @Column({ type: 'varchar', length: 200 })
    name: string;

    @Column({ type: 'enum', enum: FinAccountType })
    account_type: FinAccountType;

    @Column({ type: 'enum', enum: FinAccountSubType, nullable: true })
    sub_type: FinAccountSubType;

    @Column({ type: 'uuid', nullable: true })
    parent_id: string;

    @Column({ type: 'boolean', default: false })
    is_header: boolean;

    @Column({ type: 'boolean', default: false })
    is_system: boolean;

    @Column({ type: 'varchar', length: 3, default: 'ZAR' })
    currency: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int', default: 0 })
    sort_order: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
