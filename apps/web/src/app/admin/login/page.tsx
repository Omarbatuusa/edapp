"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { HelpPopup } from "@/components/discovery/help-popup"
import { useAuth } from "@/contexts/AuthContext"

interface RoleInfo {
    role: string;
    tenantSlug: string | null;
    branchId: string | null;
}

interface LoginResult {
    sessionToken: string;
    userId: string;
    role: string;
    tenantSlug: string;
    displayName: string;
    email: string;
    allRoles: RoleInfo[];
}

const ROLE_META: Record<string, { label: string; description: string; icon: string; color: string }> = {
    platform_super_admin: { label: 'Super Admin', description: 'Full platform access — manage all tenants, brands, and settings', icon: 'shield_person', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    app_super_admin: { label: 'Super Admin', description: 'Full platform access — manage all tenants, brands, and settings', icon: 'shield_person', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    brand_admin: { label: 'Brand Admin', description: 'Manage brand groups, governance dashboards, and dictionaries', icon: 'corporate_fare', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    platform_secretary: { label: 'App Secretary', description: 'Inbox, approvals, tenant management, and user support', icon: 'support_agent', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    app_secretary: { label: 'App Secretary', description: 'Inbox, approvals, tenant management, and user support', icon: 'support_agent', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    platform_support: { label: 'App Support', description: 'Helpdesk with tenant lookup and impersonation', icon: 'headset_mic', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
    app_support: { label: 'App Support', description: 'Helpdesk with tenant lookup and impersonation', icon: 'headset_mic', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
    tenant_admin: { label: 'School Admin', description: 'Manage school settings, data, people, and integrations', icon: 'school', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    main_branch_admin: { label: 'Main Branch Admin', description: 'Tenant-wide branch management and school data', icon: 'account_balance', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    branch_admin: { label: 'Branch Admin', description: 'Manage your branch staff and settings', icon: 'location_city', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    admissions_officer: { label: 'Admissions Officer', description: 'Manage applications and admissions process', icon: 'assignment_ind', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
    finance_officer: { label: 'Finance Officer', description: 'Fee management and financial reporting', icon: 'payments', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    hr_admin: { label: 'HR Admin', description: 'Staff management and HR administration', icon: 'badge', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
    it_admin: { label: 'IT Admin', description: 'IT systems and technical administration', icon: 'computer', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
    principal: { label: 'Principal', description: 'School leadership dashboard and oversight', icon: 'supervisor_account', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
    deputy_principal: { label: 'Deputy Principal', description: 'Academic leadership and school management', icon: 'person_check', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
    reception: { label: 'Reception', description: 'Front desk and visitor management', icon: 'desk', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
}

function getRoleMeta(role: string) {
    return ROLE_META[role] || { label: role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), description: 'Administrative access', icon: 'admin_panel_settings', color: 'bg-slate-100 text-slate-600' }
}

type LoginStep = 'login' | 'otp-sent' | 'select-role'

export default function AdminLoginPage() {
    const router = useRouter()
    const { login, logout } = useAuth()

    const [step, setStep] = useState<LoginStep>('login')
    const [authMode, setAuthMode] = useState<'password' | 'otp'>('password')
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showHelp, setShowHelp] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberDevice, setRememberDevice] = useState(false)
    const [rememberDuration, setRememberDuration] = useState('30')

    // OTP state
    const [otpKey, setOtpKey] = useState("")
    const [otpCode, setOtpCode] = useState("")
    const [countdown, setCountdown] = useState(0)

    // After auth
    const [loginResult, setLoginResult] = useState<LoginResult | null>(null)

    // Check for existing session
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const sessionToken = localStorage.getItem('session_token')
            const userRole = localStorage.getItem('user_role')
            if (sessionToken && userRole) {
                const slug = localStorage.getItem('admin_tenant_slug') || 'edapp'
                router.push(`/tenant/${slug}/admin`)
            }
        }
    }, [router])

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            // 1. Firebase auth
            await login(email, password)

            // 2. Get Firebase ID token
            const { auth } = await import('@/lib/firebase')
            const idToken = await auth?.currentUser?.getIdToken()
            if (!idToken) throw new Error('Failed to get authentication token')

            // 3. Call backend to resolve roles + create session JWT
            const res = await fetch('/v1/auth/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: idToken,
                    rememberDevice,
                    rememberDuration: rememberDevice ? parseInt(rememberDuration, 10) : undefined,
                }),
            })

            const text = await res.text()
            let data: any
            try { data = JSON.parse(text) } catch {
                throw new Error('Server error. Please try again later.')
            }
            if (!res.ok) {
                throw new Error(data.message || 'Login failed. Ensure you have an admin role.')
            }

            handleLoginSuccess(data)
        } catch (err: any) {
            setError(err.message || "Invalid credentials")
            try { await logout() } catch {}
        } finally {
            setLoading(false)
        }
    }

    const handleSendOtp = async () => {
        if (!email) { setError('Please enter your email address'); return }
        setLoading(true)
        setError("")

        try {
            const res = await fetch('/v1/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const text = await res.text()
            let data: any
            try { data = JSON.parse(text) } catch { throw new Error('Server error. Please try again later.') }
            if (!res.ok) throw new Error(data.message || 'Failed to send code')

            setOtpKey(data.otpKey)
            setStep('otp-sent')
            setCountdown(30)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otpCode.length < 6) return
        setLoading(true)
        setError("")

        try {
            const res = await fetch('/v1/auth/otp-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otpKey,
                    code: otpCode,
                    rememberDevice,
                    rememberDuration: rememberDevice ? parseInt(rememberDuration, 10) : undefined,
                }),
            })
            const text = await res.text()
            let data: any
            try { data = JSON.parse(text) } catch { throw new Error('Server error. Please try again later.') }
            if (!res.ok) throw new Error(data.message || 'Invalid code')

            handleLoginSuccess(data)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleLoginSuccess = (data: LoginResult) => {
        if (data.allRoles.length <= 1) {
            activateRole(data, data.role, data.tenantSlug)
            return
        }
        setLoginResult(data)
        setStep('select-role')
    }

    const activateRole = (data: LoginResult, selectedRole: string, tenantSlug: string | null) => {
        const slug = tenantSlug || 'edapp'

        localStorage.setItem('session_token', data.sessionToken)
        localStorage.setItem('user_id', data.userId)
        localStorage.setItem('user_role', selectedRole)
        localStorage.setItem('admin_tenant_slug', slug)
        localStorage.setItem(`edapp_role_${slug}`, selectedRole)

        const returnTo = sessionStorage.getItem('edapp_return_to');
        if (returnTo) {
            sessionStorage.removeItem('edapp_return_to');
            router.push(returnTo);
        } else {
            router.push(`/tenant/${slug}/admin`);
        }
    }

    const handleSelectRole = (roleInfo: RoleInfo) => {
        if (!loginResult) return
        activateRole(loginResult, roleInfo.role, roleInfo.tenantSlug)
    }

    const handleBack = () => {
        if (step === 'otp-sent') {
            setStep('login')
            setOtpCode('')
            setError('')
            return
        }
        if (step === 'select-role') {
            setStep('login')
            setLoginResult(null)
            logout().catch(() => {})
            return
        }
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
            <AuthHeader variant="platform-admin" onHelp={() => setShowHelp(true)} />

            <main className="app-content">
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-lg mx-auto w-full">

                    {/* ─── STEP 1: Login Form ─── */}
                    {step === 'login' && (
                        <>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">shield</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-center">
                                Platform Admin
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground text-center">
                                Sign in to manage the EdApp platform.
                            </p>

                            {/* Auth mode tabs */}
                            <div className="w-full max-w-sm mt-6 flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                                <button type="button" onClick={() => { setAuthMode('password'); setError('') }}
                                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${authMode === 'password' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <span className="material-symbols-outlined text-[16px]">lock</span>
                                    Password
                                </button>
                                <button type="button" onClick={() => { setAuthMode('otp'); setError('') }}
                                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${authMode === 'otp' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                    Email OTP
                                </button>
                            </div>

                            {/* Password login */}
                            {authMode === 'password' && (
                                <form onSubmit={handleLogin} className="w-full max-w-sm mt-4 space-y-4">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">mail</span>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email address"
                                            className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                            required />
                                    </div>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">lock</span>
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                            required />
                                        <button type="button" onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                            <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    <div className="text-right -mt-1">
                                        <Link href="/admin/forgot-password" className="text-xs text-indigo-600 hover:underline font-medium">Forgot password?</Link>
                                    </div>

                                    {/* Remember Device */}
                                    <div className="space-y-3 pt-1">
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-indigo-500 transition-colors">devices</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">Remember this device</span>
                                            </div>
                                            <input type="checkbox" className="hidden" checked={rememberDevice} onChange={() => setRememberDevice(!rememberDevice)} />
                                            <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${rememberDevice ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${rememberDevice ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </label>
                                        {rememberDevice && (
                                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                                                {[{ d: '7', label: '1 week' }, { d: '30', label: '1 month' }, { d: '90', label: '3 months' }].map(({ d, label }) => (
                                                    <button key={d} type="button" onClick={() => setRememberDuration(d)}
                                                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${rememberDuration === d ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900/50' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}

                                    <button type="submit" disabled={loading}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span>
                                        ) : (<><span>Continue</span><span className="material-symbols-outlined text-xl">arrow_forward</span></>)}
                                    </button>
                                </form>
                            )}

                            {/* Email OTP login */}
                            {authMode === 'otp' && (
                                <div className="w-full max-w-sm mt-4 space-y-4">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">mail</span>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email address"
                                            className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none" />
                                    </div>

                                    {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}

                                    <button type="button" onClick={handleSendOtp} disabled={loading || !email}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span>
                                        ) : (<><span>Send Login Code</span><span className="material-symbols-outlined text-xl">send</span></>)}
                                    </button>

                                    <p className="text-xs text-slate-400 text-center px-2">
                                        We'll send a 6-digit code to your email. No password needed.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ─── OTP Verification ─── */}
                    {step === 'otp-sent' && (
                        <>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-3xl">verified_user</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-center">Enter Code</h1>
                            <p className="mt-2 text-sm text-muted-foreground text-center">
                                We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
                            </p>

                            <form onSubmit={handleVerifyOtp} className="w-full max-w-sm mt-8 space-y-4">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">pin</span>
                                    <input type="text" inputMode="numeric" value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="6-digit code"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none tracking-[0.3em] font-mono text-center text-lg"
                                        maxLength={6} required />
                                </div>

                                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}

                                <button type="submit" disabled={loading || otpCode.length < 6}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</span>
                                    ) : (<><span>Sign In</span><span className="material-symbols-outlined text-xl">login</span></>)}
                                </button>

                                <div className="text-center pt-2">
                                    {countdown > 0 ? (
                                        <p className="text-xs text-slate-400">Resend code in {countdown}s</p>
                                    ) : (
                                        <button type="button" onClick={handleSendOtp} className="text-sm text-indigo-600 hover:underline font-medium">Resend code</button>
                                    )}
                                </div>

                                <button type="button" onClick={handleBack}
                                    className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 pt-1">
                                    Back to login
                                </button>
                            </form>
                        </>
                    )}

                    {/* ─── STEP: Role Selection ─── */}
                    {step === 'select-role' && loginResult && (
                        <>
                            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">verified</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-center">
                                Select Role
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground text-center">
                                Welcome, <span className="font-semibold text-foreground">{loginResult.displayName || loginResult.email}</span>. Choose how you want to sign in.
                            </p>

                            <div className="w-full mt-8 space-y-3">
                                {loginResult.allRoles.filter((roleInfo, idx, arr) => {
                                    const meta = getRoleMeta(roleInfo.role)
                                    return arr.findIndex(r => getRoleMeta(r.role).label === meta.label) === idx
                                }).map((roleInfo, idx) => {
                                    const meta = getRoleMeta(roleInfo.role)
                                    return (
                                        <button
                                            key={`${roleInfo.role}-${idx}`}
                                            type="button"
                                            onClick={() => handleSelectRole(roleInfo)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md active:scale-[0.98] transition-all text-left group"
                                        >
                                            <div className={`w-12 h-12 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                                <span className="material-symbols-outlined text-2xl">{meta.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-[15px] text-slate-900 dark:text-slate-100 tracking-tight">{meta.label}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{meta.description}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors">arrow_forward_ios</span>
                                        </button>
                                    )
                                })}
                            </div>

                            <button type="button" onClick={handleBack}
                                className="mt-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors">
                                Sign in with a different account
                            </button>
                        </>
                    )}
                </div>
            </main>

            <AuthFooter />
            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
