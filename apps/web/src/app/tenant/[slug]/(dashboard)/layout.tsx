'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    const { user, loading } = useAuth();

    // Get initial role from URL path or local storage
    const getInitialRole = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`edapp_role_${slug}`);
            if (stored && ['admin', 'staff', 'parent', 'learner'].includes(stored)) {
                return stored as 'admin' | 'staff' | 'parent' | 'learner';
            }
        }
        return 'parent'; // Default fallback
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push(`/tenant/${slug}/login`);
        }
    }, [user, loading, router, slug]);

    // Show loading state while checking auth
    if (loading) {
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
    if (!user) {
        return null;
    }

    return (
        <RoleProvider tenantSlug={slug} initialRole={getInitialRole()}>
            <Shell
                tenantName={slug.toUpperCase()}
                tenantLogo={`https://ui-avatars.com/api/?name=${slug}&background=random`} // Mock logo
                user={user}
                role={getInitialRole()}
            >
                {children}
            </Shell>
        </RoleProvider>
    );
}
