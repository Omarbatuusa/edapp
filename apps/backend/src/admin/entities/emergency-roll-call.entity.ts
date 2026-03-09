import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('emergency_roll_calls')
@Index(['emergency_id', 'staff_id'])
export class EmergencyRollCall {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  emergency_id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid' })
  staff_id: string;

  @Column({ type: 'uuid', nullable: true })
  class_id: string | null;

  @Column({ type: 'jsonb', default: [] })
  learner_statuses: Array<{
    learner_id: string;
    status: 'present_safe' | 'missing' | 'injured';
    note?: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
