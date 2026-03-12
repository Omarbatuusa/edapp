import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { PlatformRole } from './platform-role.entity';

@Entity('platform_user_roles')
@Index(['user_id', 'platform_role_id'], { unique: true })
export class PlatformUserRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @ManyToOne(() => PlatformRole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'platform_role_id' })
    platform_role: PlatformRole;

    @Column()
    platform_role_id: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', nullable: true })
    starts_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    ends_at: Date;

    @Column({ nullable: true })
    assigned_by_user_id: string;

    @CreateDateColumn()
    created_at: Date;
}
