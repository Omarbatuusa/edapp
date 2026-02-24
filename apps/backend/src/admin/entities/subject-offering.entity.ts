import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('subject_offerings')
export class SubjectOffering {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  branch_id: string | null;

  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ nullable: true })
  stream_code: string | null;

  @Column({ nullable: true })
  type_code: string | null;

  @Column({ nullable: true })
  language_level_code: string | null;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
