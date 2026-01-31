'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'
import { BottomNav } from '@/components/dashboard/bottom-nav'
import { RoleSwitcher } from '@/components/dashboard/role-switcher'
import { ThemeToggle } from '@/components/discovery/theme-toggle'

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
            <div className="min-h-screen min-h-[100dvh] bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 flex flex-col">
                {/* Header */}
                <header className="sticky top-0 bg-white/95 dark:bg-[#101922]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30">
                    <div className="flex items-center justify-between h-14 px-4 max-w-5xl mx-auto">
                        {/* Logo / School Name */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-lg">school</span>
                            </div>
                            <span className="font-semibold text-sm hidden sm:block">EdApp</span>
                        </div>

                        {/* Right side - Role Switcher + Theme + Profile */}
                        <div className="flex items-center gap-2">
                            <RoleSwitcher />
                            <ThemeToggle />
                            <button
                                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden"
                                title="Profile"
                            >
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-lg">person</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 pb-20 md:pb-0">
                    {children}
                </main>

                {/* Bottom Navigation (mobile only) */}
                <BottomNav tenantSlug={slug} />
            </div>
        </RoleProvider>
    )
}
