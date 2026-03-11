'use client';

import { useEffect, useState } from 'react';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function BudgetsPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/budgets`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setBudgets(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const statusColor = (s: string) => {
        const map: Record<string, string> = { approved: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-700', closed: 'bg-blue-100 text-blue-700' };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Budgets</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Create and manage departmental and institutional budgets.</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90"><span className="material-symbols-outlined text-[18px]">add</span>Create Budget</button>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : budgets.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">calculate</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No budgets created yet.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Name</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Fiscal Year</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Department</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Total Amount</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{budgets.map((b: any) => (
                                <tr key={b.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                                    <td className="p-3 px-5 font-medium text-[hsl(var(--admin-text-main))]">{b.name}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{b.fiscal_year || '—'}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{b.department || '—'}</td>
                                    <td className="p-3 text-right font-semibold text-[hsl(var(--admin-text-main))]">R {Number(b.total_amount || 0).toFixed(2)}</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor(b.status)}`}>{b.status || 'draft'}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
