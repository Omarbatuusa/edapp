import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AcknowledgementStatus {
  SAFE = 'SAFE',
  NEED_HELP = 'NEED_HELP',
}

export enum AcknowledgementUserType {
  LEARNER = 'LEARNER',
  PARENT = 'PARENT',
  STAFF = 'STAFF',
}

@Entity('emergency_acknowledgements')
@Index(['emergency_id', 'user_id'])
export class EmergencyAcknowledgement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  emergency_id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: AcknowledgementUserType })
  user_type: AcknowledgementUserType;

  @Column({ type: 'enum', enum: AcknowledgementStatus, default: AcknowledgementStatus.SAFE })
  status: AcknowledgementStatus;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'timestamp', default: () => 'now()' })
  acknowledged_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
