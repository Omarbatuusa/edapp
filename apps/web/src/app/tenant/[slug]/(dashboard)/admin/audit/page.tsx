'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { canView, getUserRole } from '@/lib/role-permissions';

interface AuditEvent {
    id: string;
    tenant_id: string | null;
    actor_user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    before: Record<string, any> | null;
    after: Record<string, any> | null;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

interface Props { params: Promise<{ slug: string }> }

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    TENANT_CREATE: { label: 'Tenant Created', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    TENANT_EDIT: { label: 'Tenant Edited', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    TENANT_DISABLE: { label: 'Tenant Disabled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    DICT_EDIT: { label: 'Dictionary Edit', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    FINANCE_MODE_CHANGE: { label: 'Finance Mode', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    ROLE_ASSIGN: { label: 'Role Assigned', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
    ROLE_REVOKE: { label: 'Role Revoked', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    ADMISSIONS_PUBLISH: { label: 'Admissions Published', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    FEATURE_TOGGLE: { label: 'Feature Toggled', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function AuditLogPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const limit = 25;

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (actionFilter) params.set('action', actionFilter);
            const res = await fetch(`/v1/admin/audit-events?${params}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
                setTotal(data.total || 0);
            }
        } catch {
            // Network error
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    if (!canView(role, 'audit')) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">You do not have permission to view audit logs.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Audit Log</h1>
                <p className="text-sm text-[hsl(var(--admin-text-sub))]">Track all platform changes and administrative actions.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-sm font-medium text-[hsl(var(--admin-text-main))]"
                >
                    <option value="">All Actions</option>
                    {ALL_ACTIONS.map(a => (
                        <option key={a} value={a}>{ACTION_LABELS[a]?.label || a}</option>
                    ))}
                </select>
                <span className="flex items-center text-xs text-[hsl(var(--admin-text-muted))] ml-auto">
                    {total} event{total !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-[hsl(var(--admin-primary))] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : events.length === 0 ? (
                <div className="ios-card text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] mb-3 block">history</span>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">No audit events found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {events.map(event => {
                        const actionInfo = ACTION_LABELS[event.action] || { label: event.action, color: 'bg-gray-100 text-gray-700' };
                        const isExpanded = expandedId === event.id;
                        const timestamp = new Date(event.created_at);

                        return (
                            <div
                                key={event.id}
                                className="ios-card p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                            >
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${actionInfo.color}`}>
                                        {actionInfo.label}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[hsl(var(--admin-text-main))] truncate">
                                            {event.entity_type && <span className="text-[hsl(var(--admin-text-sub))]">{event.entity_type}</span>}
                                            {event.entity_id && <span className="text-[hsl(var(--admin-text-muted))] ml-1.5 font-mono text-xs">{event.entity_id.slice(0, 8)}...</span>}
                                        </p>
                                        <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                                            {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
                                            {event.actor_user_id && <span className="ml-2">by {event.actor_user_id.slice(0, 8)}...</span>}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-lg transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}>
                                        expand_more
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-[hsl(var(--admin-border))] px-4 py-3 bg-[hsl(var(--admin-surface-alt))] space-y-2 text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><span className="font-semibold text-[hsl(var(--admin-text-sub))]">Event ID:</span> <span className="font-mono">{event.id}</span></div>
                                            <div><span className="font-semibold text-[hsl(var(--admin-text-sub))]">Actor:</span> <span className="font-mono">{event.actor_user_id || 'System'}</span></div>
                                            <div><span className="font-semibold text-[hsl(var(--admin-text-sub))]">Tenant:</span> <span className="font-mono">{event.tenant_id || 'Platform'}</span></div>
                                            <div><span className="font-semibold text-[hsl(var(--admin-text-sub))]">IP:</span> <span className="font-mono">{event.ip_address || 'N/A'}</span></div>
                                        </div>
                                        {event.before && (
                                            <div>
                                                <p className="font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Before:</p>
                                                <pre className="bg-[hsl(var(--admin-surface))] rounded-lg p-2 overflow-x-auto text-[11px]">{JSON.stringify(event.before, null, 2)}</pre>
                                            </div>
                                        )}
                                        {event.after && (
                                            <div>
                                                <p className="font-semibold text-[hsl(var(--admin-text-sub))] mb-1">After:</p>
                                                <pre className="bg-[hsl(var(--admin-surface))] rounded-lg p-2 overflow-x-auto text-[11px]">{JSON.stringify(event.after, null, 2)}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-sm font-medium disabled:opacity-40 hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-[hsl(var(--admin-text-sub))] font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-sm font-medium disabled:opacity-40 hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
