'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../../../../lib/api-client';

interface Props { params: Promise<{ slug: string }> }

const PLATFORM_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin'];

export default function SubscriptionsPage({ params }: Props) {
    const { slug } = use(params);
    const basePath = `/tenant/${slug}/admin`;
    const role = typeof window !== 'undefined' ? localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role') || '' : '';
    const isPlatform = PLATFORM_ROLES.includes(role);

    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showSetSubscription, setShowSetSubscription] = useState<string | null>(null);
    const [subForm, setSubForm] = useState({ plan: 'monthly', amount: '', starts_at: '', ends_at: '' });

    useEffect(() => {
        loadTenants();
    }, []);

    async function loadTenants() {
        try {
            const res = await apiClient.get('/admin/tenants');
            const list = res.data?.tenants || res.data || [];
            setTenants(Array.isArray(list) ? list : []);
        } catch { }
        setLoading(false);
    }

    async function handleSuspend(tenantId: string) {
        const reason = prompt('Suspension reason (e.g., "Non-payment of subscription"):');
        if (!reason) return;
        setActionLoading(tenantId);
        try {
            await apiClient.post(`/admin/subscriptions/suspend/${tenantId}`, { reason });
            await loadTenants();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to suspend');
        }
        setActionLoading(null);
    }

    async function handleUnsuspend(tenantId: string) {
        setActionLoading(tenantId);
        try {
            await apiClient.post(`/admin/subscriptions/unsuspend/${tenantId}`);
            await loadTenants();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to unsuspend');
        }
        setActionLoading(null);
    }

    async function handleSetSubscription(tenantId: string) {
        if (!subForm.starts_at || !subForm.ends_at) {
            alert('Start and end dates are required');
            return;
        }
        setActionLoading(tenantId);
        try {
            await apiClient.post('/admin/subscriptions', {
                tenant_id: tenantId,
                plan: subForm.plan,
                amount_cents: Math.round(parseFloat(subForm.amount || '0') * 100),
                starts_at: subForm.starts_at,
                ends_at: subForm.ends_at,
            });
            setShowSetSubscription(null);
            setSubForm({ plan: 'monthly', amount: '', starts_at: '', ends_at: '' });
            await loadTenants();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to set subscription');
        }
        setActionLoading(null);
    }

    if (!isPlatform) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Platform admin access required.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="type-page-title text-[hsl(var(--admin-text-main))]">Tenant Subscriptions</h1>
                    <p className="type-body-medium text-[hsl(var(--admin-text-sub))] mt-0.5">
                        Manage subscriptions, suspend and unsuspend tenants.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="ios-card flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-3">
                    {tenants.map((t) => {
                        const isSuspended = t.status === 'suspended';
                        const subStatus = t.subscription_status || '—';
                        const subEnds = t.subscription_ends_at
                            ? new Date(t.subscription_ends_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—';
                        const planLabel = t.subscription_plan === 'monthly' ? 'Monthly'
                            : t.subscription_plan === 'quarterly' ? 'Quarterly'
                                : t.subscription_plan === 'annual' ? 'Annual'
                                    : t.subscription_plan || '—';

                        return (
                            <div key={t.id} className={`ios-card ${isSuspended ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSuspended
                                            ? 'bg-red-100 dark:bg-red-900/30'
                                            : 'bg-indigo-100 dark:bg-indigo-900/30'
                                            }`}>
                                            <span className={`material-symbols-outlined text-xl ${isSuspended ? 'text-red-600' : 'text-indigo-600'}`}>
                                                {isSuspended ? 'block' : 'domain'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-[hsl(var(--admin-text-main))]">{t.school_name}</p>
                                            <p className="text-xs text-[hsl(var(--admin-text-muted))]">{t.tenant_slug} &middot; {t.school_code}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Status badges */}
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isSuspended ? 'bg-red-100 text-red-700'
                                            : subStatus === 'active' ? 'bg-green-100 text-green-700'
                                                : subStatus === 'trial' ? 'bg-blue-100 text-blue-700'
                                                    : subStatus === 'expired' ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {isSuspended ? 'Suspended' : subStatus}
                                        </span>
                                        <span className="text-[10px] font-medium text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface-alt))] px-2 py-0.5 rounded-full">
                                            {planLabel}
                                        </span>
                                        <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                                            {subStatus !== '—' ? `Ends: ${subEnds}` : 'No subscription'}
                                        </span>
                                    </div>
                                </div>

                                {/* Suspension reason */}
                                {isSuspended && t.suspension_reason && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 ml-13 pl-0.5">
                                        Reason: {t.suspension_reason}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[hsl(var(--admin-border))]">
                                    {isSuspended ? (
                                        <button
                                            type="button"
                                            onClick={() => handleUnsuspend(t.id)}
                                            disabled={actionLoading === t.id}
                                            className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === t.id ? 'Processing...' : 'Unsuspend'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleSuspend(t.id)}
                                            disabled={actionLoading === t.id}
                                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === t.id ? 'Processing...' : 'Suspend'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowSetSubscription(showSetSubscription === t.id ? null : t.id)}
                                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                                    >
                                        Set Subscription
                                    </button>
                                </div>

                                {/* Set Subscription Form */}
                                {showSetSubscription === t.id && (
                                    <div className="mt-3 p-4 bg-[hsl(var(--admin-surface-alt))] rounded-xl space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] block mb-1">Plan</label>
                                                <select
                                                    value={subForm.plan}
                                                    onChange={(e) => setSubForm({ ...subForm, plan: e.target.value })}
                                                    className="w-full h-10 rounded-lg bg-white dark:bg-slate-800 px-3 text-sm border border-slate-200 dark:border-slate-700"
                                                    aria-label="Subscription plan"
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="annual">Annual</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] block mb-1">Amount (ZAR)</label>
                                                <input
                                                    type="number"
                                                    value={subForm.amount}
                                                    onChange={(e) => setSubForm({ ...subForm, amount: e.target.value })}
                                                    placeholder="999.00"
                                                    className="w-full h-10 rounded-lg bg-white dark:bg-slate-800 px-3 text-sm border border-slate-200 dark:border-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] block mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={subForm.starts_at}
                                                    onChange={(e) => setSubForm({ ...subForm, starts_at: e.target.value })}
                                                    className="w-full h-10 rounded-lg bg-white dark:bg-slate-800 px-3 text-sm border border-slate-200 dark:border-slate-700"
                                                    aria-label="Subscription start date"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] block mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    value={subForm.ends_at}
                                                    onChange={(e) => setSubForm({ ...subForm, ends_at: e.target.value })}
                                                    className="w-full h-10 rounded-lg bg-white dark:bg-slate-800 px-3 text-sm border border-slate-200 dark:border-slate-700"
                                                    aria-label="Subscription end date"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSetSubscription(t.id)}
                                                disabled={actionLoading === t.id}
                                                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === t.id ? 'Saving...' : 'Save Subscription'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowSetSubscription(null)}
                                                className="px-4 py-2 text-xs font-semibold text-[hsl(var(--admin-text-muted))] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {tenants.length === 0 && (
                        <div className="ios-card text-center py-8">
                            <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] mb-2">domain_disabled</span>
                            <p className="text-sm text-[hsl(var(--admin-text-muted))]">No tenants found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
