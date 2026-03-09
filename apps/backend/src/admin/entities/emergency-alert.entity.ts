import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmergencyType {
  LOCKDOWN = 'LOCKDOWN',
  EVACUATION = 'EVACUATION',
  MEDICAL = 'MEDICAL',
  SEVERE_WEATHER = 'SEVERE_WEATHER',
  TRANSPORT = 'TRANSPORT',
  SECURITY_ALERT = 'SECURITY_ALERT',
  UTILITIES_OUTAGE = 'UTILITIES_OUTAGE',
}

export enum EmergencySeverity {
  INFO = 'INFO',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum EmergencyAlertStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  STAND_DOWN = 'STAND_DOWN',
  POST_REVIEW = 'POST_REVIEW',
}

export enum EmergencyScope {
  WHOLE_SCHOOL = 'WHOLE_SCHOOL',
  CAMPUS = 'CAMPUS',
  PHASE_GRADE = 'PHASE_GRADE',
  STAFF_ONLY = 'STAFF_ONLY',
}

@Entity('emergency_alerts')
@Index(['tenant_id', 'status'])
export class EmergencyAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  branch_id: string | null;

  @Column({ type: 'enum', enum: EmergencyType })
  type: EmergencyType;

  @Column({ type: 'enum', enum: EmergencySeverity, default: EmergencySeverity.INFO })
  severity: EmergencySeverity;

  @Column({ type: 'enum', enum: EmergencyAlertStatus, default: EmergencyAlertStatus.DRAFT })
  status: EmergencyAlertStatus;

  @Column({ type: 'varchar', length: 80 })
  headline: string;

  @Column({ type: 'text', nullable: true })
  body_instructions: string | null;

  @Column({ type: 'enum', enum: EmergencyScope, default: EmergencyScope.WHOLE_SCHOOL })
  scope: EmergencyScope;

  @Column({ type: 'jsonb', nullable: true })
  scope_filter: Record<string, any> | null;

  @Column({ type: 'boolean', default: false })
  request_safe_confirmation: boolean;

  @Column({ type: 'boolean', default: false })
  request_roll_call: boolean;

  @Column({
    type: 'jsonb',
    default: { in_app: true, push: false, sms: false, email: false },
  })
  channels: { in_app: boolean; push: boolean; sms: boolean; email: boolean };

  @Column({ type: 'uuid' })
  created_by_id: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by_id: string | null;

  @Column({ type: 'timestamp', nullable: true })
  activated_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  stood_down_at: Date | null;

  @Column({ type: 'text', nullable: true })
  post_review_notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
