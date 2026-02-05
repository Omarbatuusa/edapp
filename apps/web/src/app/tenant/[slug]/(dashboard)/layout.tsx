'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { Shell } from '@/components/layout/Shell';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

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
                    // Also save role per tenant
                    localStorage.setItem(`edapp_role_${slug}`, role);
                }
            }
            setSessionChecked(true);
        }
    }, [slug]);

    // Get initial role from URL path or local storage
    const getInitialRole = () => {
        if (typeof window !== 'undefined') {
            // Check if role is in URL path
            if (pathname.includes('/admin')) return 'admin';
            if (pathname.includes('/staff')) return 'staff';
            if (pathname.includes('/parent')) return 'parent';
            if (pathname.includes('/learner')) return 'learner';

            // Fall back to stored role
            const stored = localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role');
            if (stored && ['admin', 'staff', 'parent', 'learner'].includes(stored)) {
                return stored as 'admin' | 'staff' | 'parent' | 'learner';
            }
        }
        return 'parent'; // Default fallback
    };

    // Redirect to login only if:
    // 1. Auth check is complete (not loading)
    // 2. Session check is complete
    // 3. No Firebase user AND no localStorage session
    useEffect(() => {
        if (!authLoading && sessionChecked) {
            if (!user && !hasSession) {
                router.push(`/tenant/${slug}/login`);
            }
        }
    }, [user, authLoading, sessionChecked, hasSession, router, slug]);

    // Show loading state while checking auth
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

    // Don't render if not authenticated (either Firebase or session)
    if (!user && !hasSession) {
        return null;
    }

    // Create a mock user object if we only have session (no Firebase user)
    const displayUser = user || {
        uid: localStorage.getItem('user_id') || '',
        email: null,
        displayName: null,
        photoURL: null,
    };

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
