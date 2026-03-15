import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Tenant } from '../../tenants/tenant.entity';

export enum LinkedAccessLevel {
    READ_ONLY = 'read_only',
    FULL_ADMIN = 'full_admin',
}

@Entity('linked_tenant_access')
@Unique(['user_id', 'target_tenant_id'])
export class LinkedTenantAccess {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: string;

    // The tenant where the user holds their primary role (e.g., main branch)
    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'source_tenant_id' })
    source_tenant: Tenant;

    @Column()
    source_tenant_id: string;

    // The tenant the user can switch into (e.g., a branch)
    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'target_tenant_id' })
    target_tenant: Tenant;

    @Column()
    target_tenant_id: string;

    @Column({ type: 'enum', enum: LinkedAccessLevel, default: LinkedAccessLevel.FULL_ADMIN })
    access_level: LinkedAccessLevel;

    @Column({ nullable: true })
    granted_by_user_id: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
