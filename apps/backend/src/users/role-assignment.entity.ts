import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';

export enum UserRole {
    // ═══════════════════════════════════════════════════════════════
    // PLATFORM ROLES (global scope)
    // ═══════════════════════════════════════════════════════════════
    PLATFORM_SUPER_ADMIN = 'platform_super_admin',
    PLATFORM_SECRETARY = 'platform_secretary',
    PLATFORM_SUPPORT = 'platform_support',

    // Aliases for new naming convention (app_super_admin = platform_super_admin)
    APP_SUPER_ADMIN = 'app_super_admin',
    APP_SECRETARY = 'app_secretary',
    APP_SUPPORT = 'app_support',

    // ═══════════════════════════════════════════════════════════════
    // BRAND MANAGEMENT ROLES (platform-side oversight only)
    // ═══════════════════════════════════════════════════════════════
    BRAND_ADMIN = 'brand_admin',
    BRAND_OPERATIONS_MANAGER = 'brand_operations_manager',
    BRAND_FINANCE_SUPERVISOR = 'brand_finance_supervisor',
    BRAND_AUDITOR = 'brand_auditor',

    // ═══════════════════════════════════════════════════════════════
    // GOVERNANCE / ADMIN ROLES (tenant-scoped)
    // ═══════════════════════════════════════════════════════════════
    MAIN_BRANCH_ADMIN = 'main_branch_admin',
    BRANCH_ADMIN = 'branch_admin',
    TENANT_ADMIN = 'tenant_admin',
    TENANT_BRAND_ADMIN = 'tenant_brand_admin',

    // ═══════════════════════════════════════════════════════════════
    // TENANT LEADERSHIP / OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    PRINCIPAL = 'principal',
    DEPUTY_PRINCIPAL = 'deputy_principal',
    SCHOOL_OPERATIONS_MANAGER = 'school_operations_manager',
    SCHOOL_ADMINISTRATOR = 'school_administrator',
    ADMISSIONS_OFFICER = 'admissions_officer',
    FINANCE_OFFICER = 'finance_officer',
    HR_ADMIN = 'hr_admin',
    IT_ADMIN = 'it_admin',
    TIMETABLE_OFFICER = 'timetable_officer',
    EXAM_OFFICER = 'exam_officer',
    CURRICULUM_COORDINATOR = 'curriculum_coordinator',
    DISCIPLINARY_OFFICER = 'disciplinary_officer',
    PASTORAL_CARE_LEAD = 'pastoral_care_lead',
    EVENTS_COORDINATOR = 'events_coordinator',
    ALUMNI_LIAISON = 'alumni_liaison',
    SCHOOL_AUDITOR = 'school_auditor',

    // ═══════════════════════════════════════════════════════════════
    // BRANCH / OFFICE / SITE SUPPORT
    // ═══════════════════════════════════════════════════════════════
    BRANCH_OPERATIONS_ADMIN = 'branch_operations_admin',
    BRANCH_FINANCE_CLERK = 'branch_finance_clerk',
    RECEPTIONIST = 'receptionist',
    RECEPTION = 'reception',          // Legacy alias
    SECRETARY = 'secretary',
    AFTERCARE_SUPERVISOR = 'aftercare_supervisor',
    HOSTEL_SUPERVISOR = 'hostel_supervisor',

    // ═══════════════════════════════════════════════════════════════
    // ACADEMIC LEADERSHIP (tenant/branch-scoped)
    // ═══════════════════════════════════════════════════════════════
    SMT = 'smt',
    HOD = 'hod',
    GRADE_HEAD = 'grade_head',
    PHASE_HEAD = 'phase_head',

    // ═══════════════════════════════════════════════════════════════
    // TEACHING / ACADEMIC
    // ═══════════════════════════════════════════════════════════════
    CLASS_TEACHER = 'class_teacher',
    SUBJECT_TEACHER = 'subject_teacher',
    TEACHER = 'teacher',
    EDUCATOR = 'educator',
    TEACHER_ASSISTANT = 'teacher_assistant',
    LEARNING_SUPPORT_EDUCATOR = 'learning_support_educator',
    REMEDIAL_TEACHER = 'remedial_teacher',
    INTERN_TEACHER = 'intern_teacher',
    COACH = 'coach',

    // ═══════════════════════════════════════════════════════════════
    // SUPPORT / WELFARE / SERVICES
    // ═══════════════════════════════════════════════════════════════
    COUNSELLOR = 'counsellor',
    SOCIAL_WORKER = 'social_worker',
    NURSE = 'nurse',
    SCHOOL_NURSE = 'school_nurse',
    LIBRARIAN = 'librarian',
    LAB_TECHNICIAN = 'lab_technician',
    TRANSPORT = 'transport',
    AFTERCARE = 'aftercare',
    SECURITY = 'security',
    CARETAKER = 'caretaker',
    DRIVER = 'driver',
    GROUNDSKEEPER = 'groundskeeper',
    MAINTENANCE = 'maintenance',
    CLEANER = 'cleaner',
    KITCHEN_STAFF = 'kitchen_staff',
    STAFF = 'staff',

    // ═══════════════════════════════════════════════════════════════
    // LEARNERS / FAMILY
    // ═══════════════════════════════════════════════════════════════
    PARENT = 'parent',
    LEARNER = 'learner',
    LEARNER_PREFECT = 'learner_prefect',
    PARENT_GUARDIAN = 'parent_guardian',
    PRIMARY_GUARDIAN = 'primary_guardian',
    SECONDARY_GUARDIAN = 'secondary_guardian',
    AUTHORIZED_PICKUP = 'authorized_pickup',

    // ═══════════════════════════════════════════════════════════════
    // APPLICANT ROLES
    // ═══════════════════════════════════════════════════════════════
    APPLICANT = 'applicant',
    APPLICANT_GUARDIAN = 'applicant_guardian',
    APPLICANT_LEARNER_PROFILE = 'applicant_learner_profile',

    // ═══════════════════════════════════════════════════════════════
    // SPECIALIST TENANT ROLES
    // ═══════════════════════════════════════════════════════════════
    CONTENT_MODERATOR = 'content_moderator',
    COMMUNICATIONS_MANAGER = 'communications_manager',
    ATTENDANCE_OFFICER = 'attendance_officer',
    PRINTING_ADMIN = 'printing_admin',
    DATA_STEWARD = 'data_steward',

    // ═══════════════════════════════════════════════════════════════
    // COMMUNITY ROLES
    // ═══════════════════════════════════════════════════════════════
    ALUMNI = 'alumni',
    SGB_MEMBER = 'sgb_member',
    PARENT_ASSOCIATION = 'parent_association',
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
