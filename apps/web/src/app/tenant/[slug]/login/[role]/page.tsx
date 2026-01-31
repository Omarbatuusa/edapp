"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { HelpPopup } from "@/components/discovery/help-popup"

// Mock Feature Flags (In production, fetch from Tenant Configuration)
const FEATURE_FLAGS = {
    methods: {
        email_password: true,
        email_magic_link: true,
        google: false,
        phone_otp: false
    }
}

const ROLE_CONFIG: Record<string, { label: string; icon: string }> = {
    admin: { label: 'Admin', icon: 'admin_panel_settings' },
    staff: { label: 'Staff', icon: 'badge' },
    parent: { label: 'Parent', icon: 'family_restroom' }
}

export default function RoleLoginPage({ params }: { params: Promise<{ slug: string, role: string }> }) {
    const { slug, role } = use(params)
    const router = useRouter()

    const [view, setView] = useState<'methods' | 'email_password' | 'email_magic'>('methods')
    const [showHelp, setShowHelp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberDevice, setRememberDevice] = useState(true)
    const [rememberDuration, setRememberDuration] = useState('30')

    const roleConfig = ROLE_CONFIG[role] || { label: 'User', icon: 'person' }

    // Scroll shadow detection
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const enabledMethods = Object.entries(FEATURE_FLAGS.methods).filter(([_, enabled]) => enabled)
        if (enabledMethods.length === 1) {
            const method = enabledMethods[0][0]
            if (method === 'email_password') setView('email_password')
            else if (method === 'email_magic_link') setView('email_magic')
        }
    }, [])

    const handleBack = () => {
        if (view === 'methods') {
            router.push(`/tenant/${slug}/login`)
        } else {
            setView('methods')
        }
    }

    const handleMethodSelect = (method: 'email_password' | 'email_magic' | 'google' | 'phone') => {
        if (method === 'email_password') setView('email_password')
        else if (method === 'email_magic') setView('email_magic')
        else alert(`${method} login not yet implemented`)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            alert(`Login: ${email}\nRole: ${role}\nRemember: ${rememberDuration} days`)
        }, 1000)
    }

    // Method Picker
    const MethodPicker = () => (
        <div className="flex-1 flex flex-col items-center px-6">
            {/* Icon */}
            <div className="mt-8 mb-5 h-14 w-14 bg-primary rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">{roleConfig.icon}</span>
            </div>

            {/* Headline - minimal */}
            <h1 className="text-2xl font-bold tracking-tight text-center">
                Sign in as {roleConfig.label}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                Select your sign in method.
            </p>

            {/* Methods */}
            <div className="w-full mt-8 space-y-3 max-w-sm">
                {FEATURE_FLAGS.methods.google && (
                    <button
                        onClick={() => handleMethodSelect('google')}
                        className="w-full flex items-center gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-4 py-4 rounded-xl transition-all hover:border-slate-300 active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </div>
                        <span className="text-base font-medium flex-1 text-left">Continue with Google</span>
                        <span className="material-symbols-outlined text-slate-300 text-xl">chevron_right</span>
                    </button>
                )}

                {FEATURE_FLAGS.methods.email_magic_link && (
                    <button
                        onClick={() => handleMethodSelect('email_magic')}
                        className="w-full flex items-center gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-4 py-4 rounded-xl transition-all hover:border-slate-300 active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
                        </div>
                        <span className="text-base font-medium flex-1 text-left">Email Magic Link</span>
                        <span className="material-symbols-outlined text-slate-300 text-xl">chevron_right</span>
                    </button>
                )}

                {FEATURE_FLAGS.methods.email_password && (
                    <button
                        onClick={() => handleMethodSelect('email_password')}
                        className="w-full flex items-center gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-4 py-4 rounded-xl transition-all hover:border-slate-300 active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500 text-xl">mail</span>
                        </div>
                        <span className="text-base font-medium flex-1 text-left">Email + Password</span>
                        <span className="material-symbols-outlined text-slate-300 text-xl">chevron_right</span>
                    </button>
                )}

                {FEATURE_FLAGS.methods.phone_otp && (
                    <button
                        onClick={() => handleMethodSelect('phone')}
                        className="w-full flex items-center gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-4 py-4 rounded-xl transition-all hover:border-slate-300 active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500 text-xl">phone_iphone</span>
                        </div>
                        <span className="text-base font-medium flex-1 text-left">Phone Login</span>
                        <span className="material-symbols-outlined text-slate-300 text-xl">chevron_right</span>
                    </button>
                )}
            </div>
        </div>
    )

    // Email + Password Form
    const EmailPasswordForm = () => (
        <div className="flex-1 flex flex-col items-center px-6">
            {/* Icon */}
            <div className="mt-8 mb-5 h-14 w-14 bg-primary rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">mail</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-bold tracking-tight text-center">
                Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                Enter your credentials to continue.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-sm mt-8 space-y-4">
                {/* Email Field with icon */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                        mail
                    </span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                        required
                    />
                </div>

                {/* Password Field with icon and visibility toggle */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                        lock
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                </div>

                {/* Remember Device */}
                <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${rememberDevice ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                            {rememberDevice && <span className="material-symbols-outlined text-white text-sm">check</span>}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={rememberDevice}
                            onChange={() => setRememberDevice(!rememberDevice)}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Remember this device</span>
                    </label>

                    {rememberDevice && (
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {['7', '30', '90'].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setRememberDuration(d)}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${rememberDuration === d
                                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {d} days
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full h-14 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Signing in...' : (
                        <>
                            <span>Continue</span>
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    )

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300 overflow-x-hidden">
            {/* Header - sticky with scroll shadow */}
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

            <main className="flex-1 w-full max-w-md mx-auto flex flex-col">
                {view === 'methods' && <MethodPicker />}
                {view === 'email_password' && <EmailPasswordForm />}
                {view === 'email_magic' && <EmailPasswordForm />}
            </main>

            <AuthFooter />

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
