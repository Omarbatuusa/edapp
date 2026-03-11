'use client';

import { useEffect, useState } from 'react';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function AssetRegisterPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/assets`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setAssets(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const statusColor = (s: string) => {
        const map: Record<string, string> = { active: 'bg-green-100 text-green-700', disposed: 'bg-red-100 text-red-700', depreciated: 'bg-orange-100 text-orange-700' };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Asset Register</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Track fixed assets, depreciation, and disposals.</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90"><span className="material-symbols-outlined text-[18px]">add</span>Add Asset</button>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : assets.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">inventory_2</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No assets registered yet.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Asset #</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Name</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Category</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Acquired</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Cost</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Accum. Depr.</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{assets.map((a: any) => (
                                <tr key={a.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                                    <td className="p-3 px-5 font-mono text-[13px] font-medium text-[hsl(var(--admin-text-main))]">{a.asset_number}</td>
                                    <td className="p-3 font-medium text-[hsl(var(--admin-text-main))]">{a.name}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{a.category || '—'}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{a.acquisition_date?.slice(0, 10) || '—'}</td>
                                    <td className="p-3 text-right font-semibold text-[hsl(var(--admin-text-main))]">R {Number(a.acquisition_cost || 0).toFixed(2)}</td>
                                    <td className="p-3 text-right text-[hsl(var(--admin-text-sub))]">R {Number(a.accumulated_depreciation || 0).toFixed(2)}</td>
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
