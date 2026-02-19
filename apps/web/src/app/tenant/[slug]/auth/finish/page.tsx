'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';

function AuthFinishContent() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Finalizing secure session...');

    useEffect(() => {
        const handoffCode = searchParams.get('handoff');
        const tenantSlug = params.slug as string;

        if (!handoffCode || !tenantSlug) {
            setError('Missing handoff code or tenant context');
            return;
        }

        async function finalizeAuth() {
            try {
                // 1. Exchange code for session token & user info
                setStatus('Verifying session...');
                const exchangeRes = await fetch('/v1/auth/handoff/exchange', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-tenant-slug': tenantSlug
                    },
                    body: JSON.stringify({ code: handoffCode, tenantSlug })
                });

                if (!exchangeRes.ok) {
                    throw new Error('Invalid or expired login session');
                }

                const { sessionToken, userId, role } = await exchangeRes.json();

                // 2. Save session
                localStorage.setItem('session_token', sessionToken);
                localStorage.setItem('user_id', userId);
                localStorage.setItem('user_role', role);

                // 3. Get Tenant UUID for policy check
                setStatus('Checking policy requirements...');
                const tenantRes = await fetch(`/v1/tenants/lookup-by-slug?slug=${tenantSlug}`);
                if (!tenantRes.ok) throw new Error('Tenant lookup failed');
                const tenantData = await tenantRes.json();
                const tenantId = tenantData.id;

                // 4. Check Policy Status
                const policyRes = await fetch(`/v1/policies/check-status?userId=${userId}&tenantId=${tenantId}&intent=app`);
                const policyData = await policyRes.json();

                if (!policyData.accepted) {
                    // Redirect to Consent Gate
                    setStatus('Redirecting to consent...');
                    // Add delay for UX
                    setTimeout(() => {
                        const consentUrl = `/tenant/${tenantSlug}/auth/consent?userId=${userId}&tenantId=${tenantId}&role=${role}`;
                        router.replace(consentUrl);
                    }, 500);
                    return;
                }

                // 5. Redirect to Role-Specific Dashboard
                setStatus('Redirecting to dashboard...');
                setTimeout(() => {
                    let dashboardUrl = `/tenant/${tenantSlug}`;

                    switch (role) {
                        case 'learner':
                        case 'student':
                            dashboardUrl = `/tenant/${tenantSlug}/learner`;
                            break;
                        case 'parent':
                        case 'guardian':
                            dashboardUrl = `/tenant/${tenantSlug}/parent`;
                            break;
                        case 'staff':
                        case 'teacher':
                            dashboardUrl = `/tenant/${tenantSlug}/staff`;
                            break;
                        case 'admin':
                        case 'principal':
                        case 'deputy_principal':
                            dashboardUrl = `/tenant/${tenantSlug}/admin`;
                            break;
                        default:
                            dashboardUrl = `/tenant/${tenantSlug}`;
                    }

                    router.replace(dashboardUrl);
                }, 500);

            } catch (err) {
                console.error(err);
                setError('Login failed. Please try again.');
            }
        }

        finalizeAuth();
    }, [searchParams, params, router]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error_outline</span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Failed</h1>
                <p className="mt-2 text-slate-500">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-medium"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8] dark:bg-[#101922]">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">{status}</p>
        </div>
    );
}

export default function AuthFinishPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthFinishContent />
        </Suspense>
    );
}
