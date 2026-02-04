/**
 * Role Metadata & Navigation Configuration
 * Provides display info, icons, and navigation configs for each role
 */

export enum UserRole {
    // Platform roles
    PLATFORM_SUPER_ADMIN = 'platform_super_admin',
    PLATFORM_SECRETARY = 'platform_secretary',
    PLATFORM_SUPPORT = 'platform_support',
    // Governance roles
    BRAND_ADMIN = 'brand_admin',
    MAIN_BRANCH_ADMIN = 'main_branch_admin',
    BRANCH_ADMIN = 'branch_admin',
    TENANT_ADMIN = 'tenant_admin',
    // Operations roles
    ADMISSIONS_OFFICER = 'admissions_officer',
    FINANCE_OFFICER = 'finance_officer',
    HR_ADMIN = 'hr_admin',
    RECEPTION = 'reception',
    IT_ADMIN = 'it_admin',
    // Academic leadership
    PRINCIPAL = 'principal',
    DEPUTY_PRINCIPAL = 'deputy_principal',
    SMT = 'smt',
    HOD = 'hod',
    GRADE_HEAD = 'grade_head',
    PHASE_HEAD = 'phase_head',
    // Teaching roles
    CLASS_TEACHER = 'class_teacher',
    SUBJECT_TEACHER = 'subject_teacher',
    TEACHER = 'teacher',
    // Support roles
    COUNSELLOR = 'counsellor',
    NURSE = 'nurse',
    TRANSPORT = 'transport',
    AFTERCARE = 'aftercare',
    SECURITY = 'security',
    CARETAKER = 'caretaker',
    STAFF = 'staff',
    // End users
    PARENT = 'parent',
    LEARNER = 'learner',
    APPLICANT = 'applicant',
    // Community
    ALUMNI = 'alumni',
    SGB_MEMBER = 'sgb_member',
    PARENT_ASSOCIATION = 'parent_association',
}

export type RoleCategory = 'platform' | 'governance' | 'operations' | 'academic' | 'teaching' | 'support' | 'enduser' | 'community';

export interface RoleMetadata {
    role: UserRole;
    displayName: string;
    shortName: string;
    category: RoleCategory;
    icon: string; // Material Symbols icon name
    description: string;
    color: string; // Tailwind color class
    // Navigation config
    navTabs: string[];
    defaultRoute: string;
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
    // ═══════════════════════════════════════════════════════════════
    // PLATFORM ROLES
    // ═══════════════════════════════════════════════════════════════
    [UserRole.PLATFORM_SUPER_ADMIN]: {
        role: UserRole.PLATFORM_SUPER_ADMIN,
        displayName: 'Platform Super Admin',
        shortName: 'Super Admin',
        category: 'platform',
        icon: 'admin_panel_settings',
        description: 'Full platform control',
        color: 'bg-red-600',
        navTabs: ['dashboard', 'tenants', 'users', 'settings', 'audit'],
        defaultRoute: '/admin/dashboard',
    },
    [UserRole.PLATFORM_SECRETARY]: {
        role: UserRole.PLATFORM_SECRETARY,
        displayName: 'Platform Secretary',
        shortName: 'Secretary',
        category: 'platform',
        icon: 'support_agent',
        description: 'Platform administration support',
        color: 'bg-orange-600',
        navTabs: ['dashboard', 'tenants', 'users', 'tickets'],
        defaultRoute: '/admin/dashboard',
    },
    [UserRole.PLATFORM_SUPPORT]: {
        role: UserRole.PLATFORM_SUPPORT,
        displayName: 'Platform Support',
        shortName: 'Support',
        category: 'platform',
        icon: 'headset_mic',
        description: 'Helpdesk & impersonation',
        color: 'bg-amber-600',
        navTabs: ['dashboard', 'tickets', 'impersonate'],
        defaultRoute: '/admin/support',
    },

