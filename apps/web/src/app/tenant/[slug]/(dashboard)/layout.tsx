'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { Shell } from '@/components/layout/Shell';
import { AdminShell } from '@/components/admin/layout/AdminShell';
import pkg from '../../../../../package.json';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const SECRETARY_ROLES = ['platform_secretary'];

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
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [sessionChecked, setSessionChecked] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [userRole, setUserRole] = useState<string>('parent');

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

    // Get initial role from URL path or local storage
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

    // Determine admin role type for AdminShell
    const getAdminRoleType = (): 'platform' | 'secretary' | 'tenant' => {
        if (typeof window !== 'undefined') {
            const r = localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role') || '';
            if (PLATFORM_ROLES.includes(r)) return 'platform';
            if (SECRETARY_ROLES.includes(r)) return 'secretary';
        }
        return 'tenant';
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
            const currentRole = localStorage.getItem('user_role') || userRole;

            // Determine which route segment the user is on
            for (const [routeSegment, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
                if (pathname.includes(routeSegment)) {
                    // Check if user's role is allowed on this route
                    if (!allowedRoles.includes(currentRole)) {
                        // Redirect to the correct dashboard for their role
                        const correctPath = getDashboardForRole(currentRole);
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
            <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Initializing secure workspace...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!user && !hasSession) {
        return null;
    }

    // Create a mock user if we only have session
    const displayUser = user || {
        uid: localStorage.getItem('user_id') || '',
        email: null,
        displayName: null,
        photoURL: null,
    };

    // Determine if this is an admin route
    const isAdminRoute = pathname?.includes('/admin');

    // Admin routes → AdminShell; Everything else → Parent/Learner Shell
    if (isAdminRoute) {
        const adminRole = getAdminRoleType();
        return (
            <RoleProvider tenantSlug={slug} initialRole={getInitialRole()}>
                <AdminShell
                    tenantSlug={slug}
                    adminRole={adminRole}
                    appVersion={pkg.version}
                    headerProps={{
                        title: slug.toUpperCase(),
                        subtitle: adminRole === 'platform' ? 'Platform Admin'
                            : adminRole === 'secretary' ? 'Secretary'
                                : 'School Admin',
                        logoUrl: `https://ui-avatars.com/api/?name=${slug}&background=random`,
                    }}
                >
                    {children}
                </AdminShell>
            </RoleProvider>
        );
    }

    return (
        <RoleProvider tenantSlug={slug} initialRole={getInitialRole()}>
            <Shell
                tenantName={slug.toUpperCase()}
                tenantLogo={`https://ui-avatars.com/api/?name=${slug}&background=random`}
                user={displayUser as any}
                role={getInitialRole()}
            >
                {children}
            </Shell>
        </RoleProvider>
    );
}
