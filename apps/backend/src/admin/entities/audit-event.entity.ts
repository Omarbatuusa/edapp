import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  TENANT_CREATE = 'TENANT_CREATE',
  TENANT_EDIT = 'TENANT_EDIT',
  TENANT_DISABLE = 'TENANT_DISABLE',
  DICT_EDIT = 'DICT_EDIT',
  FINANCE_MODE_CHANGE = 'FINANCE_MODE_CHANGE',
  ROLE_ASSIGN = 'ROLE_ASSIGN',
  ROLE_REVOKE = 'ROLE_REVOKE',
  ADMISSIONS_PUBLISH = 'ADMISSIONS_PUBLISH',
  FEATURE_TOGGLE = 'FEATURE_TOGGLE',
}

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id: string | null;

  @Column({ nullable: true })
  actor_user_id: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ nullable: true })
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, any> | null;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}