    // ═══════════════════════════════════════════════════════════════
    // GOVERNANCE ROLES
    // ═══════════════════════════════════════════════════════════════
    [UserRole.BRAND_ADMIN]: {
        role: UserRole.BRAND_ADMIN,
        displayName: 'Brand Admin',
        shortName: 'Brand',
        category: 'governance',
        icon: 'corporate_fare',
        description: 'Multi-school governance',
        color: 'bg-purple-600',
        navTabs: ['pulse', 'branches', 'governance', 'reports'],
        defaultRoute: '/dashboard',
    },
    [UserRole.MAIN_BRANCH_ADMIN]: {
        role: UserRole.MAIN_BRANCH_ADMIN,
        displayName: 'Main Branch Admin',
        shortName: 'Main Admin',
        category: 'governance',
        icon: 'domain',
        description: 'Tenant-wide control',
        color: 'bg-indigo-600',
        navTabs: ['control', 'people', 'data', 'integrations', 'menu'],
        defaultRoute: '/admin',
    },
    [UserRole.BRANCH_ADMIN]: {
        role: UserRole.BRANCH_ADMIN,
        displayName: 'Branch Admin',
        shortName: 'Admin',
        category: 'governance',
        icon: 'apartment',
        description: 'Branch-level control',
        color: 'bg-blue-600',
        navTabs: ['control', 'people', 'data', 'settings', 'menu'],
        defaultRoute: '/admin',
    },
    [UserRole.TENANT_ADMIN]: {
        role: UserRole.TENANT_ADMIN,
        displayName: 'Tenant Admin',
        shortName: 'Admin',
        category: 'governance',
        icon: 'settings',
        description: 'Tenant settings & integrations',
        color: 'bg-slate-600',
        navTabs: ['control', 'people', 'data', 'integrations', 'menu'],
        defaultRoute: '/settings',
    },

    // ═══════════════════════════════════════════════════════════════
    // OPERATIONS ROLES
    // ═══════════════════════════════════════════════════════════════
    [UserRole.ADMISSIONS_OFFICER]: {
        role: UserRole.ADMISSIONS_OFFICER,
        displayName: 'Admissions Officer',
        shortName: 'Admissions',
        category: 'operations',
        icon: 'how_to_reg',
        description: 'Applications & registrations',
        color: 'bg-teal-600',
        navTabs: ['pipeline', 'applications', 'schedule', 'chat', 'menu'],
        defaultRoute: '/admissions',
    },
    [UserRole.FINANCE_OFFICER]: {
        role: UserRole.FINANCE_OFFICER,
        displayName: 'Finance Officer',
        shortName: 'Finance',
        category: 'operations',
        icon: 'payments',
        description: 'Fees & financial management',
        color: 'bg-emerald-600',
        navTabs: ['fees', 'wallet', 'statements', 'chat', 'menu'],
        defaultRoute: '/finance',
    },
    [UserRole.HR_ADMIN]: {
        role: UserRole.HR_ADMIN,
        displayName: 'HR Admin',
        shortName: 'HR',
        category: 'operations',
        icon: 'badge',
        description: 'Staff management',
        color: 'bg-cyan-600',
        navTabs: ['staff', 'leave', 'payroll', 'reports', 'menu'],
        defaultRoute: '/staff',
    },
    [UserRole.RECEPTION]: {
        role: UserRole.RECEPTION,
        displayName: 'Reception',
        shortName: 'Reception',
        category: 'operations',
        icon: 'front_hand',
        description: 'Front desk & visitors',
        color: 'bg-sky-600',
        navTabs: ['today', 'visitors', 'gate', 'messages', 'menu'],
        defaultRoute: '/gate',
    },
    [UserRole.IT_ADMIN]: {
        role: UserRole.IT_ADMIN,
        displayName: 'IT Admin',
        shortName: 'IT',
        category: 'operations',
        icon: 'computer',
        description: 'Systems & devices',
        color: 'bg-gray-600',
        navTabs: ['devices', 'printing', 'network', 'logs', 'menu'],
        defaultRoute: '/settings',
    },

