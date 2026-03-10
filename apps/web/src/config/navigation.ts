/**
 * Universal Navigation Config
 * Single source of truth for all role-based navigation.
 * Consolidates AdminShell's PLATFORM/SECRETARY/TENANT_NAV and bottom-nav's NAV_ITEMS.
 */

export interface NavItem {
    id: string;
    icon: string;
    iconFilled?: string;
    label: string;
    href: string;
    badge?: number;
    section?: string;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export interface RoleNavConfig {
    /** Bottom nav tabs — exactly 5 (4 primary + Menu). */
    bottomTabs: NavItem[];
    /** All nav items shown in the desktop rail + menu overflow. */
    allItems: NavItem[];
    /** Grouped sections for the Menu page. */
    menuSections: NavSection[];
    /** Base path factory, e.g. `/tenant/${slug}/admin`. */
    getBasePath: (slug: string) => string;
}

// ── Menu tab (always last) ──────────────────────────────────────────────────
const MENU_TAB: NavItem = { id: 'menu', icon: 'menu', label: 'Menu', href: '/menu' };

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN CONFIGS (platform / secretary / tenant)
// ═══════════════════════════════════════════════════════════════════════════

const PLATFORM_ADMIN_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'dashboard', icon: 'dashboard', iconFilled: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'tenants', icon: 'domain', label: 'Tenants', href: '/tenants' },
        { id: 'people', icon: 'group', label: 'People', href: '/people' },
        { id: 'audit', icon: 'history', label: 'Audit', href: '/audit' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'tenants', icon: 'domain', label: 'Tenants', href: '/tenants' },
        { id: 'brands', icon: 'sell', label: 'Brands', href: '/brands' },
        { id: 'dictionaries', icon: 'dictionary', label: 'Dictionaries', href: '/dictionaries' },
        { id: 'people', icon: 'group', label: 'People', href: '/people' },
        { id: 'audit', icon: 'history', label: 'Audit Log', href: '/audit' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/control' },
    ],
    menuSections: [
        {
            title: 'Platform',
            items: [
                { id: 'brands', icon: 'sell', label: 'Brands', href: '/brands' },
                { id: 'dictionaries', icon: 'dictionary', label: 'Dictionaries', href: '/dictionaries' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/control' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

const SECRETARY_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'inbox', icon: 'inbox', iconFilled: 'inbox', label: 'Inbox', href: '/inbox' },
        { id: 'tenants', icon: 'domain', label: 'Tenants', href: '/tenants' },
        { id: 'approvals', icon: 'approval', label: 'Approvals', href: '/approvals' },
        { id: 'people', icon: 'group', label: 'People', href: '/people' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'inbox', icon: 'inbox', label: 'Inbox', href: '/inbox' },
        { id: 'tenants', icon: 'domain', label: 'Tenants', href: '/tenants' },
        { id: 'approvals', icon: 'approval', label: 'Approvals', href: '/approvals' },
        { id: 'people', icon: 'group', label: 'People', href: '/people' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/control' },
    ],
    menuSections: [
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/control' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

const TENANT_ADMIN_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'dashboard', icon: 'dashboard', iconFilled: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'enrollment', icon: 'how_to_reg', label: 'Enrollment', href: '/enrollment' },
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'staff', icon: 'badge', label: 'Staff', href: '/staff' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'enrollment', icon: 'how_to_reg', label: 'Enrollment', href: '/enrollment' },
        { id: 'staff', icon: 'badge', label: 'Staff', href: '/staff' },
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'school-data', icon: 'database', label: 'School Data', href: '/school-data' },
        { id: 'curriculum', icon: 'school', label: 'Curriculum', href: '/curriculum' },
        { id: 'grades-classes', icon: 'class', label: 'Grades & Classes', href: '/grades-classes' },
        { id: 'branches', icon: 'location_city', label: 'Branches', href: '/branches' },
        { id: 'people', icon: 'group', label: 'People', href: '/people' },
        { id: 'families', icon: 'family_restroom', label: 'Families', href: '/families' },
        { id: 'admissions', icon: 'assignment', label: 'Admissions', href: '/admissions' },
        { id: 'integrations', icon: 'toggle_on', label: 'Features', href: '/integrations' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/control' },
    ],
    menuSections: [
        {
            title: 'Academic',
            items: [
                { id: 'school-data', icon: 'database', label: 'School Data', href: '/school-data' },
                { id: 'curriculum', icon: 'school', label: 'Curriculum', href: '/curriculum' },
                { id: 'grades-classes', icon: 'class', label: 'Grades & Classes', href: '/grades-classes' },
            ],
        },
        {
            title: 'Management',
            items: [
                { id: 'branches', icon: 'location_city', label: 'Branches', href: '/branches' },
                { id: 'people', icon: 'group', label: 'People', href: '/people' },
                { id: 'families', icon: 'family_restroom', label: 'Families', href: '/families' },
                { id: 'admissions', icon: 'assignment', label: 'Admissions', href: '/admissions' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'integrations', icon: 'toggle_on', label: 'Features', href: '/integrations' },
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/control' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

// ═══════════════════════════════════════════════════════════════════════════
// ACADEMIC LEADERSHIP
// ═══════════════════════════════════════════════════════════════════════════

const PRINCIPAL_SMT_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'dashboard', icon: 'dashboard', iconFilled: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'people', icon: 'group', label: 'People', href: '/people' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'people', icon: 'group', label: 'People', href: '/people' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        { id: 'approvals', icon: 'approval', label: 'Approvals', href: '/approvals' },
        { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'safety', icon: 'shield', label: 'Safety', href: '/safety' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Administration',
            items: [
                { id: 'approvals', icon: 'approval', label: 'Approvals', href: '/approvals' },
                { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
                { id: 'safety', icon: 'shield', label: 'Safety', href: '/safety' },
            ],
        },
        {
            title: 'Communication',
            items: [
                { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

const HOD_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'dashboard', icon: 'dashboard', iconFilled: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'teachers', icon: 'groups', label: 'Teachers', href: '/teachers' },
        { id: 'subjects', icon: 'auto_stories', label: 'Subjects', href: '/subjects' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '' },
        { id: 'teachers', icon: 'groups', label: 'Teachers', href: '/teachers' },
        { id: 'subjects', icon: 'auto_stories', label: 'Subjects', href: '/subjects' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Department',
            items: [
                { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
                { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

// ═══════════════════════════════════════════════════════════════════════════
// TEACHING ROLES
// ═══════════════════════════════════════════════════════════════════════════

const TEACHER_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'home', icon: 'home', iconFilled: 'home', label: 'Home', href: '' },
        { id: 'classes', icon: 'school', label: 'Classes', href: '/classes' },
        { id: 'homework', icon: 'assignment', label: 'Homework', href: '/homework' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'home', icon: 'home', label: 'Home', href: '' },
        { id: 'classes', icon: 'school', label: 'Classes', href: '/classes' },
        { id: 'homework', icon: 'assignment', label: 'Homework', href: '/homework' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Teaching',
            items: [
                { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
                { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
                { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS ROLES
// ═══════════════════════════════════════════════════════════════════════════

const RECEPTION_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'today', icon: 'today', iconFilled: 'today', label: 'Today', href: '' },
        { id: 'gate', icon: 'sensor_door', label: 'Gate', href: '/gate' },
        { id: 'visitors', icon: 'person_add', label: 'Visitors', href: '/visitors' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Messages', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'today', icon: 'today', label: 'Today', href: '' },
        { id: 'gate', icon: 'sensor_door', label: 'Gate', href: '/gate' },
        { id: 'visitors', icon: 'person_add', label: 'Visitors', href: '/visitors' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Operations',
            items: [
                { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

const FINANCE_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'fees', icon: 'payments', iconFilled: 'payments', label: 'Fees', href: '/fees' },
        { id: 'wallet', icon: 'account_balance_wallet', label: 'Wallet', href: '/wallet' },
        { id: 'statements', icon: 'receipt_long', label: 'Statements', href: '/statements' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'fees', icon: 'payments', label: 'Fees', href: '/fees' },
        { id: 'wallet', icon: 'account_balance_wallet', label: 'Wallet', href: '/wallet' },
        { id: 'statements', icon: 'receipt_long', label: 'Statements', href: '/statements' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Communication',
            items: [
                { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

const ADMISSIONS_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'pipeline', icon: 'filter_alt', iconFilled: 'filter_alt', label: 'Pipeline', href: '/pipeline' },
        { id: 'applications', icon: 'description', label: 'Applications', href: '/applications' },
        { id: 'schedule', icon: 'calendar_today', label: 'Schedule', href: '/schedule' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'pipeline', icon: 'filter_alt', label: 'Pipeline', href: '/pipeline' },
        { id: 'applications', icon: 'description', label: 'Applications', href: '/applications' },
        { id: 'schedule', icon: 'calendar_today', label: 'Schedule', href: '/schedule' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Operations',
            items: [
                { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

const HR_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'staff', icon: 'badge', iconFilled: 'badge', label: 'Staff', href: '/staff' },
        { id: 'leave', icon: 'event_busy', label: 'Leave', href: '/leave' },
        { id: 'payroll', icon: 'payments', label: 'Payroll', href: '/payroll' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'staff', icon: 'badge', label: 'Staff', href: '/staff' },
        { id: 'leave', icon: 'event_busy', label: 'Leave', href: '/leave' },
        { id: 'payroll', icon: 'payments', label: 'Payroll', href: '/payroll' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Communication',
            items: [
                { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

const IT_ADMIN_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'devices', icon: 'devices', iconFilled: 'devices', label: 'Devices', href: '/devices' },
        { id: 'printing', icon: 'print', label: 'Printing', href: '/printing' },
        { id: 'network', icon: 'lan', label: 'Network', href: '/network' },
        { id: 'logs', icon: 'history', label: 'Logs', href: '/audit' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'devices', icon: 'devices', label: 'Devices', href: '/devices' },
        { id: 'printing', icon: 'print', label: 'Printing', href: '/printing' },
        { id: 'network', icon: 'lan', label: 'Network', href: '/network' },
        { id: 'logs', icon: 'history', label: 'Logs', href: '/audit' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/admin`,
};

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT ROLES
// ═══════════════════════════════════════════════════════════════════════════

const COUNSELLOR_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'cases', icon: 'psychology', iconFilled: 'psychology', label: 'Cases', href: '/cases' },
        { id: 'schedule', icon: 'calendar_today', label: 'Schedule', href: '/schedule' },
        { id: 'resources', icon: 'library_books', label: 'Resources', href: '/resources' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'cases', icon: 'psychology', label: 'Cases', href: '/cases' },
        { id: 'schedule', icon: 'calendar_today', label: 'Schedule', href: '/schedule' },
        { id: 'resources', icon: 'library_books', label: 'Resources', href: '/resources' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'safety', icon: 'shield', label: 'Safety', href: '/safety' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'Wellbeing', items: [{ id: 'safety', icon: 'shield', label: 'Safety', href: '/safety' }] },
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

const NURSE_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'sick-bay', icon: 'medical_services', iconFilled: 'medical_services', label: 'Sick Bay', href: '/sick-bay' },
        { id: 'records', icon: 'folder_shared', label: 'Records', href: '/records' },
        { id: 'emergencies', icon: 'emergency', label: 'Emergencies', href: '/emergencies' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'sick-bay', icon: 'medical_services', label: 'Sick Bay', href: '/sick-bay' },
        { id: 'records', icon: 'folder_shared', label: 'Records', href: '/records' },
        { id: 'emergencies', icon: 'emergency', label: 'Emergencies', href: '/emergencies' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

const TRANSPORT_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'routes', icon: 'directions_bus', iconFilled: 'directions_bus', label: 'Routes', href: '/routes' },
        { id: 'tracking', icon: 'location_on', label: 'Tracking', href: '/tracking' },
        { id: 'incidents', icon: 'report', label: 'Incidents', href: '/incidents' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'routes', icon: 'directions_bus', label: 'Routes', href: '/routes' },
        { id: 'tracking', icon: 'location_on', label: 'Tracking', href: '/tracking' },
        { id: 'incidents', icon: 'report', label: 'Incidents', href: '/incidents' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

const SECURITY_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'gate', icon: 'sensor_door', iconFilled: 'sensor_door', label: 'Gate', href: '/gate' },
        { id: 'incidents', icon: 'report', label: 'Incidents', href: '/incidents' },
        { id: 'patrols', icon: 'directions_walk', label: 'Patrols', href: '/patrols' },
        { id: 'emergency', icon: 'emergency', label: 'Emergency', href: '/safety' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'gate', icon: 'sensor_door', label: 'Gate', href: '/gate' },
        { id: 'incidents', icon: 'report', label: 'Incidents', href: '/incidents' },
        { id: 'patrols', icon: 'directions_walk', label: 'Patrols', href: '/patrols' },
        { id: 'emergency', icon: 'emergency', label: 'Emergency', href: '/safety' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

const AFTERCARE_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'attendance', icon: 'event_available', iconFilled: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'activities', icon: 'sports_soccer', label: 'Activities', href: '/activities' },
        { id: 'pickups', icon: 'directions_car', label: 'Pickups', href: '/pickups' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'attendance', icon: 'event_available', label: 'Attendance', href: '/attendance' },
        { id: 'activities', icon: 'sports_soccer', label: 'Activities', href: '/activities' },
        { id: 'pickups', icon: 'directions_car', label: 'Pickups', href: '/pickups' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

const GENERAL_STAFF_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'home', icon: 'home', iconFilled: 'home', label: 'Home', href: '' },
        { id: 'tasks', icon: 'checklist', label: 'Tasks', href: '/tasks' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Messages', href: '/messages' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'home', icon: 'home', label: 'Home', href: '' },
        { id: 'tasks', icon: 'checklist', label: 'Tasks', href: '/tasks' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'reports', icon: 'bar_chart', label: 'Reports', href: '/reports' },
        { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'General', items: [{ id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' }] },
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

const CARETAKER_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'tasks', icon: 'checklist', iconFilled: 'checklist', label: 'Tasks', href: '/tasks' },
        { id: 'requests', icon: 'build', label: 'Requests', href: '/requests' },
        { id: 'inventory', icon: 'inventory_2', label: 'Inventory', href: '/inventory' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Messages', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'tasks', icon: 'checklist', label: 'Tasks', href: '/tasks' },
        { id: 'requests', icon: 'build', label: 'Requests', href: '/requests' },
        { id: 'inventory', icon: 'inventory_2', label: 'Inventory', href: '/inventory' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/staff`,
};

// ═══════════════════════════════════════════════════════════════════════════
// END USER ROLES
// ═══════════════════════════════════════════════════════════════════════════

const PARENT_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'home', icon: 'home', iconFilled: 'home', label: 'Home', href: '' },
        { id: 'children', icon: 'child_care', label: 'Children', href: '/children' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/chat' },
        { id: 'pay', icon: 'payments', label: 'Pay', href: '/pay' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'home', icon: 'home', label: 'Home', href: '' },
        { id: 'children', icon: 'child_care', label: 'Children', href: '/children' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Chat', href: '/chat' },
        { id: 'pay', icon: 'payments', label: 'Pay', href: '/pay' },
        { id: 'accounts', icon: 'receipt_long', label: 'Accounts', href: '/accounts' },
        { id: 'announcements', icon: 'campaign', label: 'Announcements', href: '/announcements' },
        { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
        { id: 'report-absence', icon: 'event_busy', label: 'Report Absence', href: '/report-absence' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'School',
            items: [
                { id: 'accounts', icon: 'receipt_long', label: 'Accounts', href: '/accounts' },
                { id: 'announcements', icon: 'campaign', label: 'Announcements', href: '/announcements' },
                { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
                { id: 'report-absence', icon: 'event_busy', label: 'Report Absence', href: '/report-absence' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/parent`,
};

const LEARNER_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'home', icon: 'home', iconFilled: 'home', label: 'Home', href: '' },
        { id: 'courses', icon: 'menu_book', label: 'Courses', href: '/courses' },
        { id: 'grades', icon: 'grade', label: 'Grades', href: '/grades' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Chat', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'home', icon: 'home', label: 'Home', href: '' },
        { id: 'courses', icon: 'menu_book', label: 'Courses', href: '/courses' },
        { id: 'grades', icon: 'grade', label: 'Grades', href: '/grades' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'planner', icon: 'event_note', label: 'Planner', href: '/planner' },
        { id: 'learn', icon: 'local_library', label: 'Learn', href: '/learn' },
        { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        {
            title: 'Learning',
            items: [
                { id: 'planner', icon: 'event_note', label: 'Planner', href: '/planner' },
                { id: 'learn', icon: 'local_library', label: 'Learn', href: '/learn' },
                { id: 'calendar', icon: 'calendar_today', label: 'Calendar', href: '/calendar' },
            ],
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
            ],
        },
    ],
    getBasePath: (slug) => `/tenant/${slug}/learner`,
};

const APPLICANT_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'application', icon: 'description', iconFilled: 'description', label: 'Application', href: '/application' },
        { id: 'documents', icon: 'folder', label: 'Documents', href: '/documents' },
        { id: 'status', icon: 'pending', label: 'Status', href: '/status' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Messages', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'application', icon: 'description', label: 'Application', href: '/application' },
        { id: 'documents', icon: 'folder', label: 'Documents', href: '/documents' },
        { id: 'status', icon: 'pending', label: 'Status', href: '/status' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/learner`,
};

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNITY ROLES
// ═══════════════════════════════════════════════════════════════════════════

const ALUMNI_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'community', icon: 'groups', iconFilled: 'groups', label: 'Community', href: '/community' },
        { id: 'events', icon: 'event', label: 'Events', href: '/events' },
        { id: 'directory', icon: 'contacts', label: 'Directory', href: '/directory' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Messages', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'community', icon: 'groups', label: 'Community', href: '/community' },
        { id: 'events', icon: 'event', label: 'Events', href: '/events' },
        { id: 'directory', icon: 'contacts', label: 'Directory', href: '/directory' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/parent`,
};

const SGB_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'meetings', icon: 'groups', iconFilled: 'groups', label: 'Meetings', href: '/meetings' },
        { id: 'documents', icon: 'folder', label: 'Documents', href: '/documents' },
        { id: 'votes', icon: 'how_to_vote', label: 'Votes', href: '/votes' },
        { id: 'governance', icon: 'gavel', label: 'Governance', href: '/governance' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'meetings', icon: 'groups', label: 'Meetings', href: '/meetings' },
        { id: 'documents', icon: 'folder', label: 'Documents', href: '/documents' },
        { id: 'votes', icon: 'how_to_vote', label: 'Votes', href: '/votes' },
        { id: 'governance', icon: 'gavel', label: 'Governance', href: '/governance' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/parent`,
};

const PTA_CONFIG: RoleNavConfig = {
    bottomTabs: [
        { id: 'events', icon: 'event', iconFilled: 'event', label: 'Events', href: '/events' },
        { id: 'fundraising', icon: 'volunteer_activism', label: 'Fundraising', href: '/fundraising' },
        { id: 'volunteers', icon: 'diversity_3', label: 'Volunteers', href: '/volunteers' },
        { id: 'messages', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', label: 'Messages', href: '/messages' },
        MENU_TAB,
    ],
    allItems: [
        { id: 'events', icon: 'event', label: 'Events', href: '/events' },
        { id: 'fundraising', icon: 'volunteer_activism', label: 'Fundraising', href: '/fundraising' },
        { id: 'volunteers', icon: 'diversity_3', label: 'Volunteers', href: '/volunteers' },
        { id: 'messages', icon: 'chat_bubble_outline', label: 'Messages', href: '/messages' },
        { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
    ],
    menuSections: [
        { title: 'System', items: [{ id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' }] },
    ],
    getBasePath: (slug) => `/tenant/${slug}/parent`,
};

// ═══════════════════════════════════════════════════════════════════════════
// ROLE → CONFIG MAP
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_NAV_MAP: Record<string, RoleNavConfig> = {
    // Platform
    platform_super_admin: PLATFORM_ADMIN_CONFIG,
    platform_secretary: SECRETARY_CONFIG,
    platform_support: PLATFORM_ADMIN_CONFIG,
    // Governance
    brand_admin: PLATFORM_ADMIN_CONFIG,
    tenant_admin: TENANT_ADMIN_CONFIG,
    main_branch_admin: TENANT_ADMIN_CONFIG,
    branch_admin: TENANT_ADMIN_CONFIG,
    // Operations
    admissions_officer: ADMISSIONS_CONFIG,
    finance_officer: FINANCE_CONFIG,
    hr_admin: HR_CONFIG,
    reception: RECEPTION_CONFIG,
    it_admin: IT_ADMIN_CONFIG,
    // Academic leadership
    principal: PRINCIPAL_SMT_CONFIG,
    deputy_principal: PRINCIPAL_SMT_CONFIG,
    smt: PRINCIPAL_SMT_CONFIG,
    hod: HOD_CONFIG,
    grade_head: HOD_CONFIG,
    phase_head: HOD_CONFIG,
    // Teaching
    class_teacher: TEACHER_CONFIG,
    subject_teacher: TEACHER_CONFIG,
    teacher: TEACHER_CONFIG,
    // Support
    counsellor: COUNSELLOR_CONFIG,
    nurse: NURSE_CONFIG,
    transport: TRANSPORT_CONFIG,
    aftercare: AFTERCARE_CONFIG,
    security: SECURITY_CONFIG,
    caretaker: CARETAKER_CONFIG,
    staff: GENERAL_STAFF_CONFIG,
    // End users
    parent: PARENT_CONFIG,
    guardian: PARENT_CONFIG,
    learner: LEARNER_CONFIG,
    student: LEARNER_CONFIG,
    applicant: APPLICANT_CONFIG,
    // Community
    alumni: ALUMNI_CONFIG,
    sgb_member: SGB_CONFIG,
    parent_association: PTA_CONFIG,
    // Simplified 4-role keys (backward compat with RoleContext)
    admin: TENANT_ADMIN_CONFIG,
};

/**
 * Get the navigation config for a given role.
 * Falls back to PARENT_CONFIG if role is unknown.
 */
export function getNavConfig(role: string): RoleNavConfig {
    return ROLE_NAV_MAP[role] || PARENT_CONFIG;
}

/**
 * Determine admin sub-type from a full role string.
 */
export function getAdminRoleType(role: string): 'platform' | 'secretary' | 'tenant' {
    const platformRoles = ['platform_super_admin', 'brand_admin', 'platform_support'];
    const secretaryRoles = ['platform_secretary'];
    if (platformRoles.includes(role)) return 'platform';
    if (secretaryRoles.includes(role)) return 'secretary';
    return 'tenant';
}

// ════════════════════════════════════════════════════════════════════════════
// Header Feature Flags — role-aware header icon visibility
// ════════════════════════════════════════════════════════════════════════════

export interface HeaderFeatureFlags {
    showEmergency: boolean;
    showScope: boolean;
    showReports: boolean;
}

const EMERGENCY_ROLES = new Set([
    'tenant_admin', 'main_branch_admin', 'branch_admin',
    'admissions_officer', 'finance_officer', 'hr_admin', 'reception', 'it_admin',
    'principal', 'deputy_principal', 'smt', 'hod', 'grade_head', 'phase_head',
    'class_teacher', 'subject_teacher', 'teacher',
    'counsellor', 'nurse', 'transport', 'aftercare', 'security', 'caretaker', 'staff',
    'parent', 'guardian', 'learner', 'student',
]);

const SCOPE_ROLES = new Set([
    'tenant_admin', 'main_branch_admin', 'branch_admin',
    'admissions_officer', 'finance_officer', 'hr_admin', 'reception', 'it_admin',
    'principal', 'deputy_principal', 'smt', 'hod', 'grade_head', 'phase_head',
]);

const REPORTS_ROLES = new Set([
    'tenant_admin', 'main_branch_admin', 'branch_admin',
    'finance_officer', 'hr_admin',
    'principal', 'deputy_principal', 'smt', 'hod', 'grade_head', 'phase_head',
    'class_teacher', 'subject_teacher', 'teacher',
    'counsellor', 'staff',
]);

export function getHeaderFeatures(role: string): HeaderFeatureFlags {
    return {
        showEmergency: EMERGENCY_ROLES.has(role),
        showScope: SCOPE_ROLES.has(role),
        showReports: REPORTS_ROLES.has(role),
    };
}
