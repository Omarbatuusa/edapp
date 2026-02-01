"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { HelpPopup } from "@/components/discovery/help-popup"
import { useAuth } from "@/contexts/AuthContext"

export default function ForgotPasswordPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const { resetPassword } = useAuth()

    const [showHelp, setShowHelp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [tenant, setTenant] = useState<{ school_name: string; tenant_slug: string } | null>(null)

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            await resetPassword(email)
            setSuccessMessage("If an account exists for this email, you will receive a password reset link.")
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email'
            if (errorMessage.includes('auth/user-not-found')) {
                // For security, strict generic message or specific? 
                // Usually for forgot password we don't want to reveal if user exists, 
                // but existing login page did. Let's stick to helpful message for now or generic for security.
                // The plan said: "Show success message: 'If an account exists...'" -> Implicitly secure.
                // But wait, if I want to be helpful to the user I might show error. 
                // However, best practice is the generic message.
                // Let's just show the success message regardless of user-not-found to prevent enumeration,
                // UNLESS it's a 'too many requests' error.

                setSuccessMessage("If an account exists for this email, you will receive a password reset link.")
            } else if (errorMessage.includes('auth/too-many-requests')) {
                setError('Too many attempts. Please try again later')
            } else {
                setError('Failed to send reset email. Please try again')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleBack = () => {
        const correctSlug = tenant?.tenant_slug || slug
        // Go back to role selection or login? 
        // Probably generic login or role select. Let's go to role select strictly as it is the "home" of tenant auth.
        // Or if we know the role... we don't know the role here. 
        // So just tenant root.
        router.push(`/tenant/${correctSlug}`)
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300 overflow-x-hidden">
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

            <main className="flex-1 w-full max-w-md mx-auto flex flex-col items-center px-6 pb-8">
                {/* Icon */}
                <div className="mt-8 mb-5 h-14 w-14 bg-primary rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">lock_reset</span>
                </div>

                {/* Headline */}
                <h1 className="text-2xl font-bold tracking-tight text-center">
                    Forgot Password?
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                    Enter your email to receive a reset link.
                </p>
                {/* Tenant name */}
                {tenant && (
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 text-center">
                        {tenant.school_name}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8 space-y-4">
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

                    {/* Success message */}
                    {successMessage && (
                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-600 dark:text-green-400 text-center">{successMessage}</p>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full h-14 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Sending...' : (
                            <>
                                <span>Send Reset Link</span>
                                <span className="material-symbols-outlined text-xl">send</span>
                            </>
                        )}
                    </button>

                    {/* Back to Login Link */}
                    <div className="pt-4 text-center">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            Back to login
                        </button>
                    </div>

                </form>
            </main>

            {/* Footer */}
            <footer className={`sticky bottom-0 bg-[#f6f7f8]/95 dark:bg-[#101922]/95 backdrop-blur-md z-20 transition-shadow duration-200 ${scrolled ? '' : 'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'}`}>
                <AuthFooter />
            </footer>

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
