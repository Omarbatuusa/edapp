'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { canView, getUserRole } from '@/lib/role-permissions';

interface EnrollmentApp {
    id: string;
    status: string;
    branch_id: string;
    learner_data: Record<string, any>;
    guardians_data: any[];
    submitted_by_email: string;
    submitted_at: string;
    created_at: string;
}

interface Props { params: Promise<{ slug: string }> }

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    WAITLISTED: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function EnrollmentListPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const [apps, setApps] = useState<EnrollmentApp[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const limit = 25;

    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';

    const fetchApps = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`/v1/admin/tenants/${tenantId}/enrollment?${params}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setApps(data.applications || []);
                setTotal(data.total || 0);
            }
        } catch {} finally {
            setLoading(false);
        }
    }, [tenantId, page, statusFilter]);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    if (!canView(role, 'enrollment')) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">You do not have permission to view enrollment applications.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Enrollment Applications</h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">Review and manage learner enrollment applications.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-sm font-medium text-[hsl(var(--admin-text-main))]"
                >
                    <option value="">All Statuses</option>
                    {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                </select>
                <span className="flex items-center text-xs text-[hsl(var(--admin-text-muted))] ml-auto">
                    {total} application{total !== 1 ? 's' : ''}
                </span>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-[hsl(var(--admin-primary))] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : apps.length === 0 ? (
                <div className="ios-card text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] mb-3 block">how_to_reg</span>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">No enrollment applications found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {apps.map(app => {
                        const learnerName = app.learner_data
                            ? `${app.learner_data.first_name || ''} ${app.learner_data.surname || ''}`.trim()
                            : 'Unknown Learner';
                        const statusColor = STATUS_COLORS[app.status] || STATUS_COLORS.DRAFT;
                        const date = app.submitted_at ? new Date(app.submitted_at) : new Date(app.created_at);

                        return (
                            <Link
                                key={app.id}
                                href={`/tenant/${slug}/admin/enrollment/${app.id}`}
                                className="ios-card p-0 overflow-hidden hover:shadow-md transition-shadow block"
                            >
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor}`}>
                                        {app.status.replace('_', ' ')}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[hsl(var(--admin-text-main))] truncate">
                                            {learnerName || 'Draft Application'}
                                        </p>
                                        <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                                            {date.toLocaleDateString()} {date.toLocaleTimeString()}
                                            {app.submitted_by_email && <span className="ml-2">by {app.submitted_by_email}</span>}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-lg">chevron_right</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-sm font-medium disabled:opacity-40 hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">Previous</button>
                    <span className="text-sm text-[hsl(var(--admin-text-sub))] font-medium">Page {page} of {totalPages}</span>
                    <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-sm font-medium disabled:opacity-40 hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">Next</button>
                </div>
            )}
        </div>
    );
}
