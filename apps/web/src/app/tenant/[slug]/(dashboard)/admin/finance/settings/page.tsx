'use client';

import { useEffect, useState } from 'react';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function FinanceSettingsPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/settings`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setSettings(d.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setSaved(false);
        try {
            await fetch(`/v1/admin/tenants/${tenantId}/finance/settings`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    base_currency: settings.base_currency,
                    tax_enabled: settings.tax_enabled,
                    default_tax_rate: settings.default_tax_rate,
                    default_payment_terms_days: settings.default_payment_terms_days,
                    fiscal_year_start_month: settings.fiscal_year_start_month,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {}
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="app-content-padding">
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span>
                </div>
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="app-content-padding space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Finance Settings</h1>
                <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Configure currency, tax, and numbering for this tenant.</p>
            </div>

            <div className="ios-card space-y-5">
                <h3 className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))]">General</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Base Currency</label>
                        <select value={settings.base_currency} onChange={e => setSettings({ ...settings, base_currency: e.target.value })} aria-label="Base currency" className="w-full border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]">
                            <option value="ZAR">ZAR — South African Rand</option>
                            <option value="USD">USD — US Dollar</option>
                            <option value="GBP">GBP — British Pound</option>
                            <option value="EUR">EUR — Euro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Default Payment Terms</label>
                        <div className="flex items-center gap-2">
                            <input type="number" value={settings.default_payment_terms_days} onChange={e => setSettings({ ...settings, default_payment_terms_days: parseInt(e.target.value, 10) || 0 })} min="0" aria-label="Payment terms days" className="w-full border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" />
                            <span className="text-[13px] text-[hsl(var(--admin-text-sub))] whitespace-nowrap">days</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Fiscal Year Start Month</label>
                    <select value={settings.fiscal_year_start_month} onChange={e => setSettings({ ...settings, fiscal_year_start_month: parseInt(e.target.value, 10) })} aria-label="Fiscal year start month" className="w-full sm:w-48 border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]">
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="ios-card space-y-4">
                <h3 className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))]">Tax</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.tax_enabled} onChange={e => setSettings({ ...settings, tax_enabled: e.target.checked })} className="rounded w-5 h-5" />
                    <span className="text-[14px] text-[hsl(var(--admin-text-main))]">Enable Tax (VAT)</span>
                </label>
                {settings.tax_enabled && (
                    <div>
                        <label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Default Tax Rate (%)</label>
                        <input type="number" value={settings.default_tax_rate} onChange={e => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) || 0 })} min="0" max="100" step="0.5" aria-label="Default tax rate" className="w-32 border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={saving} className="bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
                {saved && <span className="text-[13px] text-green-600 font-semibold">Saved!</span>}
            </div>
        </div>
    );
}
