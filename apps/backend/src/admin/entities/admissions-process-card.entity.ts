import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AdmissionsCardType {
  INFO = 'INFO',
  REQUIREMENT = 'REQUIREMENT',
  STEP = 'STEP',
  GATE = 'GATE',
}

@Entity('admissions_process_cards')
export class AdmissionsProcessCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: AdmissionsCardType, default: AdmissionsCardType.STEP })
  card_type: AdmissionsCardType;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>;

  @Column({ default: false })
  is_published: boolean;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date | null;

  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
