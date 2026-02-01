'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { RoleSwitcher } from '@/components/dashboard/role-switcher'
import { ThemeToggle } from '@/components/discovery/theme-toggle'
import { Shell } from '@/components/layout/Shell'

interface DashboardLayoutProps {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const { slug } = use(params)
    const router = useRouter()
    const { user, loading } = useAuth()

    // Get initial role from URL path if present (e.g. came from /login/admin)
    const getInitialRole = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`edapp_role_${slug}`)
            if (stored && ['admin', 'staff', 'parent', 'learner'].includes(stored)) {
                return stored as 'admin' | 'staff' | 'parent' | 'learner'
            }
        }
        return 'parent'
    }

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push(`/tenant/${slug}/login`)
        }
    }, [user, loading, router, slug])

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#f6f7f8] dark:bg-[#101922]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render if not authenticated
    if (!user) {
        return null
    }

    return (
        <RoleProvider tenantSlug={slug} initialRole={getInitialRole()}>
            <Shell
                tenantName={slug.toUpperCase()} // In real app, fetch tenant details
                user={user}
                role={getInitialRole()}
            >
                {children}
            </Shell>
        </RoleProvider>
    )
}
