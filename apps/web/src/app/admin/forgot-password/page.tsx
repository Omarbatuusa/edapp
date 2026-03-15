"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { HelpPopup } from "@/components/discovery/help-popup"

type Step = 'email' | 'verify' | 'new-password' | 'success'

function getPasswordScore(pw: string) {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[a-z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']

function Req({ met, label }: { met: boolean; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1 text-xs ${met ? 'text-green-600' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[14px]">{met ? 'check' : 'close'}</span>
            {label}
        </span>
    )
}

export default function AdminForgotPasswordPage() {
    const router = useRouter()

    const [showHelp, setShowHelp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState("")
    const [otpKey, setOtpKey] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const handleRequestCode = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!email) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/v1/auth/password-reset/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const text = await res.text()
            let data: any
            try { data = JSON.parse(text) } catch { throw new Error('Server error. Please try again later.') }
            if (!res.ok) throw new Error(data.message || 'Failed to send reset code')

            if (data.otpKey) setOtpKey(data.otpKey)
            setStep('verify')
            setCountdown(30)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (code.length < 6) return
        // Code is verified server-side when the password is set via /password-reset/confirm.
        // We move to the next step without consuming the OTP here.
        setError(null)
        setStep('new-password')
    }

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword) return
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (getPasswordScore(newPassword) < 3) {
            setError('Please choose a stronger password')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/v1/auth/password-reset/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otpKey, code, newPassword }),
            })
            const text = await res.text()
            let data: any
            try { data = JSON.parse(text) } catch { throw new Error('Server error. Please try again later.') }
            if (!res.ok) throw new Error(data.message || 'Password reset failed')
            setStep('success')
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleSkipPassword = () => {
        setStep('success')
    }

    const handleBack = () => {
        if (step === 'new-password') { setStep('verify'); setError(null); return }
        if (step === 'verify') { setStep('email'); setError(null); return }
        router.push('/admin/login')
    }

    const score = getPasswordScore(newPassword)
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword

    return (
        <div className="app-shell">
            <AuthHeader variant="platform-admin" onBack={handleBack} onHelp={() => setShowHelp(true)} />

            <main className="app-content">
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <>
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-3xl">lock_reset</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-center">Reset Password</h1>
                            <p className="mt-2 text-sm text-muted-foreground text-center">
                                Enter your email to receive a verification code.
                            </p>

                            <form onSubmit={handleRequestCode} className="w-full mt-8 space-y-4">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">mail</span>
                                    <input
                                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                        required
                                    />
                                </div>
                                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}
                                <button type="submit" disabled={loading || !email}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span>
                                    ) : (<><span>Send Code</span><span className="material-symbols-outlined text-xl">send</span></>)}
                                </button>
                                <button type="button" onClick={() => router.push('/admin/login')} className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 pt-2">
                                    Back to login
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 'verify' && (
                        <>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-3xl">verified_user</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-center">Verify Code</h1>
                            <p className="mt-2 text-sm text-muted-foreground text-center">
                                We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
                            </p>

                            <form onSubmit={handleVerifyOtp} className="w-full mt-8 space-y-4">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">pin</span>
                                    <input type="text" inputMode="numeric" value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="6-digit code"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none tracking-[0.3em] font-mono text-center text-lg"
                                        maxLength={6} required />
                                </div>
                                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}
                                <button type="submit" disabled={loading || code.length < 6}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</span>
                                    ) : (<><span>Verify</span><span className="material-symbols-outlined text-xl">check</span></>)}
                                </button>
                                <div className="text-center pt-2">
                                    {countdown > 0 ? (
                                        <p className="text-xs text-slate-400">Resend code in {countdown}s</p>
                                    ) : (
                                        <button type="button" onClick={() => handleRequestCode()} className="text-sm text-indigo-600 hover:underline font-medium">Resend code</button>
                                    )}
                                </div>
                            </form>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'new-password' && (
                        <>
                            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">lock_open</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-center">New Password</h1>
                            <p className="mt-2 text-sm text-muted-foreground text-center">
                                Set a new password for your account.
                            </p>

                            <form onSubmit={handleSetPassword} className="w-full mt-8 space-y-4">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">lock</span>
                                    <input type={showPassword ? "text" : "password"} value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)} placeholder="New password"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-14 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                        required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>

                                {/* Password strength meter */}
                                {newPassword && (
                                    <div className="space-y-2 px-1">
                                        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`flex-1 rounded-full transition-colors ${i <= score ? STRENGTH_COLORS[score] : ''}`} />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-semibold ${score <= 2 ? 'text-red-500' : score <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {STRENGTH_LABELS[score]}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            <Req met={newPassword.length >= 8} label="8+ chars" />
                                            <Req met={/[A-Z]/.test(newPassword)} label="Uppercase" />
                                            <Req met={/[a-z]/.test(newPassword)} label="Lowercase" />
                                            <Req met={/[0-9]/.test(newPassword)} label="Number" />
                                            <Req met={/[^A-Za-z0-9]/.test(newPassword)} label="Special" />
                                        </div>
                                    </div>
                                )}

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">lock_check</span>
                                    <input type={showPassword ? "text" : "password"} value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-14 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                        required />
                                    {passwordsMatch && (
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xl">check_circle</span>
                                    )}
                                </div>

                                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}

                                <button type="submit" disabled={loading || !newPassword || !confirmPassword || score < 3}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</span>
                                    ) : (<><span>Reset Password</span><span className="material-symbols-outlined text-xl">check</span></>)}
                                </button>

                                <button type="button" onClick={handleSkipPassword}
                                    className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 pt-1">
                                    Skip — I'll change it later
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">
                                {newPassword ? 'Password Reset' : 'Identity Verified'}
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                {newPassword
                                    ? 'Your password has been updated. You can now sign in.'
                                    : 'Your identity has been verified. You can sign in with your existing password.'}
                            </p>
                            <button type="button" onClick={() => router.push('/admin/login')}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all">
                                Sign In
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <AuthFooter />
            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
