"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { HelpPopup } from "@/components/discovery/help-popup"

export default function RoleSelectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()

    const [lastRole, setLastRole] = useState<string | null>(null)
    const [showHelp, setShowHelp] = useState(false)
    const [selectedRole, setSelectedRole] = useState<string | null>(null)

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

        setTimeout(() => {
            router.push(`/tenant/${slug}/login/${roleId}`)
        }, 150)
    }

    // Back to Tenant Confirmation (the screen with school logo)
    const handleBack = () => {
        router.push(`/tenant/${slug}`)
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
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* Header - consistent with Discovery */}
            <header className="flex items-center justify-between p-4 sticky top-0 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-md z-10">
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

            {/* Main Content - centered like Discovery */}
            <main className="flex-1 flex flex-col items-center px-6 pb-8 max-w-md mx-auto w-full">
                {/* Headline - minimal & professional */}
                <h1 className="text-2xl font-bold tracking-tight text-center mt-8">
                    Choose your role
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                    Select how you'll be using the platform.
                </p>

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
                                {/* Last used badge */}
                                {isLastRole && (
                                    <div className="absolute top-2 right-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Last used
                                        </span>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLastRole
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {role.icon}
                                    </span>
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                        {role.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {role.description}
                                    </p>
                                </div>

                                {/* Chevron */}
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-xl shrink-0">
                                    chevron_right
                                </span>
                            </button>
                        )
                    })}
                </div>
            </main>

            <AuthFooter />

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
