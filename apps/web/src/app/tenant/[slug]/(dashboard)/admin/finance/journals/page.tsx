'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Journal {
    id: string;
    journal_number: string;
    journal_date: string;
    description: string;
    source_type: string;
    status: string;
    total_debit: number;
    total_credit: number;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function JournalsPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [journals, setJournals] = useState<Journal[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!tenantId) return;
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        fetch(`/v1/admin/tenants/${tenantId}/finance/journals?${params}`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setJournals(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId, statusFilter]);

    const statusColors: Record<string, string> = { DRAFT: 'bg-yellow-100 text-yellow-700', POSTED: 'bg-green-100 text-green-700', REVERSED: 'bg-red-100 text-red-700' };
    const fmtAmount = (n: number) => `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Journal Entries</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Double-entry journal postings and reversals.</p>
                </div>
                <div className="flex gap-3">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status" className="border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]">
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="POSTED">Posted</option>
                        <option value="REVERSED">Reversed</option>
                    </select>
                    <button type="button" onClick={() => router.push(`/tenant/${slug}/admin/finance/journals/new`)} className="bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] px-5 py-2 rounded-xl font-semibold transition-all shadow-sm text-sm">+ New Journal</button>
                </div>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : journals.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">menu_book</span>
                    <h2 className="text-lg font-bold text-[hsl(var(--admin-text-main))] mb-2">No Journal Entries</h2>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Create your first journal entry to start recording transactions.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Number</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Date</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Description</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Source</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Debit</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Credit</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{journals.map(j => (
                                <tr key={j.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer" onClick={() => router.push(`/tenant/${slug}/admin/finance/journals/${j.id}`)}>
                                    <td className="p-3 px-5 font-mono text-[13px] font-semibold text-[hsl(var(--admin-primary))]">{j.journal_number}</td>
                                    <td className="p-3 text-[13px]">{j.journal_date}</td>
                                    <td className="p-3 text-[13px] max-w-xs truncate">{j.description}</td>
                                    <td className="p-3 text-[12px] text-[hsl(var(--admin-text-sub))]">{j.source_type}</td>
                                    <td className="p-3 text-[13px] text-right font-mono">{fmtAmount(j.total_debit)}</td>
                                    <td className="p-3 text-[13px] text-right font-mono">{fmtAmount(j.total_credit)}</td>
                                    <td className="p-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusColors[j.status] || 'bg-gray-100 text-gray-700'}`}>{j.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
