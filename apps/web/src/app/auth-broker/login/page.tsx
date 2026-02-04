'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { HelpPopup } from '@/components/discovery/help-popup';

const DEFAULT_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuC96FXTYpIW1fqA_8czdGZvU6P_lFoVuIZZ1lhBzMSykuIEyQEElOa0-AB8eFKKQhEUUcNKGDznJwQTXAVT5Q6tSK6xbDteUL38WpifPHGqw5jvjvBAxtZr8tnMiFQ1Iazh_k1yw89QLWwMV4gDr5e0nBFuStsd9n1pq7B9u8kideTnBdlz3T3EuCJ9JcF7qnH9S-Xca5wX-eyf59mdPPU-dTyFFV0Hjr1Dh710MQq_kKGssRnXVxovzURFa0Z67wQZZcrGd7RAU1w";

interface TenantData {
    school_name: string;
    school_code: string;
    tenant_slug: string;
    logo_url?: string;
    main_branch?: {
        branch_name: string;
        is_main_branch: boolean;
    };
}

interface AuthMethods {
    google_enabled: boolean;
    email_password_enabled: boolean;
    email_magic_link_enabled: boolean;
    email_otp_enabled: boolean;
}

type AuthStep = 'choose' | 'email-password' | 'magic-link-sent' | 'otp-verify' | 'learner';

