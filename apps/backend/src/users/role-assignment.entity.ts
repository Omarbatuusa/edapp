import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';

export enum UserRole {
    PLATFORM_SUPER_ADMIN = 'platform_super_admin', // Global admin, can manage everything
    TENANT_MAIN_ADMIN = 'tenant_main_admin',       // Main branch admin, tenant-wide control
    BRANCH_ADMIN = 'branch_admin',                 // Branch-limited admin
    FINANCE_ADMIN = 'finance_admin',               // Finance management
    STAFF_ADMIN = 'staff_admin',                   // Staff management
    STAFF = 'staff',
    HEAD_OF_DEPARTMENT = 'hod',
    TEACHER = 'teacher',
    PARENT = 'parent',
    LEARNER = 'learner',
    APPLICANT = 'applicant'
}

@Entity('role_assignments')
@Index(['user_id', 'tenant_id', 'role'], { unique: true }) // One role per user per tenant
export class RoleAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne('User', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: any; // Circular reference handled

    @Column()
    user_id: string;

    // Tenant scope (REQUIRED - no global roles except PLATFORM_SUPER_ADMIN)
    @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ nullable: true })
    tenant_id: string; // NULL only for PLATFORM_SUPER_ADMIN

    // Branch scope (optional - for BRANCH_ADMIN and branch-scoped operations)
    @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column({ nullable: true })
    branch_id: string; // NULL for tenant-wide roles, set for branch-specific roles

    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
