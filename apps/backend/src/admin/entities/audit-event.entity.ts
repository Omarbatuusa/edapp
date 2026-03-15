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
  ENROLLMENT_SUBMIT = 'ENROLLMENT_SUBMIT',
  ENROLLMENT_APPROVE = 'ENROLLMENT_APPROVE',
  ENROLLMENT_REJECT = 'ENROLLMENT_REJECT',
  STAFF_CREATE = 'STAFF_CREATE',
  STAFF_EDIT = 'STAFF_EDIT',
  CURRICULUM_CREATE = 'CURRICULUM_CREATE',
  CURRICULUM_EDIT = 'CURRICULUM_EDIT',
  FAMILY_CREATE = 'FAMILY_CREATE',
  CLASS_CREATE = 'CLASS_CREATE',
  CLASS_EDIT = 'CLASS_EDIT',
  // Finance actions
  JOURNAL_POSTED = 'JOURNAL_POSTED',
  JOURNAL_REVERSED = 'JOURNAL_REVERSED',
  INVOICE_CREATED = 'INVOICE_CREATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  PERIOD_LOCKED = 'PERIOD_LOCKED',
  PERIOD_REOPENED = 'PERIOD_REOPENED',
  WRITE_OFF = 'WRITE_OFF',
  MANUAL_JOURNAL = 'MANUAL_JOURNAL',
  VENDOR_BANK_CHANGE = 'VENDOR_BANK_CHANGE',
  FINANCE_INITIALIZED = 'FINANCE_INITIALIZED',
  USER_CREATE = 'USER_CREATE',
  USER_DELETE = 'USER_DELETE',
  USER_PASSWORD_RESET = 'USER_PASSWORD_RESET',
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
