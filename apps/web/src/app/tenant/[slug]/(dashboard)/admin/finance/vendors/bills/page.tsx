'use client';

import { useEffect, useState } from 'react';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const STATUS_OPTIONS = ['all', 'draft', 'received', 'paid', 'overdue', 'cancelled'];

export default function VendorBillsPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!tenantId) return;
        const qs = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
        fetch(`/v1/admin/tenants/${tenantId}/finance/vendors/bills${qs}`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setBills(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId, statusFilter]);

    const statusColor = (s: string) => {
        const map: Record<string, string> = { paid: 'bg-green-100 text-green-700', received: 'bg-blue-100 text-blue-700', draft: 'bg-gray-100 text-gray-600', overdue: 'bg-red-100 text-red-700', cancelled: 'bg-orange-100 text-orange-700' };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Vendor Bills</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Track bills received from vendors and suppliers.</p>
                </div>
                <div className="flex gap-2">
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setLoading(true); }} aria-label="Filter by status" className="border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90"><span className="material-symbols-outlined text-[18px]">add</span>New Bill</button>
                </div>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : bills.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">description</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No vendor bills found.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Bill #</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Vendor</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Amount</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Due Date</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{bills.map((b: any) => (
                                <tr key={b.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                                    <td className="p-3 px-5 font-mono text-[13px] font-medium text-[hsl(var(--admin-text-main))]">{b.bill_number}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-main))]">{b.vendor_name || b.vendor_id || '—'}</td>
                                    <td className="p-3 text-right font-semibold text-[hsl(var(--admin-text-main))]">R {Number(b.amount || 0).toFixed(2)}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{b.due_date?.slice(0, 10) || '—'}</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor(b.status)}`}>{b.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
