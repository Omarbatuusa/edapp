import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum FiscalPeriodStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    LOCKED = 'LOCKED',
}

@Entity('fin_fiscal_period')
@Index(['tenant_id', 'fiscal_year_id', 'period_number'], { unique: true })
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'start_date', 'end_date'])
export class FinFiscalPeriod {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    fiscal_year_id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @Column({ type: 'int' })
    period_number: number;

    @Column({ type: 'date' })
    start_date: string;

    @Column({ type: 'date' })
    end_date: string;

    @Column({ type: 'enum', enum: FiscalPeriodStatus, default: FiscalPeriodStatus.OPEN })
    status: FiscalPeriodStatus;

    @Column({ type: 'uuid', nullable: true })
    locked_by: string;

    @Column({ type: 'timestamp', nullable: true })
    locked_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
