/**
 * Centralized role permission map for admin features.
 *
 * Each feature defines which roles can view it and which can manage (create/edit/delete).
 * Used by admin pages to conditionally render actions based on the logged-in user's role.
 */

export const FEATURE_PERMISSIONS: Record<string, { view: string[]; manage: string[] }> = {
    tenants: {
        view: ['platform_super_admin', 'brand_admin', 'platform_secretary'],
        manage: ['platform_super_admin', 'brand_admin'],
    },
    brands: {
        view: ['platform_super_admin', 'brand_admin'],
        manage: ['platform_super_admin', 'brand_admin'],
    },
    dictionaries: {
        view: ['platform_super_admin', 'brand_admin'],
        manage: ['platform_super_admin', 'brand_admin'],
    },
    people: {
        view: ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin', 'platform_secretary'],
        manage: ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin'],
    },
    school_data: {
        view: ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin'],
        manage: ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin'],
    },
    branches: {
        view: ['platform_super_admin', 'tenant_admin', 'main_branch_admin', 'branch_admin'],
        manage: ['platform_super_admin', 'tenant_admin', 'main_branch_admin'],
    },
    admissions: {
        view: ['platform_super_admin', 'brand_admin', 'tenant_admin', 'admissions_officer'],
        manage: ['platform_super_admin', 'brand_admin', 'tenant_admin', 'admissions_officer'],
    },
    integrations: {
        view: ['platform_super_admin', 'brand_admin', 'tenant_admin'],
        manage: ['platform_super_admin', 'brand_admin', 'tenant_admin'],
    },
    audit: {
        view: ['platform_super_admin', 'brand_admin'],
        manage: [],
    },
    inbox: {
        view: ['platform_secretary'],
        manage: ['platform_secretary'],
    },
    approvals: {
        view: ['platform_secretary'],
        manage: ['platform_secretary'],
    },
    control: {
        view: ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin'],
        manage: ['platform_super_admin', 'brand_admin', 'tenant_admin'],
    },
};

/** Check if a role can view a feature */
export function canView(role: string, feature: string): boolean {
    return FEATURE_PERMISSIONS[feature]?.view.includes(role) ?? false;
}

/** Check if a role can manage (create/edit/delete) a feature */
export function canManage(role: string, feature: string): boolean {
    return FEATURE_PERMISSIONS[feature]?.manage.includes(role) ?? false;
}

/** Get the user's role from localStorage */
export function getUserRole(slug?: string): string {
    if (typeof window === 'undefined') return '';
    if (slug) {
        return localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role') || '';
    }
    return localStorage.getItem('user_role') || '';
}
