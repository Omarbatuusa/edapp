'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { Shell } from '@/components/layout/Shell';
import { AdminShell } from '@/components/admin/layout/AdminShell';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

const PLATFORM_ROLES = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin'];
const SECRETARY_ROLES = ['PLATFORM_SECRETARY'];

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const { slug } = use(params);
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
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
            if (PLATFORM_ROLES.some(pr => r.includes(pr) || pr.includes(r))) return 'platform';
            if (SECRETARY_ROLES.some(sr => r.includes(sr) || sr.includes(r))) return 'secretary';
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
