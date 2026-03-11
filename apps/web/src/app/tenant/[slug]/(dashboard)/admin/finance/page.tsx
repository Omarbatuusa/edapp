'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function FinanceDashboardPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/settings`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setSettings(d.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const handleInitialize = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/finance/settings/initialize`, { method: 'POST', headers: getAuthHeaders() });
            const data = await res.json();
            if (data.status === 'success') setSettings({ ...settings, finance_initialized: true });
        } catch {}
        setLoading(false);
    };

    return (
        <div className="app-content-padding space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Finance</h1>
                <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Double-entry accounting, billing, and financial reporting.</p>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">Loading finance settings...</p>
                </div>
            ) : !settings?.finance_initialized ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-primary))] mb-4 block">account_balance</span>
                    <h2 className="text-xl font-bold text-[hsl(var(--admin-text-main))] mb-2">Initialize Finance Module</h2>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))] mb-6 max-w-md mx-auto">Set up your chart of accounts, tax rates, and fiscal periods to start managing school finances.</p>
                    <button type="button" onClick={handleInitialize} className="bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] px-6 py-2.5 rounded-[12px] font-semibold transition-all shadow-sm">Initialize Finance</button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <QuickCard icon="account_tree" title="Chart of Accounts" desc="Manage your account structure" onClick={() => router.push(`/tenant/${slug}/admin/finance/accounts`)} />
                        <QuickCard icon="menu_book" title="Journal Entries" desc="Post and review journal entries" onClick={() => router.push(`/tenant/${slug}/admin/finance/journals`)} />
                        <QuickCard icon="calendar_month" title="Fiscal Periods" desc="Manage fiscal years and periods" onClick={() => router.push(`/tenant/${slug}/admin/finance/periods`)} />
                        <QuickCard icon="bar_chart" title="Reports" desc="Trial balance, P&L, balance sheet" onClick={() => router.push(`/tenant/${slug}/admin/finance/reports`)} />
                        <QuickCard icon="settings" title="Settings" desc="Currency, tax, numbering config" onClick={() => router.push(`/tenant/${slug}/admin/finance/settings`)} />
                    </div>
                    <div className="ios-card">
                        <h3 className="font-semibold text-[16px] text-[hsl(var(--admin-text-main))] mb-4">Configuration</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <InfoPill label="Currency" value={settings.base_currency || 'ZAR'} />
                            <InfoPill label="Tax" value={settings.tax_enabled ? `${settings.default_tax_rate}%` : 'Disabled'} />
                            <InfoPill label="Payment Terms" value={`${settings.default_payment_terms_days} days`} />
                            <InfoPill label="Fiscal Start" value={`Month ${settings.fiscal_year_start_month}`} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function QuickCard({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="ios-card text-left hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer group">
            <span className="material-symbols-outlined text-3xl text-[hsl(var(--admin-primary))] mb-3 block group-hover:scale-110 transition-transform">{icon}</span>
            <h3 className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))] mb-1">{title}</h3>
            <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">{desc}</p>
        </button>
    );
}

function InfoPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[hsl(var(--admin-surface-alt))] rounded-xl p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-1">{label}</p>
            <p className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">{value}</p>
        </div>
    );
}
