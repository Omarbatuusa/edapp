'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function BillingDashboardPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/billing/family-accounts`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setAccounts(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const statusColor = (s: string) => {
        if (s === 'active') return 'bg-green-100 text-green-700';
        if (s === 'suspended') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Billing</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Family accounts, invoices, and fee structures.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/tenant/${slug}/admin/finance/billing/invoices`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))]"><span className="material-symbols-outlined text-[18px]">receipt_long</span>Invoices</Link>
                    <Link href={`/tenant/${slug}/admin/finance/billing/fee-structures`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))]"><span className="material-symbols-outlined text-[18px]">payments</span>Fee Structures</Link>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90"><span className="material-symbols-outlined text-[18px]">add</span>New Account</button>
                </div>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : accounts.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">account_balance_wallet</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No family accounts found.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Family</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Account #</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Balance</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{accounts.map((a: any) => (
                                <tr key={a.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                                    <td className="p-3 px-5 font-medium text-[hsl(var(--admin-text-main))]">{a.family_name || a.family_id || '—'}</td>
                                    <td className="p-3 font-mono text-[13px] text-[hsl(var(--admin-text-sub))]">{a.account_number || a.id?.slice(0, 8)}</td>
                                    <td className="p-3 text-right font-semibold text-[hsl(var(--admin-text-main))]">R {Number(a.balance || 0).toFixed(2)}</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor(a.status)}`}>{a.status || 'active'}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
