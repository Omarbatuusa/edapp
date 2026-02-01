'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

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

function BrokerLoginContent() {
    const searchParams = useSearchParams();
    const [tenant, setTenant] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for standard auth
    const [email, setEmail] = useState('');

    // State for learner auth
    const [studentNumber, setStudentNumber] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);

    const tenantSlug = searchParams.get('tenant');
    const role = searchParams.get('role');

    useEffect(() => {
        if (!tenantSlug) {
            setError('Missing tenant information');
            setLoading(false);
            return;
        }

        async function fetchTenant() {
            try {
                // Fetch tenant details to display Logo and Branch Name
                const res = await fetch(`/v1/tenants/lookup-by-slug?slug=${tenantSlug}`);
                if (res.ok) {
                    const data = await res.json();
                    setTenant(data);
                } else {
                    setError('Invalid tenant');
                }
            } catch (err) {
                setError('Failed to load tenant details');
            } finally {
                setLoading(false);
            }
        }

        fetchTenant();
    }, [tenantSlug]);

    const completeHandoff = async (sessionToken: string, userId: string) => {
        if (!tenantSlug || !role) return;

        try {
            setLoading(true);
            // 1. Create Handoff Code
            const res = await fetch('/v1/auth/handoff/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken, userId, tenantSlug, role })
            });

            if (!res.ok) throw new Error('Handoff creation failed');

            const { code } = await res.json();

            // 2. Redirect to Tenant callback
            const protocol = window.location.protocol;
            const host = window.location.host;
            let targetDomain = '';

            if (host.includes('localhost')) {
                // Assuming port 3000 for web
                targetDomain = `${tenantSlug}.localhost:3000`;
            } else {
                // Production: auth.edapp.co.za -> {slug}.edapp.co.za
                const baseDomain = host.replace('auth.', '');
                targetDomain = `${tenantSlug}.${baseDomain}`;
            }

            const finishUrl = `${protocol}//${targetDomain}/auth/finish?handoff=${code}`;
            window.location.href = finishUrl;

        } catch (err) {
            setError('Authentication failed. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const mockUserId = `google-user-${Date.now()}`;
        const mockSessionToken = `mock_google_session_${Date.now()}`;
        await completeHandoff(mockSessionToken, mockUserId);
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        const mockUserId = `email-user-${email.replace(/[^a-zA-Z0-9]/g, '')}`;
        const mockSessionToken = `mock_email_session_${Date.now()}`;
        await completeHandoff(mockSessionToken, mockUserId);
    };

    const handleLearnerLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentNumber || pin.length < 4) return;
        const mockUserId = `learner-${studentNumber}`;
        const mockSessionToken = `mock_learner_session_${Date.now()}`;
        await completeHandoff(mockSessionToken, mockUserId);
    };

    if (loading && !tenant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                <p className="text-slate-600 dark:text-slate-400">{error}</p>
                <button onClick={() => window.history.back()} className="mt-4 text-primary font-medium">Go Back</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="flex flex-col items-center text-center">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg mb-4">
                    <Image
                        src={tenant?.logo_url || DEFAULT_LOGO}
                        alt={tenant?.school_name || 'School'}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-white">
                    {tenant?.school_name}
                </h1>

                {tenant?.main_branch && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-sm mr-1.5 text-slate-500">domain</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {tenant.main_branch.branch_name}
                        </span>
                    </div>
                )}

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Sign in to continue as <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{role}</span>
                </p>
            </div>

            <div className="space-y-4 pt-2">
                {role === 'learner' ? (
                    <form onSubmit={handleLearnerLogin} className="space-y-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">badge</span>
                            <input
                                type="text"
                                value={studentNumber}
                                onChange={(e) => setStudentNumber(e.target.value)}
                                placeholder="Student Number"
                                className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                                className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-16 text-base border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all tracking-widest"
                                maxLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-medium text-xs uppercase tracking-wide"
                            >
                                {showPin ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!studentNumber || pin.length < 4}
                            className="w-full h-12 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 ios-shadow"
                        >
                            Continue
                        </button>
                    </form>
                ) : (
                    <>
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors ios-shadow"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} />
                            <span className="font-medium text-slate-700 dark:text-slate-200">Continue with Google</span>
                        </button>

                        <div className="flex gap-3">
                            <button disabled className="flex-1 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center opacity-50 cursor-not-allowed">
                                <span className="material-symbols-outlined text-xl">window</span>
                            </button>
                            <button disabled className="flex-1 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center opacity-50 cursor-not-allowed">
                                <span className="material-symbols-outlined text-xl">apple</span>
                            </button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-xs text-slate-400 uppercase tracking-wide">Or</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 text-base border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!email}
                                className="w-full h-12 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 ios-shadow"
                            >
                                Continue with Email
                            </button>
                            <p className="text-center text-[10px] text-slate-400">
                                We'll send a magic link or code to your email.
                            </p>
                        </form>
                    </>
                )}

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-sm text-slate-500">
                        Not a student yet?{' '}
                        <a href={`//apply-${tenantSlug}.edapp.co.za`} className="text-primary font-medium hover:underline">
                            Apply to {tenant?.school_name}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function BrokerLoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BrokerLoginContent />
        </Suspense>
    )
}
