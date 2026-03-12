/**
 * Maps old role names to new role names for backward compatibility.
 * The old names still work in the UserRole enum; these aliases allow
 * the new permission system to recognize both forms.
 */
export const ROLE_ALIASES: Record<string, string> = {
    'platform_super_admin': 'app_super_admin',
    'platform_secretary': 'app_secretary',
    'platform_support': 'app_support',
    'reception': 'receptionist',
    'nurse': 'school_nurse',
    'caretaker': 'groundskeeper',
};

/** Resolve a role code to its canonical form */
export function resolveRoleAlias(role: string): string {
    return ROLE_ALIASES[role] || role;
}
