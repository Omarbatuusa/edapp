import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum FiscalYearStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    LOCKED = 'LOCKED',
}

@Entity('fin_fiscal_year')
@Index(['tenant_id', 'name'], { unique: true })
@Index(['tenant_id', 'status'])
export class FinFiscalYear {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @Column({ type: 'date' })
    start_date: string;

    @Column({ type: 'date' })
    end_date: string;

    @Column({ type: 'enum', enum: FiscalYearStatus, default: FiscalYearStatus.OPEN })
    status: FiscalYearStatus;

    @Column({ type: 'uuid', nullable: true })
    closed_by: string;

    @Column({ type: 'timestamp', nullable: true })
    closed_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
