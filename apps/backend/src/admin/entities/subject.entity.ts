import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  subject_code: string;

  @Column()
  subject_name: string;

  @Column({ nullable: true })
  category_code: string;

  @Column({ nullable: true })
  type_code: string;

  @Column({ default: true })
  is_platform_subject: boolean;

  @Column({ type: 'uuid', nullable: true })
  tenant_id: string | null;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
