'use client';

import { useState, useEffect } from 'react';

interface SubscriptionStatus {
    subscription_status: string | null;
    subscription_plan: string | null;
    subscription_ends_at: string | null;
    is_suspended: boolean;
    is_expired: boolean;
    is_active: boolean;
    suspension_reason: string | null;
    school_name: string;
}

const PLATFORM_ROLES = [
    'platform_super_admin', 'app_super_admin', 'brand_admin',
    'platform_secretary', 'app_secretary', 'platform_support', 'app_support',
];

/**
 * Wraps tenant dashboard content.
 * If the tenant has no active subscription or is suspended,
 * shows a blocking overlay instead of the dashboard.
 * Platform admins always bypass this gate.
 */
export function SubscriptionGate({
    slug,
    children,
}: {
    slug: string;
    children: React.ReactNode;
}) {
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if current user is a platform admin (bypass gate)
    const userRole = typeof window !== 'undefined'
        ? localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role') || ''
        : '';
    const isPlatformAdmin = PLATFORM_ROLES.includes(userRole);

    useEffect(() => {
        if (isPlatformAdmin) {
            setLoading(false);
            return;
        }
        async function check() {
            try {
                const res = await fetch(`/v1/admin/subscriptions/check/${slug}`);
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    setStatus(data);
                } catch {
                    // If backend doesn't have subscription endpoint yet, allow access
                    setStatus(null);
                }
            } catch {
                // Network error — allow access (don't block on failure)
                setStatus(null);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, [slug, isPlatformAdmin]);

    // Still loading
    if (loading) return <>{children}</>;

    // Platform admins always get through
    if (isPlatformAdmin) return <>{children}</>;

    // No subscription data from backend = no subscription system configured yet → allow
    if (!status) return <>{children}</>;

    // Tenant has no subscription set at all → allow (new tenants in setup)
    if (!status.subscription_status) return <>{children}</>;

    // Active or trial → allow
    if (status.is_active || status.subscription_status === 'trial') return <>{children}</>;

    // Suspended
    if (status.is_suspended) {
        return <SubscriptionBlockedScreen type="suspended" status={status} slug={slug} />;
    }

    // Expired
    if (status.is_expired || status.subscription_status === 'expired') {
        return <SubscriptionBlockedScreen type="expired" status={status} slug={slug} />;
    }

    // Past due — show warning but allow access
    if (status.subscription_status === 'past_due') {
        return (
            <>
                <PastDueBanner status={status} />
                {children}
            </>
        );
    }

    // Default: allow
    return <>{children}</>;
}

function SubscriptionBlockedScreen({
    type,
    status,
    slug,
}: {
    type: 'suspended' | 'expired';
    status: SubscriptionStatus;
    slug: string;
}) {
    const isSuspended = type === 'suspended';

    return (
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
            <div className="max-w-md w-full text-center">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${isSuspended
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                    <span className={`material-symbols-outlined text-4xl ${isSuspended
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                        }`}>
                        {isSuspended ? 'block' : 'timer_off'}
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {isSuspended ? 'Account Suspended' : 'Subscription Expired'}
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {status.school_name}
                </p>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mt-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    {isSuspended ? (
                        <>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                This school&apos;s account has been suspended.
                                {status.suspension_reason && (
                                    <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                                        Reason: {status.suspension_reason}
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-slate-400">
                                Please contact EdApp support or your platform administrator to resolve this issue.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                Your subscription has expired. Please renew to continue accessing EdApp modules and features.
                            </p>
                            {status.subscription_ends_at && (
                                <p className="text-xs text-slate-400 mb-4">
                                    Expired on: {new Date(status.subscription_ends_at).toLocaleDateString('en-ZA', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            )}
                            <a
                                href={`/tenant/${slug}/admin/subscription`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-xl">credit_card</span>
                                Renew Subscription
                            </a>
                        </>
                    )}
                </div>

                <div className="mt-6 space-y-2">
                    <a
                        href="mailto:support@edapp.co.za"
                        className="block text-sm text-indigo-600 hover:underline font-medium"
                    >
                        Contact Support
                    </a>
                    <a
                        href={`/tenant/${slug}/login`}
                        className="block text-sm text-slate-400 hover:text-slate-600"
                    >
                        Sign out
                    </a>
                </div>
            </div>
        </div>
    );
}

function PastDueBanner({ status }: { status: SubscriptionStatus }) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;

    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">warning</span>
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Payment Overdue</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            Your subscription payment is past due.
                            {status.subscription_ends_at && (
                                <> Due: {new Date(status.subscription_ends_at).toLocaleDateString('en-ZA')}</>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="text-amber-500 hover:text-amber-700"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
        </div>
    );
}
