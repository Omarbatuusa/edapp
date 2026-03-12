import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum PermissionScope {
    PLATFORM = 'platform',
    TENANT = 'tenant',
}

@Entity('permissions')
@Index(['namespace', 'action'], { unique: true })
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    namespace: string; // e.g. 'finance.journal', 'tenant.settings'

    @Column()
    action: string; // e.g. 'create', 'read', 'update', 'delete', 'post'

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'enum', enum: PermissionScope, default: PermissionScope.TENANT })
    scope_type: PermissionScope;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
