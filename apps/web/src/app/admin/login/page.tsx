"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { HelpPopup } from "@/components/discovery/help-popup"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLoginPage() {
    const router = useRouter()
    const { user, login } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showHelp, setShowHelp] = useState(false)
    const [rememberDevice, setRememberDevice] = useState(true)
    const [rememberDuration, setRememberDuration] = useState('30')

    useEffect(() => {
        if (user) {
            router.push('/admin/dashboard')
        }
    }, [user, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await login(email, password)
        } catch (err: any) {
            setError(err.message || "Invalid credentials")
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol
            const isLocalhost = window.location.hostname.includes('localhost')
            window.location.href = isLocalhost
                ? `${protocol}//localhost:3000`
                : `${protocol}//app.edapp.co.za`
        }
    }

    return (
        <div className="app-shell">
            {/* Header - platform-admin variant with edAPP logo */}
            <AuthHeader variant="platform-admin" onHelp={() => setShowHelp(true)} />

            {/* Main Content */}
            <main className="app-content">
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">
                    {/* Headline - no icon above */}
                    <h1 className="text-2xl font-bold tracking-tight text-center">
                        Platform Admin
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                        Sign in to manage the EdApp platform.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="w-full max-w-sm mt-8 space-y-4">
                        {/* Email with icon */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                                mail
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                required
                            />
                        </div>

                        {/* Password with icon */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                                lock
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                required
                            />
                        </div>

                        {/* Remember Device */}
                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${rememberDevice ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'
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
                                                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {d} days
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Signing in..." : (
                                <>
                                    <span>Continue</span>
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            {/* Footer outside main for sticky positioning */}
            <AuthFooter />

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
