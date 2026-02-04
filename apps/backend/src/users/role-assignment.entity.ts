import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';

export enum UserRole {
    // ═══════════════════════════════════════════════════════════════
    // PLATFORM ROLES (global scope)
    // ═══════════════════════════════════════════════════════════════
    PLATFORM_SUPER_ADMIN = 'platform_super_admin',     // Global admin, can manage everything
    PLATFORM_SECRETARY = 'platform_secretary',         // Platform support admin
    PLATFORM_SUPPORT = 'platform_support',             // Helpdesk with impersonation (audited)

    // ═══════════════════════════════════════════════════════════════
    // GOVERNANCE / ADMIN ROLES (tenant-scoped)
    // ═══════════════════════════════════════════════════════════════
    BRAND_ADMIN = 'brand_admin',                       // Governance dashboards only (no data)
    MAIN_BRANCH_ADMIN = 'main_branch_admin',           // Main branch admin, tenant-wide control
    BRANCH_ADMIN = 'branch_admin',                     // Branch-limited admin
    TENANT_ADMIN = 'tenant_admin',                     // Tenant settings & integrations

    // ═══════════════════════════════════════════════════════════════
    // OPERATIONS ROLES (tenant-scoped)
    // ═══════════════════════════════════════════════════════════════
    ADMISSIONS_OFFICER = 'admissions_officer',         // Registrar / applications
    FINANCE_OFFICER = 'finance_officer',               // Bursar / fees
    HR_ADMIN = 'hr_admin',                             // Staff admin / HR
    RECEPTION = 'reception',                           // Secretary / front desk
    IT_ADMIN = 'it_admin',                             // IT systems admin

    // ═══════════════════════════════════════════════════════════════
    // ACADEMIC LEADERSHIP ROLES (tenant/branch-scoped)
    // ═══════════════════════════════════════════════════════════════
    PRINCIPAL = 'principal',                           // School principal
    DEPUTY_PRINCIPAL = 'deputy_principal',             // Deputy principal
    SMT = 'smt',                                       // Senior Management Team
    HOD = 'hod',                                       // Head of Department
    GRADE_HEAD = 'grade_head',                         // Grade Head
    PHASE_HEAD = 'phase_head',                         // Phase Head (Foundation/Intermediate/Senior)

    // ═══════════════════════════════════════════════════════════════
    // TEACHING ROLES (class/subject-scoped)
    // ═══════════════════════════════════════════════════════════════
    CLASS_TEACHER = 'class_teacher',                   // Homeroom / Class teacher
    SUBJECT_TEACHER = 'subject_teacher',               // Subject Educator
    TEACHER = 'teacher',                               // General teacher (legacy compat)

    // ═══════════════════════════════════════════════════════════════
    // SUPPORT ROLES (tenant/branch-scoped)
    // ═══════════════════════════════════════════════════════════════
    COUNSELLOR = 'counsellor',                         // Counsellor / Social worker
    NURSE = 'nurse',                                   // School nurse
    TRANSPORT = 'transport',                           // Transport coordinator
    AFTERCARE = 'aftercare',                           // Aftercare supervisor
    SECURITY = 'security',                             // Security staff
    CARETAKER = 'caretaker',                           // Caretaker / Maintenance
    STAFF = 'staff',                                   // General staff (legacy compat)

    // ═══════════════════════════════════════════════════════════════
    // END USER ROLES
    // ═══════════════════════════════════════════════════════════════
    PARENT = 'parent',                                 // Parent / Guardian
    LEARNER = 'learner',                               // Student
    APPLICANT = 'applicant',                           // Prospective applicant

    // ═══════════════════════════════════════════════════════════════
    // OPTIONAL / COMMUNITY ROLES
    // ═══════════════════════════════════════════════════════════════
    ALUMNI = 'alumni',                                 // Former student
    SGB_MEMBER = 'sgb_member',                         // School Governing Body
    PARENT_ASSOCIATION = 'parent_association'          // PTA member
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
