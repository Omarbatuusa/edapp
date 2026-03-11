import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fin_tenant_settings')
@Index(['tenant_id'], { unique: true })
export class FinTenantSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 3, default: 'ZAR' })
    base_currency: string;

    @Column({ type: 'boolean', default: false })
    tax_enabled: boolean;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.00 })
    default_tax_rate: number;

    @Column({ type: 'int', default: 30 })
    default_payment_terms_days: number;

    @Column({ type: 'int', default: 1 })
    fiscal_year_start_month: number;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    auto_numbering_config: {
        invoice_prefix?: string;
        invoice_next?: number;
        receipt_prefix?: string;
        receipt_next?: number;
        journal_prefix?: string;
        journal_next?: number;
        credit_note_prefix?: string;
        credit_note_next?: number;
        po_prefix?: string;
        po_next?: number;
    };

    @Column({ type: 'boolean', default: false })
    finance_initialized: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