    // ═══════════════════════════════════════════════════════════════
    // ACADEMIC LEADERSHIP
    // ═══════════════════════════════════════════════════════════════
    [UserRole.PRINCIPAL]: {
        role: UserRole.PRINCIPAL,
        displayName: 'Principal',
        shortName: 'Principal',
        category: 'academic',
        icon: 'school',
        description: 'School leadership',
        color: 'bg-violet-600',
        navTabs: ['pulse', 'people', 'approvals', 'chat', 'menu'],
        defaultRoute: '/dashboard',
    },
    [UserRole.DEPUTY_PRINCIPAL]: {
        role: UserRole.DEPUTY_PRINCIPAL,
        displayName: 'Deputy Principal',
        shortName: 'Deputy',
        category: 'academic',
        icon: 'supervisor_account',
        description: 'Deputy school leadership',
        color: 'bg-fuchsia-600',
        navTabs: ['pulse', 'people', 'approvals', 'chat', 'menu'],
        defaultRoute: '/dashboard',
    },
    [UserRole.SMT]: {
        role: UserRole.SMT,
        displayName: 'Senior Management',
        shortName: 'SMT',
        category: 'academic',
        icon: 'groups',
        description: 'Senior Management Team',
        color: 'bg-pink-600',
        navTabs: ['pulse', 'people', 'approvals', 'chat', 'menu'],
        defaultRoute: '/dashboard',
    },
    [UserRole.HOD]: {
        role: UserRole.HOD,
        displayName: 'Head of Department',
        shortName: 'HOD',
        category: 'academic',
        icon: 'account_tree',
        description: 'Department leadership',
        color: 'bg-rose-600',
        navTabs: ['pulse', 'teachers', 'subjects', 'chat', 'menu'],
        defaultRoute: '/academics',
    },
    [UserRole.GRADE_HEAD]: {
        role: UserRole.GRADE_HEAD,
        displayName: 'Grade Head',
        shortName: 'Grade Head',
        category: 'academic',
        icon: 'person_pin',
        description: 'Grade-level oversight',
        color: 'bg-orange-500',
        navTabs: ['pulse', 'classes', 'learners', 'chat', 'menu'],
        defaultRoute: '/academics',
    },
    [UserRole.PHASE_HEAD]: {
        role: UserRole.PHASE_HEAD,
        displayName: 'Phase Head',
        shortName: 'Phase Head',
        category: 'academic',
        icon: 'workspaces',
        description: 'Phase-level oversight',
        color: 'bg-amber-500',
        navTabs: ['pulse', 'grades', 'curriculum', 'chat', 'menu'],
        defaultRoute: '/academics',
    },

    // ═══════════════════════════════════════════════════════════════
    // TEACHING ROLES
    // ═══════════════════════════════════════════════════════════════
    [UserRole.CLASS_TEACHER]: {
        role: UserRole.CLASS_TEACHER,
        displayName: 'Class Teacher',
        shortName: 'Class Teacher',
        category: 'teaching',
        icon: 'cast_for_education',
        description: 'Homeroom teacher',
        color: 'bg-blue-500',
        navTabs: ['today', 'classes', 'homework', 'chat', 'menu'],
        defaultRoute: '/dashboard',
    },
    [UserRole.SUBJECT_TEACHER]: {
        role: UserRole.SUBJECT_TEACHER,
        displayName: 'Subject Teacher',
        shortName: 'Teacher',
        category: 'teaching',
        icon: 'auto_stories',
        description: 'Subject educator',
        color: 'bg-indigo-500',
        navTabs: ['today', 'classes', 'homework', 'chat', 'menu'],
        defaultRoute: '/dashboard',
    },
    [UserRole.TEACHER]: {
        role: UserRole.TEACHER,
        displayName: 'Teacher',
        shortName: 'Teacher',
        category: 'teaching',
        icon: 'person',
        description: 'General educator',
        color: 'bg-blue-500',
        navTabs: ['today', 'classes', 'homework', 'chat', 'menu'],
        defaultRoute: '/dashboard',
    },

    // ═══════════════════════════════════════════════════════════════
    // SUPPORT ROLES
    // ═══════════════════════════════════════════════════════════════
    [UserRole.COUNSELLOR]: {
        role: UserRole.COUNSELLOR,
        displayName: 'Counsellor',
        shortName: 'Counsellor',
        category: 'support',
        icon: 'psychology',
        description: 'Student counselling',
        color: 'bg-green-600',
        navTabs: ['cases', 'schedule', 'resources', 'chat', 'menu'],
        defaultRoute: '/safety',
    },
    [UserRole.NURSE]: {
        role: UserRole.NURSE,
        displayName: 'School Nurse',
        shortName: 'Nurse',
        category: 'support',
        icon: 'medical_services',
        description: 'Health & medical',
        color: 'bg-red-500',
        navTabs: ['sick_bay', 'records', 'emergencies', 'chat', 'menu'],
        defaultRoute: '/safety',
    },
    [UserRole.TRANSPORT]: {
        role: UserRole.TRANSPORT,
        displayName: 'Transport',
        shortName: 'Transport',
        category: 'support',
        icon: 'directions_bus',
        description: 'Transport coordination',
        color: 'bg-yellow-600',
        navTabs: ['routes', 'tracking', 'incidents', 'chat', 'menu'],
        defaultRoute: '/transport',
    },
    [UserRole.AFTERCARE]: {
        role: UserRole.AFTERCARE,
        displayName: 'Aftercare',
        shortName: 'Aftercare',
        category: 'support',
        icon: 'child_care',
        description: 'Aftercare supervision',
        color: 'bg-lime-600',
        navTabs: ['attendance', 'activities', 'pickups', 'chat', 'menu'],
        defaultRoute: '/aftercare',
    },
    [UserRole.SECURITY]: {
        role: UserRole.SECURITY,
        displayName: 'Security',
        shortName: 'Security',
        category: 'support',
        icon: 'security',
        description: 'Campus security',
        color: 'bg-slate-700',
        navTabs: ['gate', 'incidents', 'patrols', 'emergency', 'menu'],
        defaultRoute: '/gate',
    },
    [UserRole.CARETAKER]: {
        role: UserRole.CARETAKER,
        displayName: 'Caretaker',
        shortName: 'Caretaker',
        category: 'support',
        icon: 'handyman',
        description: 'Maintenance & facilities',
        color: 'bg-stone-600',
        navTabs: ['tasks', 'requests', 'inventory', 'menu'],
        defaultRoute: '/facilities',
    },
    [UserRole.STAFF]: {
        role: UserRole.STAFF,
        displayName: 'Staff',
        shortName: 'Staff',
        category: 'support',
        icon: 'work',
        description: 'General staff',
        color: 'bg-gray-500',
        navTabs: ['today', 'tasks', 'messages', 'menu'],
        defaultRoute: '/dashboard',
    },

