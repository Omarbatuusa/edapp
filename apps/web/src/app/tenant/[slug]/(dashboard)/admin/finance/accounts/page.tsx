'use client';

import { useEffect, useState } from 'react';

interface Account {
    id: string;
    code: string;
    name: string;
    account_type: string;
    sub_type: string;
    is_header: boolean;
    is_system: boolean;
    is_active: boolean;
    children?: Account[];
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function ChartOfAccountsPage() {
    const [tree, setTree] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/accounts/tree`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setTree(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const typeColors: Record<string, string> = {
        ASSET: 'bg-blue-100 text-blue-700',
        LIABILITY: 'bg-orange-100 text-orange-700',
        EQUITY: 'bg-purple-100 text-purple-700',
        REVENUE: 'bg-green-100 text-green-700',
        EXPENSE: 'bg-red-100 text-red-700',
    };

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Chart of Accounts</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Hierarchical account structure for double-entry bookkeeping.</p>
                </div>
                <input type="text" placeholder="Filter accounts..." value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter accounts" className="border border-[hsl(var(--admin-border))] rounded-xl px-4 py-2 text-sm bg-[hsl(var(--admin-surface))] w-full md:w-64" />
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : tree.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">account_tree</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No accounts found. Initialize finance first.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Code</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Account Name</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Type</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Sub-Type</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{tree.map(root => renderAccountRows(root, 0, filter, typeColors))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function renderAccountRows(account: Account, depth: number, filter: string, typeColors: Record<string, string>): React.ReactNode[] {
    const rows: React.ReactNode[] = [];
    const matchesFilter = !filter || account.code.toLowerCase().includes(filter.toLowerCase()) || account.name.toLowerCase().includes(filter.toLowerCase());
    const childRows = (account.children || []).flatMap(c => renderAccountRows(c, depth + 1, filter, typeColors));
    if (!matchesFilter && childRows.length === 0) return [];

    rows.push(
        <tr key={account.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
            <td className="p-3 px-5 font-mono text-[13px] text-[hsl(var(--admin-text-main))]" style={{ paddingLeft: `${20 + depth * 24}px` }}>{account.code}</td>
            <td className={`p-3 text-[14px] ${account.is_header ? 'font-bold' : 'font-medium'} text-[hsl(var(--admin-text-main))]`}>{account.name}</td>
            <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${typeColors[account.account_type] || 'bg-gray-100 text-gray-700'}`}>{account.account_type}</span></td>
            <td className="p-3 text-[13px] text-[hsl(var(--admin-text-sub))]">{account.sub_type?.replace(/_/g, ' ') || '—'}</td>
            <td className="p-3 text-center">{account.is_active ? <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> : <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />}</td>
        </tr>,
    );
    rows.push(...childRows);
    return rows;
}
