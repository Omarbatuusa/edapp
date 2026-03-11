import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum ApprovalEntityType {
    JOURNAL = 'JOURNAL',
    INVOICE = 'INVOICE',
    CREDIT_NOTE = 'CREDIT_NOTE',
    REFUND = 'REFUND',
    WRITE_OFF = 'WRITE_OFF',
    PERIOD_CLOSE = 'PERIOD_CLOSE',
    PERIOD_REOPEN = 'PERIOD_REOPEN',
    VENDOR_BANK_CHANGE = 'VENDOR_BANK_CHANGE',
    PURCHASE_ORDER = 'PURCHASE_ORDER',
    VENDOR_PAYMENT = 'VENDOR_PAYMENT',
    BUDGET_CHANGE = 'BUDGET_CHANGE',
}

@Entity('fin_approval')
@Index(['tenant_id', 'entity_type', 'entity_id'])
@Index(['tenant_id', 'status'])
export class FinApproval {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'enum', enum: ApprovalEntityType })
    entity_type: ApprovalEntityType;

    @Column({ type: 'uuid' })
    entity_id: string;

    @Column({ type: 'varchar', length: 50 })
    action: string;

    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
    status: ApprovalStatus;

    @Column({ type: 'uuid' })
    requested_by: string;

    @Column({ type: 'uuid', nullable: true })
    approved_by: string;

    @Column({ type: 'text', nullable: true })
    comments: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    resolved_at: Date;
}
