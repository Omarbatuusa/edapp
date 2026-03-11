'use client';

import { useEffect, useState, useCallback } from 'react';

interface FiscalYear {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    periods?: FiscalPeriod[];
}

interface FiscalPeriod {
    id: string;
    name: string;
    period_number: number;
    start_date: string;
    end_date: string;
    status: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function FiscalPeriodsPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [years, setYears] = useState<FiscalYear[]>([]);
    const [expandedYear, setExpandedYear] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newYear, setNewYear] = useState({ name: '', start_date: '', end_date: '' });
    const [creating, setCreating] = useState(false);

    const fetchYears = useCallback(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/fiscal-years`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setYears(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    useEffect(() => { fetchYears(); }, [fetchYears]);

    const loadPeriods = async (yearId: string) => {
        if (expandedYear === yearId) { setExpandedYear(null); return; }
        const res = await fetch(`/v1/admin/tenants/${tenantId}/finance/fiscal-years/${yearId}`, { headers: getAuthHeaders() });
        const data = await res.json();
        setYears(prev => prev.map(y => y.id === yearId ? { ...y, periods: data.data?.periods || [] } : y));
        setExpandedYear(yearId);
    };

    const createYear = async () => {
        if (!newYear.name || !newYear.start_date || !newYear.end_date) return;
        setCreating(true);
        try {
            await fetch(`/v1/admin/tenants/${tenantId}/finance/fiscal-years`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newYear),
            });
            setShowCreate(false);
            setNewYear({ name: '', start_date: '', end_date: '' });
            fetchYears();
        } catch {}
        setCreating(false);
    };

    const togglePeriod = async (periodId: string, action: 'close' | 'reopen' | 'lock') => {
        await fetch(`/v1/admin/tenants/${tenantId}/finance/periods/${periodId}/${action}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (expandedYear) loadPeriods(expandedYear);
    };

    const statusColors: Record<string, string> = {
        OPEN: 'bg-green-100 text-green-700',
        CLOSED: 'bg-yellow-100 text-yellow-700',
        LOCKED: 'bg-red-100 text-red-700',
    };

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Fiscal Periods</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Manage fiscal years and their monthly periods.</p>
                </div>
                <button type="button" onClick={() => setShowCreate(!showCreate)} className="bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] px-5 py-2 rounded-xl font-semibold transition-all shadow-sm text-sm">+ New Fiscal Year</button>
            </div>

            {showCreate && (
                <div className="ios-card space-y-4">
                    <h3 className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))]">Create Fiscal Year</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Name</label>
                            <input type="text" value={newYear.name} onChange={e => setNewYear({ ...newYear, name: e.target.value })} placeholder="e.g. 2026" aria-label="Fiscal year name" className="w-full border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Start Date</label>
                            <input type="date" value={newYear.start_date} onChange={e => setNewYear({ ...newYear, start_date: e.target.value })} aria-label="Start date" className="w-full border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">End Date</label>
                            <input type="date" value={newYear.end_date} onChange={e => setNewYear({ ...newYear, end_date: e.target.value })} aria-label="End date" className="w-full border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))]">Cancel</button>
                        <button type="button" onClick={createYear} disabled={creating} className="bg-[hsl(var(--admin-primary))] text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">{creating ? 'Creating...' : 'Create (12 periods)'}</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span>
                </div>
            ) : years.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">calendar_month</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No fiscal years created yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {years.map(year => (
                        <div key={year.id} className="ios-card p-0 overflow-hidden">
                            <button type="button" onClick={() => loadPeriods(year.id)} className="w-full p-4 px-5 flex items-center justify-between hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-[hsl(var(--admin-primary))]">calendar_month</span>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))]">{year.name}</h3>
                                        <p className="text-[12px] text-[hsl(var(--admin-text-sub))]">{year.start_date} → {year.end_date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusColors[year.status] || ''}`}>{year.status}</span>
                                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">{expandedYear === year.id ? 'expand_less' : 'expand_more'}</span>
                                </div>
                            </button>
                            {expandedYear === year.id && year.periods && (
                                <div className="border-t border-[hsl(var(--admin-border))]">
                                    {year.periods.map(p => (
                                        <div key={p.id} className="px-5 py-3 flex items-center justify-between border-b border-[hsl(var(--admin-border))] last:border-0 hover:bg-[hsl(var(--admin-surface-alt))/0.5]">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[12px] font-mono text-[hsl(var(--admin-text-muted))] w-6">P{p.period_number}</span>
                                                <span className="text-[14px] text-[hsl(var(--admin-text-main))]">{p.name}</span>
                                                <span className="text-[11px] text-[hsl(var(--admin-text-sub))]">{p.start_date} — {p.end_date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[p.status] || ''}`}>{p.status}</span>
                                                {p.status === 'OPEN' && (<button type="button" onClick={() => togglePeriod(p.id, 'close')} className="text-[11px] font-semibold text-yellow-600 hover:underline">Close</button>)}
                                                {p.status === 'CLOSED' && (<>
                                                    <button type="button" onClick={() => togglePeriod(p.id, 'reopen')} className="text-[11px] font-semibold text-green-600 hover:underline">Reopen</button>
                                                    <button type="button" onClick={() => togglePeriod(p.id, 'lock')} className="text-[11px] font-semibold text-red-600 hover:underline">Lock</button>
                                                </>)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