function BrokerLoginContent() {
    const searchParams = useSearchParams();
    const [tenant, setTenant] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    // Auth methods from tenant config
    const [authMethods, setAuthMethods] = useState<AuthMethods>({
        google_enabled: true,
        email_password_enabled: true,
        email_magic_link_enabled: true,
        email_otp_enabled: false
    });
    const [authMethodsLoaded, setAuthMethodsLoaded] = useState(false);

    // Auth state
    const [authStep, setAuthStep] = useState<AuthStep>('choose');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Learner auth state
    const [studentNumber, setStudentNumber] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);

    // Remember device
    const [rememberDevice, setRememberDevice] = useState(true);
    const [rememberDuration, setRememberDuration] = useState('30');

    const tenantSlug = searchParams.get('tenant');
    const role = searchParams.get('role');
    const returnUrl = searchParams.get('return');

    useEffect(() => {
        if (!tenantSlug) {
            setError('Missing tenant information');
            setLoading(false);
            return;
        }

        // Set learner step immediately if role is learner
        if (role === 'learner') {
            setAuthStep('learner');
        }

        async function fetchTenantAndAuthMethods() {
            try {
                // Fetch tenant details
                const tenantRes = await fetch(`/v1/tenants/lookup-by-slug?slug=${tenantSlug}`);
                if (tenantRes.ok) {
                    const data = await tenantRes.json();
                    setTenant(data);
                } else {
                    setError('Invalid tenant');
                    setLoading(false);
                    return;
                }

                // Fetch auth methods
                try {
                    const authRes = await fetch(`/v1/auth/methods/${tenantSlug}`);
                    if (authRes.ok) {
                        const authData = await authRes.json();
                        setAuthMethods(authData.auth_methods);
                    }
                } catch (authErr) {
                    // Use defaults if auth methods endpoint fails
                    console.warn('Failed to fetch auth methods, using defaults');
                }
                setAuthMethodsLoaded(true);
            } catch (err) {
                setError('Failed to load tenant details');
            } finally {
                setLoading(false);
            }
        }

        fetchTenantAndAuthMethods();
    }, [tenantSlug, role]);

    const completeHandoff = async (sessionToken: string, userId: string) => {
        if (!tenantSlug || !role) return;

        try {
            setLoading(true);
            const res = await fetch('/v1/auth/handoff/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, userId, tenantSlug, role })
            });

            if (!res.ok) throw new Error('Handoff creation failed');

            const { code } = await res.json();

            // Build finish URL
            const protocol = window.location.protocol;
            const host = window.location.host;
            let targetDomain = '';

            if (host.includes('localhost')) {
                targetDomain = `${tenantSlug}.localhost:3000`;
            } else {
                const baseDomain = host.replace('auth.', '');
                targetDomain = `${tenantSlug}.${baseDomain}`;
            }

            const finishUrl = `${protocol}//${targetDomain}/auth/finish?handoff=${code}`;
            window.location.href = finishUrl;

        } catch (err: any) {
            console.error('Handoff error:', err);
            setError(`Authentication failed: ${err?.message || 'Unknown error'}. Please try again.`);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!auth) {
            setError('Firebase authentication is not configured');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();
            await completeHandoff(token, user.uid);
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailPasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        if (!auth) {
            setError('Firebase authentication is not configured');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();
            await completeHandoff(token, user.uid);
        } catch (err: any) {
            console.error('Email Auth Error:', err);
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else {
                setError(err.message);
            }
            setLoading(false);
        }
    };

    const handleMagicLinkRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !auth) return;

        try {
            setLoading(true);
            setError(null);

            const actionCodeSettings = {
                url: `${window.location.origin}/auth-broker/magic-link-finish?tenant=${tenantSlug}&role=${role}`,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setAuthStep('magic-link-sent');
        } catch (err: any) {
            console.error('Magic link error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLearnerLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentNumber || pin.length < 4) return;

        // TODO: Replace with actual learner auth API call
        const mockUserId = `learner-${studentNumber}`;
        const mockSessionToken = `mock_learner_session_${Date.now()}`;
        await completeHandoff(mockSessionToken, mockUserId);
    };

    const handleBack = () => {
        if (authStep !== 'choose' && authStep !== 'learner') {
            setAuthStep('choose');
            setError(null);
        } else {
            // Navigate back to tenant role selection page
            const protocol = window.location.protocol;
            const host = window.location.host;
            const correctSlug = tenant?.tenant_slug || tenantSlug;

            if (host.includes('localhost')) {
                window.location.href = `${protocol}//localhost:3000/tenant/${correctSlug}/login`;
            } else {
                window.location.href = `${protocol}//app.edapp.co.za/tenant/${correctSlug}/login`;
            }
        }
    };

    // Loading state
    if (loading && !tenant) {
        return (
            <div className="app-shell">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !tenant) {
        return (
            <div className="app-shell">
                <AuthHeader onBack={handleBack} onHelp={() => setShowHelp(true)} />
                <main className="app-content">
                    <div className="flex-1 flex flex-col items-center justify-center px-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">error</span>
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground text-center mb-6">{error}</p>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </main>
                <AuthFooter />
                <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
            </div>
        );
    }

    return (
        <div className="app-shell">
            <AuthHeader
                onBack={handleBack}
                onHelp={() => setShowHelp(true)}
                variant="tenant"
                tenantName={tenant?.school_name}
                tenantLogo={tenant?.logo_url || DEFAULT_LOGO}
                tenantSlug={tenant?.tenant_slug || tenantSlug || ''}
            />

            <main className="app-content">
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Sign in as Role */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Sign in
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Continue as <span className="font-semibold text-foreground capitalize">{role}</span>
                        </p>
                    </div>

                    {/* Auth Forms */}
                    <div className="w-full space-y-4">

                        {/* === LEARNER AUTH === */}
                        {authStep === 'learner' && (
                            <form onSubmit={handleLearnerLogin} className="space-y-4">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">badge</span>
                                    <input
                                        type="text"
                                        value={studentNumber}
                                        onChange={(e) => setStudentNumber(e.target.value)}
                                        placeholder="Student Number"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">pin</span>
                                    <input
                                        type={showPin ? "text" : "password"}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        placeholder="PIN"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-16 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none tracking-widest font-mono"
                                        maxLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 font-bold text-xs uppercase tracking-wider hover:opacity-80"
                                    >
                                        {showPin ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={!studentNumber || pin.length < 4 || loading}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Signing in...' : (
                                        <>
                                            <span>Continue</span>
                                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* === MAIN AUTH OPTIONS === */}
                        {authStep === 'choose' && (
                            <>
                                {/* Google Sign In */}
                                {authMethods.google_enabled && (
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <svg viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">Continue with Google</span>
                                    </button>
                                )}

                                {/* Divider */}
                                {(authMethods.email_password_enabled || authMethods.email_magic_link_enabled) && (
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                        <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-medium">or</span>
                                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                    </div>
                                )}

                                {/* Email Input */}
                                {(authMethods.email_password_enabled || authMethods.email_magic_link_enabled) && (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">mail</span>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email address"
                                                className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                            />
                                        </div>

                                        {/* Magic Link Option */}
                                        {authMethods.email_magic_link_enabled && email && (
                                            <button
                                                type="button"
                                                onClick={handleMagicLinkRequest}
                                                disabled={loading || !email}
                                                className="w-full h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-lg">link</span>
                                                <span>Send magic link</span>
                                            </button>
                                        )}

                                        {/* Password Login Option */}
                                        {authMethods.email_password_enabled && email && (
                                            <button
                                                type="button"
                                                onClick={() => setAuthStep('email-password')}
                                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <span>Continue with password</span>
                                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                            </button>
                                        )}

                                        {/* Show continue button if email not entered */}
                                        {!email && (
                                            <p className="text-center text-xs text-slate-400">
                                                Enter your email to see sign-in options
                                            </p>
                                        )}
                                    </div>
                                )}

                                {error && (
                                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                                        {error}
                                    </p>
                                )}
                            </>
                        )}

                        {/* === EMAIL + PASSWORD FORM === */}
                        {authStep === 'email-password' && (
                            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">mail</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">lock</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-16 text-base border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 font-bold text-xs uppercase tracking-wider hover:opacity-80"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="text-right">
                                    <Link
                                        href={`/tenant/${tenantSlug}/forgot-password`}
                                        className="text-xs text-indigo-600 hover:underline font-medium"
                                    >
                                        Forgot password?
                                    </Link>
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

                                {error && (
                                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={!email || !password || loading}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Signing in...' : (
                                        <>
                                            <span>Continue</span>
                                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* === MAGIC LINK SENT === */}
                        {authStep === 'magic-link-sent' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">mark_email_read</span>
                                </div>
                                <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    We sent a magic link to <strong>{email}</strong>
                                </p>
                                <button
                                    onClick={() => setAuthStep('choose')}
                                    className="text-indigo-600 font-medium text-sm hover:underline"
                                >
                                    Use a different method
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer outside main for sticky positioning */}
            <AuthFooter />

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}

export default function BrokerLoginPage() {
    return (
        <Suspense fallback={
            <div className="app-shell">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </div>
        }>
            <BrokerLoginContent />
        </Suspense>
    );
}
