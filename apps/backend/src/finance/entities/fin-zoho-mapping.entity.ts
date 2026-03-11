import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity('fin_zoho_mapping')
@Index(['tenant_id', 'entity_type', 'edapp_id'], { unique: true })
export class FinZohoMapping {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 50 }) entity_type: string;
    @Column({ type: 'uuid' }) edapp_id: string;
    @Column({ type: 'varchar', length: 100 }) zoho_id: string;
    @UpdateDateColumn() last_synced_at: Date;
}
