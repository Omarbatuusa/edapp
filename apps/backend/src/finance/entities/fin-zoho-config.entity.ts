import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ZohoSyncMode { DISABLED = 'DISABLED', ONE_WAY_TO_ZOHO = 'ONE_WAY_TO_ZOHO', TWO_WAY = 'TWO_WAY' }

@Entity('fin_zoho_config')
@Index(['tenant_id'], { unique: true })
export class FinZohoConfig {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) org_id: string;
    @Column({ type: 'jsonb', nullable: true }) oauth_tokens: Record<string, any>;
    @Column({ type: 'enum', enum: ZohoSyncMode, default: ZohoSyncMode.DISABLED }) sync_mode: ZohoSyncMode;
    @Column({ type: 'varchar', length: 20, default: 'EDAPP' }) source_of_truth: string;
    @Column({ type: 'timestamp', nullable: true }) last_sync_at: Date;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
