'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../../../../lib/api-client';

interface Props { params: Promise<{ slug: string }> }

export default function MySubscriptionPage({ params }: Props) {
    const { slug } = use(params);
    const basePath = `/tenant/${slug}/admin`;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tenantId = localStorage.getItem('admin_tenant_id') || localStorage.getItem(`edapp_tenant_id_${slug}`);
        if (!tenantId) { setLoading(false); return; }

        apiClient.get(`/admin/subscriptions/tenant/${tenantId}`)
            .then(res => setData(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const tenant = data?.tenant;
    const sub = data?.subscription;
    const payments = data?.recent_payments || [];

    const status = tenant?.subscription_status || 'none';
    const plan = sub?.plan || tenant?.subscription_plan;
    const endsAt = sub?.ends_at || tenant?.subscription_ends_at;
    const isSuspended = tenant?.status === 'suspended';
    const isActive = status === 'active' || status === 'trial';
    const daysLeft = endsAt ? Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)) : null;

    const planLabel = plan === 'monthly' ? 'Monthly' : plan === 'quarterly' ? 'Quarterly' : plan === 'annual' ? 'Annual' : '—';
    const amountLabel = sub?.amount_cents ? `R ${(sub.amount_cents / 100).toFixed(2)}` : '—';

    return (
        <div className="space-y-4">
            <div>
                <h1 className="type-page-title text-[hsl(var(--admin-text-main))]">Subscription</h1>
                <p className="type-body-medium text-[hsl(var(--admin-text-sub))] mt-0.5">
                    View your subscription status and billing details.
                </p>
            </div>

            {/* Status Card */}
            <div className={`ios-card border ${isSuspended
                ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                : isActive
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                    : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
                }`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSuspended
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : isActive
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-amber-100 dark:bg-amber-900/30'
                        }`}>
                        <span className={`material-symbols-outlined text-3xl ${isSuspended
                            ? 'text-red-600'
                            : isActive
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`}>
                            {isSuspended ? 'block' : isActive ? 'verified' : 'timer_off'}
                        </span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-[hsl(var(--admin-text-main))]">
                            {isSuspended ? 'Account Suspended' : isActive ? 'Active Subscription' : status === 'none' ? 'No Subscription' : 'Subscription Expired'}
                        </p>
                        <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                            {isSuspended
                                ? tenant?.suspension_reason || 'Your account has been suspended.'
                                : isActive && daysLeft !== null
                                    ? `${daysLeft} days remaining`
                                    : status === 'none'
                                        ? 'Contact your administrator to set up a subscription.'
                                        : 'Please renew to continue using EdApp.'
                            }
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <InfoItem label="Plan" value={planLabel} />
                    <InfoItem label="Amount" value={amountLabel} />
                    <InfoItem label="Start" value={sub?.starts_at ? new Date(sub.starts_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
                    <InfoItem label={isActive ? 'Renewal' : 'Ended'} value={endsAt ? new Date(endsAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
                </div>
            </div>

            {/* Payment Gateway Info */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">credit_card</span>
                    Payment Method
                </h3>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                    {sub?.payment_gateway
                        ? `Connected via ${sub.payment_gateway === 'stitch' ? 'Stitch' : sub.payment_gateway === 'peach' ? 'Peach Payments' : 'Manual'}`
                        : 'No payment method configured. Contact support to set up card payments via Stitch or Peach Payments.'
                    }
                </p>
                {(!isActive && !isSuspended) && (
                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
                            onClick={() => alert('Payment gateway integration coming soon. Please contact support@edapp.co.za')}
                        >
                            <span className="material-symbols-outlined text-lg">payments</span>
                            Pay with Card
                        </button>
                        <a
                            href="mailto:support@edapp.co.za?subject=Subscription%20Renewal"
                            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">mail</span>
                            Contact Support
                        </a>
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">receipt_long</span>
                    Payment History
                </h3>
                {payments.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--admin-text-muted))] py-4 text-center">No payments recorded yet.</p>
                ) : (
                    <div className="divide-y divide-[hsl(var(--admin-border))]">
                        {payments.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-medium text-[hsl(var(--admin-text-main))]">
                                        R {(p.amount_cents / 100).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                                        {p.description || p.payment_method || 'Payment'} &middot; {new Date(p.paid_at || p.created_at).toLocaleDateString('en-ZA')}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.status === 'succeeded' ? 'bg-green-100 text-green-700'
                                    : p.status === 'failed' ? 'bg-red-100 text-red-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {p.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(var(--admin-text-muted))]">{label}</p>
            <p className="text-sm font-bold text-[hsl(var(--admin-text-main))] mt-0.5">{value}</p>
        </div>
    );
}
