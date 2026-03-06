'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { TenantProvider, useTenant } from '@/contexts/TenantContext';
import { AppShell } from '@/components/shell/AppShell';
import { getNavConfig } from '@/config/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import pkg from '../../../../../package.json';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

/** Maps URL path segments to allowed roles */
const ROUTE_ROLE_MAP: Record<string, string[]> = {
    '/admin': [
        'admin', 'principal', 'deputy_principal', 'tenant_admin', 'main_branch_admin',
        'branch_admin', 'brand_admin', 'smt', 'hod', 'platform_super_admin',
        'platform_secretary', 'platform_support', 'admissions_officer',
        'finance_officer', 'hr_admin', 'reception', 'it_admin',
    ],
    '/staff': [
        'staff', 'teacher', 'class_teacher', 'subject_teacher', 'hod', 'grade_head',
        'phase_head', 'counsellor', 'nurse', 'transport', 'aftercare', 'security',
        'caretaker',
    ],
    '/learner': ['learner', 'student'],
    '/parent': ['parent', 'guardian'],
};

/** Given a user role, return the correct dashboard path segment */
function getDashboardForRole(role: string): string {
    switch (role) {
        case 'learner':
        case 'student':
            return '/learner';
        case 'parent':
        case 'guardian':
            return '/parent';
        case 'staff':
        case 'teacher':
        case 'class_teacher':
        case 'subject_teacher':
        case 'grade_head':
        case 'phase_head':
        case 'counsellor':
        case 'nurse':
        case 'transport':
        case 'aftercare':
        case 'security':
        case 'caretaker':
            return '/staff';
        case 'admin':
        case 'principal':
        case 'deputy_principal':
        case 'tenant_admin':
        case 'main_branch_admin':
        case 'branch_admin':
        case 'brand_admin':
        case 'smt':
        case 'hod':
        case 'platform_super_admin':
        case 'platform_secretary':
        case 'platform_support':
        case 'admissions_officer':
        case 'finance_officer':
        case 'hr_admin':
        case 'reception':
        case 'it_admin':
            return '/admin';
        default:
            return '';
    }
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const { slug } = use(params);

    return (
        <TenantProvider slug={slug}>
            <DashboardLayoutInner slug={slug}>
                {children}
            </DashboardLayoutInner>
        </TenantProvider>
    );
}

/** Inner component — hooks must be inside TenantProvider tree */
function DashboardLayoutInner({ slug, children }: { slug: string; children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
    const [sessionChecked, setSessionChecked] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [userRole, setUserRole] = useState<string>('parent');

    // Tenant data from context
    const { tenantDisplayName, tenantLogoUrl, branches, scope, scopeLabel, setScope } = useTenant();

    // User profile + role data
    const { currentRole, allRoles, switchRole, displayName } = useUserProfile(slug);

    // Check for session token in localStorage (from handoff flow)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const sessionToken = localStorage.getItem('session_token');
            const userId = localStorage.getItem('user_id');
            const role = localStorage.getItem('user_role');

            if (sessionToken && userId) {
                setHasSession(true);
                if (role) {
                    setUserRole(role);
                    localStorage.setItem(`edapp_role_${slug}`, role);
                }
            }
            setSessionChecked(true);
        }
    }, [slug]);

    // Get the full role string (31-value) from localStorage
    const getFullRole = (): string => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role') || userRole;
        }
        return userRole;
    };

    // Get simplified 4-role bucket for RoleProvider backward compat
    const getInitialRole = () => {
        if (typeof window !== 'undefined') {
            if (pathname.includes('/admin')) return 'admin';
            if (pathname.includes('/staff')) return 'staff';
            if (pathname.includes('/parent')) return 'parent';
            if (pathname.includes('/learner')) return 'learner';

            const stored = localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role');
            if (stored && ['admin', 'staff', 'parent', 'learner'].includes(stored)) {
                return stored as 'admin' | 'staff' | 'parent' | 'learner';
            }
        }
        return 'parent';
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && sessionChecked) {
            if (!user && !hasSession) {
                router.push(`/tenant/${slug}/login`);
            }
        }
    }, [user, authLoading, sessionChecked, hasSession, router, slug]);

    // Role-based route enforcement
    useEffect(() => {
        if (!authLoading && sessionChecked && (user || hasSession) && pathname) {
            const storedRole = localStorage.getItem('user_role') || userRole;

            for (const [routeSegment, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
                if (pathname.includes(routeSegment)) {
                    if (!allowedRoles.includes(storedRole)) {
                        const correctPath = getDashboardForRole(storedRole);
                        if (correctPath) {
                            router.replace(`/tenant/${slug}${correctPath}`);
                        }
                    }
                    break;
                }
            }
        }
    }, [authLoading, sessionChecked, user, hasSession, pathname, router, slug, userRole]);

    // Loading state
    if (authLoading || !sessionChecked) {
        return (
            <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[hsl(var(--admin-background))]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[hsl(var(--admin-primary)/0.3)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                    <p className="text-sm text-[hsl(var(--admin-text-muted))] animate-pulse">Initializing secure workspace...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!user && !hasSession) {
        return null;
    }

    // Create user object with profile data merged in
    const baseUser = user || {
        uid: localStorage.getItem('user_id') || '',
        email: null,
        displayName: null,
        photoURL: null,
    };

    // Spread to a plain object so we can override displayName
    const displayUser = {
        ...baseUser,
        displayName: baseUser.displayName || displayName || null,
    };

    // Universal AppShell for ALL roles
    const fullRole = getFullRole();
    const navConfig = getNavConfig(fullRole);

    // Show scope chip only when there are multiple branches
    const showScopeChip = branches.length > 1;

    return (
        <RoleProvider tenantSlug={slug} initialRole={getInitialRole()}>
            <AppShell
                tenantSlug={slug}
                tenantName={tenantDisplayName}
                tenantLogo={tenantLogoUrl}
                user={displayUser}
                role={fullRole}
                navConfig={navConfig}
                appVersion={pkg.version}
                scopeLabel={scopeLabel}
                showScopeChip={showScopeChip}
                branches={branches}
                currentScope={scope}
                onScopeChange={setScope}
                currentRole={currentRole || undefined}
                allRoles={allRoles}
                onRoleSwitch={switchRole}
            >
                {children}
            </AppShell>
        </RoleProvider>
    );
}
