'use client';

import { useEffect, useState } from 'react';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function FeeStructuresPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [structures, setStructures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/billing/fee-structures`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setStructures(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Fee Structures</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Define tuition and fee schedules per academic year, phase, and grade.</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90"><span className="material-symbols-outlined text-[18px]">add</span>New Fee Structure</button>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : structures.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">payments</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No fee structures defined yet.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Name</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Academic Year</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Phase</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Grade</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Annual Total</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{structures.map((fs: any) => (
                                <tr key={fs.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                                    <td className="p-3 px-5 font-medium text-[hsl(var(--admin-text-main))]">{fs.name}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{fs.academic_year || '—'}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{fs.phase || '—'}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{fs.grade || '—'}</td>
                                    <td className="p-3 text-right font-semibold text-[hsl(var(--admin-text-main))]">R {Number(fs.annual_total || 0).toFixed(2)}</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${fs.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{fs.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
