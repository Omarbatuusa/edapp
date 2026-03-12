import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('platform_roles')
export class PlatformRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string; // e.g. 'app_super_admin', 'app_secretary'

    @Column()
    label: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    is_system: boolean; // System roles cannot be deleted

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
