"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { HelpPopup } from "@/components/discovery/help-popup"

interface TenantData {
    school_name: string;
    tenant_slug: string;
    main_branch?: {
        branch_name: string;
        is_main_branch: boolean;
    };
}

export default function RoleSelectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()

    const [lastRole, setLastRole] = useState<string | null>(null)
    const [showHelp, setShowHelp] = useState(false)
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const [tenant, setTenant] = useState<TenantData | null>(null)

    // Scroll shadow detection
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Fetch tenant info
    useEffect(() => {
        async function fetchTenant() {
            try {
                let res = await fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`)
                if (!res.ok) {
                    res = await fetch(`/v1/tenants/lookup-by-code?code=${slug.toUpperCase()}`)
                }
                if (res.ok) {
                    const data = await res.json()
                    setTenant(data)
                }
            } catch (err) {
                // Fail silently
            }
        }
        fetchTenant()
    }, [slug])

    useEffect(() => {
        const stored = localStorage.getItem(`last_role_${slug}`)
        if (stored) {
            setLastRole(stored)
        }
    }, [slug])

    // Auto-advance when role is selected
    const handleRoleSelect = (roleId: string) => {
        setSelectedRole(roleId)
        localStorage.setItem(`last_role_${slug}`, roleId)

        const correctSlug = tenant?.tenant_slug || slug
        setTimeout(() => {
            router.push(`/tenant/${correctSlug}/login/${roleId}`)
        }, 150)
    }

    const handleBack = () => {
        const protocol = window.location.protocol
        const host = window.location.host
        if (host.includes('localhost')) {
            window.location.href = `${protocol}//localhost:3000`
            return
        }
        const baseDomain = host.substring(host.indexOf('.') + 1)
        window.location.href = `${protocol}//app.${baseDomain}`
    }

    const roles = [
        {
            id: 'admin',
            title: 'Admin',
            description: 'Manage users and content',
            icon: 'admin_panel_settings'
        },
        {
            id: 'staff',
            title: 'Staff',
            description: 'View progress and reporting',
            icon: 'badge'
        },
        {
            id: 'parent',
            title: 'Parent / Guardian',
            description: "Monitor child's learning journey",
            icon: 'family_restroom'
        },
        {
            id: 'learner',
            title: 'Learner',
            description: 'Access your courses and lessons',
            icon: 'school'
        }
    ]

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300 overflow-x-hidden overflow-y-auto">
            {/* Header */}
            <header className={`flex items-center justify-between p-4 sticky top-0 bg-[#f6f7f8]/95 dark:bg-[#101922]/95 backdrop-blur-md z-20 transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>
                <button
                    onClick={handleBack}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                    aria-label="Back"
                >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                        aria-label="Help"
                    >
                        <span className="material-symbols-outlined text-2xl">help_outline</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center px-6 pb-8 max-w-md mx-auto w-full">
                <h1 className="text-2xl font-bold tracking-tight text-center mt-8">
                    Choose your role
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                    Select how you'll be using the platform.
                </p>
                {/* Tenant and Branch name */}
                <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {tenant ? tenant.school_name : slug}
                    </p>
                    {tenant?.main_branch && !tenant.main_branch.is_main_branch && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {tenant.main_branch.branch_name}
                        </p>
                    )}
                </div>

                {/* Role Cards */}
                <div className="w-full mt-8 space-y-3">
                    {roles.map((role) => {
                        const isLastRole = lastRole === role.id
                        const isSelected = selectedRole === role.id

                        return (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)}
                                disabled={selectedRole !== null}
                                className={`
                                    relative w-full px-4 py-4 rounded-xl transition-all duration-150
                                    bg-white dark:bg-slate-900/50 
                                    border border-slate-200 dark:border-slate-800
                                    flex items-center gap-4 
                                    text-left
                                    active:scale-[0.98]
                                    disabled:opacity-60
                                    ${isLastRole ? 'border-primary/30 bg-primary/5 dark:bg-primary/10' : 'hover:border-slate-300 dark:hover:border-slate-700'}
                                    ${isSelected ? 'scale-[0.98]' : ''}
                                `}
                            >
                                {isLastRole && (
                                    <div className="absolute top-2 right-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Last used
                                        </span>
                                    </div>
                                )}

                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLastRole
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {role.icon}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                        {role.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {role.description}
                                    </p>
                                </div>

                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-xl shrink-0">
                                    chevron_right
                                </span>
                            </button>
                        )
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className={`sticky bottom-0 bg-[#f6f7f8]/95 dark:bg-[#101922]/95 backdrop-blur-md z-20 transition-shadow duration-200 ${scrolled ? '' : 'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'}`}>
                <AuthFooter />
            </footer>

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
