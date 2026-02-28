'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import TenantDrawer from './TenantDrawer';

interface Tenant {
  id: string; school_code: string; school_name: string;
  tenant_slug: string; status: string; brand_id: string; created_at: string;
}
interface Props { slug: string; readOnly?: boolean; }

const ST: Record<string, string> = {
  active: 'text-green-600 bg-green-100',
  paused: 'text-amber-600 bg-amber-100',
  archived: 'text-gray-500 bg-gray-100',
};

export default function TenantsList({ slug, readOnly = false }: Props) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/v1/admin/tenants?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setTenants(await res.json());
    } catch {}
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tenants…"
            className="w-full pl-10 pr-4 h-11 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] focus:ring-2 focus:ring-[hsl(var(--admin-primary)/0.15)] transition-all"
          />
        </div>
        {!readOnly && (
          <>
            <select
              title="Filter by status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-11 px-3 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none hidden sm:block"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="h-11 px-4 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Tenant</span>
            </button>
          </>
        )}
      </div>

      {/* List */}
      <div className="ios-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-[hsl(var(--admin-primary)/0.25)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
            <p className="text-[14px] font-medium text-[hsl(var(--admin-text-muted))]">Loading tenants…</p>
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[hsl(var(--admin-text-muted))]">domain</span>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-sub))]">No tenants found</p>
              <p className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))] mt-0.5">
                {search ? 'Try a different search' : 'Add your first tenant to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--admin-border))]">
            {tenants.map(t => (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelectedTenant(t)}
                className="w-full flex items-center gap-3.5 px-4 py-4 hover:bg-[hsl(var(--admin-surface-alt))] active:bg-[hsl(var(--admin-surface-alt))] transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-[13px] bg-[hsl(var(--admin-primary)/0.12)] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-[hsl(var(--admin-primary))]">domain</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight truncate">{t.school_name}</p>
                  <p className="text-[12px] font-mono font-semibold text-[hsl(var(--admin-text-sub))] mt-0.5">{t.school_code}</p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${ST[t.status] || ST.archived}`}>
                  {t.status}
                </span>
                <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-muted))] flex-shrink-0">chevron_right</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTenant && (
        <TenantDrawer tenant={selectedTenant} readOnly={readOnly}
          onClose={() => setSelectedTenant(null)}
          onSave={() => { setSelectedTenant(null); fetchTenants(); }} />
      )}
      {showCreate && (
        <TenantDrawer tenant={null} readOnly={false}
          onClose={() => setShowCreate(false)}
          onSave={() => { setShowCreate(false); fetchTenants(); }} />
      )}
    </div>
  );
}
