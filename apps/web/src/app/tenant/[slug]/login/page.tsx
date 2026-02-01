"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { HelpPopup } from "@/components/discovery/help-popup"

// Default logo for tenants without custom logo
const DEFAULT_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuC96FXTYpIW1fqA_8czdGZvU6P_lFoVuIZZ1lhBzMSykuIEyQEElOa0-AB8eFKKQhEUUcNKGDznJwQTXAVT5Q6tSK6xbDteUL38WpifPHGqw5jvjvBAxtZr8tnMiFQ1Iazh_k1yw89QLWwMV4gDr5e0nBFuStsd9n1pq7B9u8kideTnBdlz3T3EuCJ9JcF7qnH9S-Xca5wX-eyf59mdPPU-dTyFFV0Hjr1Dh710MQq_kKGssRnXVxovzURFa0Z67wQZZcrGd7RAU1w"


interface TenantData {
    school_name: string;
    tenant_slug: string;
    logo_url?: string;
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
        // Go back to Discovery logic, keeping query if needed, or just home.
        // Using router.push('/') for client-side transition
        router.push('/')
    }

    const roles = [
        {
            id: 'staff',
            title: 'Staff',
            subtitle: 'Teaching & Support',
            description: 'Teachers & Faculty',
            icon: 'badge'
        },
        {
            id: 'admin',
            title: 'Admin',
            subtitle: 'School Management',
            description: 'System Managers',
            icon: 'admin_panel_settings'
        },
        {
            id: 'parent',
            title: 'Parent or Guardian',
            subtitle: 'Family Access',
            description: "Monitor child's learning journey",
            icon: 'family_restroom'
        },
        {
            id: 'learner',
            title: 'Learner',
            subtitle: 'Student Access',
            description: 'Access courses & lessons',
            icon: 'school'
        }
    ]

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300 overflow-x-hidden overflow-y-auto w-full">
            {/* Header */}
            <AuthHeader
                onBack={handleBack}
                onHelp={() => setShowHelp(true)}
                variant="tenant"
                tenantName={tenant?.school_name}
                tenantLogo={tenant?.logo_url || DEFAULT_LOGO}
                transparent={!scrolled}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center px-4 pb-8 max-w-[480px] mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
                <h1 className="text-2xl font-bold tracking-tight text-center mt-4">
                    Choose your role
                </h1>
                <p className="mt-2 text-sm text-muted-foreground text-center mb-8">
                    Select how you'll be using the platform.
                </p>

                <div className="w-full space-y-3">
                    {roles.map((role) => {
                        const isLastRole = lastRole === role.id;
                        const isSelected = selectedRole === role.id;

                        return (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)}
                                disabled={selectedRole !== null}
                                className={`
                                    role-card-apple w-full flex items-center gap-4 text-left p-4
                                    active:scale-[0.98] disabled:opacity-60 relative group
                                    ${isLastRole ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
                                    ${isSelected ? 'selected' : ''}
                                `}
                            >
                                {isLastRole && (
                                    <div className="absolute top-3 right-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Last used
                                        </span>
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isLastRole
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {role.icon}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-foreground leading-tight">
                                        {role.title}
                                    </h3>
                                    {/* Subtitle */}
                                    <p className="text-[13px] font-medium text-muted-foreground/80 mt-0.5">
                                        {role.subtitle}
                                    </p>
                                    {/* Description (Old one? Prompt says short subtitle line under role title. 
                                        The prompt lists EXACT subtitles. It doesn't explicitly say "Remove description" but 
                                        "Update... to include a small subtitle line... Keep spacing tight...".
                                        The example image in prompt has "Staff -> Teachers & Faculty".
                                        The user's NEW request says: "Staff -> Teaching & Support".
                                        If I add subtitle, maybe I should use it INSTEAD of description or WITH it?
                                        "Subtitle sits directly under the role title".
                                        The old description was "Teachers & Faculty".
                                        The new subtitle is "Teaching & Support".
                                        It seems the subtitle REPLACES the description or acts as the main secondary text.
                                        I will use the subtitle line AS the description line essentially, or render both if spacing permits.
                                        The prompt says "Keep spacing tight... do not increase card height significantly."
                                        I'll stick to just the subtitle line as the secondary text for cleaner look, unless the "Description" adds immense value.
                                        Actually, "Teachers & Faculty" vs "Teaching & Support".
                                        I'll just use the subtitle as the secondary line.
                                    */}
                                </div>

                                <span className="material-symbols-outlined text-muted-foreground/50 text-xl shrink-0 group-hover:text-primary/50 transition-colors">
                                    chevron_right
                                </span>
                            </button>
                        )
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className={`sticky bottom-0 bg-background/95 backdrop-blur-md z-20 transition-all duration-300 ${scrolled ? 'border-t border-border/5' : ''}`}>
                <AuthFooter />
            </footer>

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
