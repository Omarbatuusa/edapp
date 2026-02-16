import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';

// ============================================================
// PARENT-CHILD LINK - Links parent users to child users per tenant
// ============================================================

@Entity('parent_child_links')
@Unique(['tenant_id', 'parent_user_id', 'child_user_id'])
@Index(['tenant_id', 'parent_user_id'])
export class ParentChildLink {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_user_id' })
    parent: User;

    @Column()
    parent_user_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'child_user_id' })
    child: User;

    @Column()
    child_user_id: string;

    @CreateDateColumn()
    created_at: Date;
}
