'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import TenantDrawer from './TenantDrawer';
import { authFetch } from '@/lib/authFetch';

interface Tenant {
  id: string; school_code: string; school_name: string;
  tenant_slug: string; status: string; brand_id: string; created_at: string;
}
interface Props { slug: string; readOnly?: boolean; showNewButton?: boolean; }

const MANAGE_ROLES = ['platform_super_admin', 'app_super_admin', 'platform_secretary'];
const DELETE_ROLES = ['platform_super_admin', 'app_super_admin'];

const ST: Record<string, string> = {
  active: 'text-green-600 bg-green-100',
  paused: 'text-amber-600 bg-amber-100',
  archived: 'text-gray-500 bg-gray-100',
};

export default function TenantsList({ slug, readOnly = false, showNewButton = true }: Props) {
  const router = useRouter();
  const { fullRole } = useRole();
  const canManage = MANAGE_ROLES.some(r => fullRole.includes(r));
  const canDelete = DELETE_ROLES.some(r => fullRole.includes(r));

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await authFetch(`/v1/admin/tenants?${params}`);
      if (res.ok) {
        const all = await res.json();
        // Hide the edapp platform tenant — it's not a real school
        setTenants(Array.isArray(all) ? all.filter((t: Tenant) => t.tenant_slug !== 'edapp') : []);
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.message || `Failed to load schools (${res.status})`);
        setTenants([]);
      }
    } catch {
      setError('Unable to connect. Please refresh.');
      setTenants([]);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const handleArchive = async (t: Tenant) => {
    if (!confirm(`Archive "${t.school_name}"? The school will be hidden but data is preserved.`)) return;
    setActionBusy(t.id);
    try {
      const res = await authFetch(`/v1/admin/tenants/${t.id}/disable`, { method: 'PATCH' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || 'Failed to archive');
      }
      await fetchTenants();
    } finally { setActionBusy(null); }
  };

  const handleRestore = async (t: Tenant) => {
    setActionBusy(t.id);
    try {
      await authFetch(`/v1/admin/tenants/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      await fetchTenants();
    } finally { setActionBusy(null); }
  };

  const STATUS_PILLS = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-3">
      {/* Status pill filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
        {STATUS_PILLS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
              statusFilter === value
                ? 'bg-[hsl(var(--admin-primary))] text-white'
                : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + New */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schools…"
            className="w-full pl-10 pr-4 h-11 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] focus:ring-2 focus:ring-[hsl(var(--admin-primary)/0.15)] transition-all"
          />
        </div>
        {!readOnly && showNewButton && (
          <button
            type="button"
            onClick={() => router.push(`/tenant/${slug}/admin/tenants/new`)}
            className="h-11 px-4 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New School</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="ios-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-[hsl(var(--admin-primary)/0.25)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
            <p className="text-[14px] font-medium text-[hsl(var(--admin-text-muted))]">Loading schools…</p>
          </div>
        ) : error ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-red-400">error</span>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-sub))]">{error}</p>
              <button type="button" onClick={fetchTenants} className="mt-2 text-[13px] font-medium text-[hsl(var(--admin-primary))] underline">Retry</button>
            </div>
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[hsl(var(--admin-text-muted))]">domain</span>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-sub))]">
                {search ? 'No schools match your search' : statusFilter ? `No ${statusFilter} schools` : 'No schools yet'}
              </p>
              {!search && !statusFilter && (
                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))] mt-0.5">Create your first school to get started</p>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--admin-border))]">
            {tenants.map(t => {
              const isArchived = t.status === 'archived';
              const isBusy = actionBusy === t.id;

              return (
                <div key={t.id} className={`flex items-center gap-3.5 px-4 py-4 ${isArchived ? 'opacity-60' : ''}`}>
                  <div className="w-11 h-11 rounded-[13px] bg-[hsl(var(--admin-primary)/0.12)] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[22px] text-[hsl(var(--admin-primary))]">domain</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTenant(t)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight truncate">{t.school_name}</p>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize flex-shrink-0 ${ST[t.status] || ST.archived}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[12px] font-mono font-semibold text-[hsl(var(--admin-text-sub))] mt-0.5">{t.school_code}</p>
                  </button>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isBusy ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-[hsl(var(--admin-primary)/0.2)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Edit */}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => setSelectedTenant(t)}
                            className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-[hsl(var(--admin-primary)/0.1)] active:scale-90 transition-all"
                            title="Edit school"
                          >
                            <span className="material-symbols-outlined text-[17px] text-[hsl(var(--admin-text-sub))]">edit</span>
                          </button>
                        )}

                        {/* Archive — non-archived only */}
                        {canManage && !isArchived && (
                          <button
                            type="button"
                            onClick={() => handleArchive(t)}
                            className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-amber-50 active:scale-90 transition-all"
                            title="Archive school"
                          >
                            <span className="material-symbols-outlined text-[17px] text-amber-500">inventory_2</span>
                          </button>
                        )}

                        {/* Restore — archived only */}
                        {canManage && isArchived && (
                          <button
                            type="button"
                            onClick={() => handleRestore(t)}
                            className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-green-50 active:scale-90 transition-all"
                            title="Restore school"
                          >
                            <span className="material-symbols-outlined text-[17px] text-green-500">undo</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTenant && (
        <TenantDrawer tenant={selectedTenant} readOnly={readOnly}
          onClose={() => setSelectedTenant(null)}
          onSave={() => { setSelectedTenant(null); fetchTenants(); }} />
      )}
    </div>
  );
}
