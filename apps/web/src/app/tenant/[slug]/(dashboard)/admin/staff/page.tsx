'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { canView, canManage, getUserRole } from '@/lib/role-permissions';

interface StaffMember {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    branch_id: string;
    branch_name?: string;
    assigned_roles: string[];
    employment_type_code: string;
    joining_date: string;
    created_at: string;
}

interface Props { params: Promise<{ slug: string }> }

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function StaffListPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 25;

    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';

    const fetchStaff = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (search.trim()) params.set('search', search.trim());
            const res = await fetch(`/v1/admin/tenants/${tenantId}/staff?${params}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setStaff(data.staff || data.items || data.data || []);
                setTotal(data.total || 0);
            }
        } catch {} finally {
            setLoading(false);
        }
    }, [tenantId, page, search]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    if (!canView(role, 'staff')) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">You do not have permission to view staff members.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Staff Members</h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">Manage teaching and leadership staff.</p>
                </div>
                {canManage(role, 'staff') && (
                    <Link
                        href={`/tenant/${slug}/admin/staff/new`}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[hsl(var(--admin-primary))] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Add Staff
                    </Link>
                )}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))] text-lg">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name or email..."
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-sm text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))]/30 transition-shadow"
                    />
                </div>
                <span className="flex items-center text-xs text-[hsl(var(--admin-text-muted))] ml-auto">
                    {total} staff member{total !== 1 ? 's' : ''}
                </span>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-[hsl(var(--admin-primary))] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : staff.length === 0 ? (
                <div className="ios-card text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] mb-3 block">badge</span>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                        {search ? 'No staff members match your search.' : 'No staff members found.'}
                    </p>
                    {!search && canManage(role, 'staff') && (
                        <Link
                            href={`/tenant/${slug}/admin/staff/new`}
                            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[hsl(var(--admin-primary))] hover:underline"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Add your first staff member
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {staff.map(member => {
                        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
                        const roles = member.assigned_roles?.length > 0
                            ? member.assigned_roles.join(', ')
                            : null;

                        return (
                            <div
                                key={member.id}
                                className="ios-card p-0 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--admin-primary))]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] text-lg">person</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[hsl(var(--admin-text-main))] truncate">
                                            {fullName || 'Unnamed Staff'}
                                        </p>
                                        <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">
                                            {member.email}
                                            {member.branch_name && <span className="ml-2">- {member.branch_name}</span>}
                                        </p>
                                    </div>
                                    {roles && (
                                        <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end max-w-[200px]">
                                            {member.assigned_roles.slice(0, 2).map(r => (
                                                <span
                                                    key={r}
                                                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap"
                                                >
                                                    {r.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                            {member.assigned_roles.length > 2 && (
                                                <span className="text-xs text-[hsl(var(--admin-text-muted))]">
                                                    +{member.assigned_roles.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-lg">chevron_right</span>
                                </div>
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
                    <span className="text-sm text-[hsl(var(--admin-text-sub))] font-medium">Page {page} of {totalPages}</span>
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
