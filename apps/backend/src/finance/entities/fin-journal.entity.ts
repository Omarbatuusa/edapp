import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum JournalStatus {
    DRAFT = 'DRAFT',
    POSTED = 'POSTED',
    REVERSED = 'REVERSED',
}

export enum JournalSourceType {
    MANUAL = 'MANUAL',
    INVOICE = 'INVOICE',
    PAYMENT = 'PAYMENT',
    RECEIPT = 'RECEIPT',
    CREDIT_NOTE = 'CREDIT_NOTE',
    REVERSAL = 'REVERSAL',
    ADJUSTMENT = 'ADJUSTMENT',
    DEPRECIATION = 'DEPRECIATION',
    OPENING_BALANCE = 'OPENING_BALANCE',
    WRITE_OFF = 'WRITE_OFF',
    TRANSFER = 'TRANSFER',
}

@Entity('fin_journal')
@Index(['tenant_id', 'journal_number'], { unique: true })
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'period_id'])
@Index(['tenant_id', 'source_type', 'source_id'])
@Index(['tenant_id', 'journal_date'])
export class FinJournal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 30 })
    journal_number: string;

    @Column({ type: 'date' })
    journal_date: string;

    @Column({ type: 'date', nullable: true })
    posting_date: string;

    @Column({ type: 'uuid', nullable: true })
    period_id: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: JournalSourceType, default: JournalSourceType.MANUAL })
    source_type: JournalSourceType;

    @Column({ type: 'uuid', nullable: true })
    source_id: string;

    @Column({ type: 'enum', enum: JournalStatus, default: JournalStatus.DRAFT })
    status: JournalStatus;

    @Column({ type: 'uuid', nullable: true })
    posted_by: string;

    @Column({ type: 'timestamp', nullable: true })
    posted_at: Date;

    @Column({ type: 'uuid', nullable: true })
    reversed_by_journal_id: string;

    @Column({ type: 'uuid', nullable: true })
    reversal_of_journal_id: string;

    @Column({ type: 'uuid', nullable: true })
    created_by: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    total_debit: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    total_credit: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