    // ═══════════════════════════════════════════════════════════════
    // END USER ROLES
    // ═══════════════════════════════════════════════════════════════
    [UserRole.PARENT]: {
        role: UserRole.PARENT,
        displayName: 'Parent',
        shortName: 'Parent',
        category: 'enduser',
        icon: 'family_restroom',
        description: 'Parent or guardian',
        color: 'bg-blue-600',
        navTabs: ['home', 'academics', 'pay', 'chat', 'menu'],
        defaultRoute: '/parent',
    },
    [UserRole.LEARNER]: {
        role: UserRole.LEARNER,
        displayName: 'Learner',
        shortName: 'Learner',
        category: 'enduser',
        icon: 'face',
        description: 'Student',
        color: 'bg-green-500',
        navTabs: ['home', 'planner', 'learn', 'chat', 'menu'],
        defaultRoute: '/learner',
    },
    [UserRole.APPLICANT]: {
        role: UserRole.APPLICANT,
        displayName: 'Applicant',
        shortName: 'Applicant',
        category: 'enduser',
        icon: 'pending',
        description: 'Prospective student',
        color: 'bg-amber-500',
        navTabs: ['application', 'documents', 'status', 'menu'],
        defaultRoute: '/apply',
    },

    // ═══════════════════════════════════════════════════════════════
    // COMMUNITY ROLES
    // ═══════════════════════════════════════════════════════════════
    [UserRole.ALUMNI]: {
        role: UserRole.ALUMNI,
        displayName: 'Alumni',
        shortName: 'Alumni',
        category: 'community',
        icon: 'history_edu',
        description: 'Former student',
        color: 'bg-purple-500',
        navTabs: ['community', 'events', 'directory', 'menu'],
        defaultRoute: '/alumni',
    },
    [UserRole.SGB_MEMBER]: {
        role: UserRole.SGB_MEMBER,
        displayName: 'SGB Member',
        shortName: 'SGB',
        category: 'community',
        icon: 'gavel',
        description: 'School Governing Body',
        color: 'bg-indigo-700',
        navTabs: ['meetings', 'documents', 'votes', 'menu'],
        defaultRoute: '/governance',
    },
    [UserRole.PARENT_ASSOCIATION]: {
        role: UserRole.PARENT_ASSOCIATION,
        displayName: 'Parent Association',
        shortName: 'PTA',
        category: 'community',
        icon: 'diversity_3',
        description: 'PTA member',
        color: 'bg-pink-500',
        navTabs: ['events', 'fundraising', 'volunteers', 'menu'],
        defaultRoute: '/pta',
    },
};

/**
 * Get role metadata by role string
 */
export function getRoleMetadata(role: string): RoleMetadata | undefined {
    return ROLE_METADATA[role as UserRole];
}

/**
 * Get roles by category
 */
export function getRolesByCategory(category: RoleCategory): RoleMetadata[] {
    return Object.values(ROLE_METADATA).filter(m => m.category === category);
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: string): string {
    return ROLE_METADATA[role as UserRole]?.displayName || role;
}

/**
 * Check if role is a platform-level role
 */
export function isPlatformRole(role: string): boolean {
    return ROLE_METADATA[role as UserRole]?.category === 'platform';
}

/**
 * Check if role is a staff/admin role (non-enduser)
 */
export function isStaffRole(role: string): boolean {
    const meta = ROLE_METADATA[role as UserRole];
    return meta ? !['enduser', 'community'].includes(meta.category) : false;
}
