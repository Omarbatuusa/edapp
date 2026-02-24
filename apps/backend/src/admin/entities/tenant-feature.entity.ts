import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('tenant_features')
@Unique(['tenant_id', 'feature_key'])
export class TenantFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column()
  feature_key: string;

  @Column({ default: false })
  is_enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any> | null;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
