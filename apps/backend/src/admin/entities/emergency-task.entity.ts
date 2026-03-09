import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmergencyTaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EmergencyTaskStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ESCALATED = 'ESCALATED',
}

@Entity('emergency_tasks')
@Index(['emergency_id', 'assigned_staff_id'])
export class EmergencyTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  emergency_id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid' })
  assigned_staff_id: string;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'enum', enum: EmergencyTaskPriority, default: EmergencyTaskPriority.MEDIUM })
  priority: EmergencyTaskPriority;

  @Column({ type: 'jsonb', default: [] })
  checklist_items: Array<Record<string, any>>;

  @Column({ type: 'enum', enum: EmergencyTaskStatus, default: EmergencyTaskStatus.ASSIGNED })
  status: EmergencyTaskStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
