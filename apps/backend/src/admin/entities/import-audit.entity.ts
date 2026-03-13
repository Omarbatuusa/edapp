import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

export enum ImportStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  PREVIEWING = 'PREVIEWING',
  IMPORTING = 'IMPORTING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

@Entity('import_audits')
export class ImportAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id: string | null;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  import_type: string;

  @Column({ type: 'varchar', length: 500 })
  original_filename: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_object_key: string | null;

  @Column({ type: 'int', default: 0 })
  total_rows: number;

  @Column({ type: 'int', default: 0 })
  success_count: number;

  @Column({ type: 'int', default: 0 })
  error_count: number;

  @Column({ type: 'enum', enum: ImportStatus, default: ImportStatus.PENDING })
  status: ImportStatus;

  @Column({ type: 'jsonb', default: [] })
  errors: Array<{ row_index: number; field: string; error: string; severity: 'error' | 'warning' }>;

  @Column({ type: 'jsonb', default: {} })
  result_summary: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;

  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
