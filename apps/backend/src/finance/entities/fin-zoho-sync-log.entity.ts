import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ZohoSyncStatus { SUCCESS = 'SUCCESS', FAILED = 'FAILED', CONFLICT = 'CONFLICT' }

@Entity('fin_zoho_sync_log')
@Index(['tenant_id', 'entity_type'])
@Index(['tenant_id', 'status'])
export class FinZohoSyncLog {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 10 }) direction: string;
    @Column({ type: 'varchar', length: 50 }) entity_type: string;
    @Column({ type: 'enum', enum: ZohoSyncStatus }) status: ZohoSyncStatus;
    @Column({ type: 'text', nullable: true }) error: string;
    @Column({ type: 'jsonb', nullable: true }) payload: Record<string, any>;
    @CreateDateColumn() created_at: Date;
}
