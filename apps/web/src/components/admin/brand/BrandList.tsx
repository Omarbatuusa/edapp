'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRole } from '@/contexts/RoleContext';
import { authFetch } from '@/lib/authFetch';

interface Brand {
  id: string;
  brand_name: string;
  brand_code: string;
  status: string;
  created_at: string;
  connected_school_count?: number;
  connected_tenant_count?: number;
  logo_url?: string | null;
}

interface BrandListProps { tenantSlug: string; }

const DELETE_ROLES = ['platform_super_admin', 'app_super_admin'];
const MANAGE_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin', 'app_secretary', 'platform_secretary'];

const STATUS_PILLS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

const ST: Record<string, string> = {
  active: 'text-green-600 bg-green-100',
  paused: 'text-amber-600 bg-amber-100',
  archived: 'text-gray-500 bg-gray-100',
};

function BrandLogo({ url, name }: { url?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      <img
        src={url}
        alt={`${name} logo`}
        className="w-11 h-11 rounded-[13px] object-contain bg-white border border-[hsl(var(--admin-border)/0.3)] flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-[13px] bg-[hsl(var(--admin-primary)/0.12)] flex items-center justify-center flex-shrink-0">
      <span className="material-symbols-outlined text-[22px] text-[hsl(var(--admin-primary))]">category</span>
    </div>
  );
}

export function BrandList({ tenantSlug }: BrandListProps) {
  const { fullRole } = useRole();
  const canDelete = DELETE_ROLES.some(r => fullRole.includes(r));
  const canManage = MANAGE_ROLES.some(r => fullRole.includes(r));

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const r = await authFetch(`/v1/admin/brands${qs}`, { cache: 'no-store' });
      const data = await r.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Delete "${brand.brand_name}"? This cannot be undone.`)) return;
    setDeleting(brand.id);
    try {
      const res = await authFetch(`/v1/admin/brands/${brand.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || 'Failed to delete brand');
      }
      await loadBrands();
    } catch {
      alert('Failed to delete brand');
    } finally {
      setDeleting(null);
    }
  };

  const handleArchive = async (brand: Brand) => {
    if (!confirm(`Archive "${brand.brand_name}"? Schools stay linked but the brand will be hidden.`)) return;
    setArchiving(brand.id);
    try {
      const res = await authFetch(`/v1/admin/brands/${brand.id}/archive`, { method: 'PATCH' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || 'Failed to archive brand');
      }
      await loadBrands();
    } finally {
      setArchiving(null);
    }
  };

  const handleRestore = async (brand: Brand) => {
    setArchiving(brand.id);
    try {
      await authFetch(`/v1/admin/brands/${brand.id}/restore`, { method: 'PATCH' });
      await loadBrands();
    } finally {
      setArchiving(null);
    }
  };

  const filtered = brands.filter(b =>
    b.brand_name.toLowerCase().includes(search.toLowerCase()) ||
    b.brand_code.toLowerCase().includes(search.toLowerCase())
  );

  const schoolCount = (b: Brand) => b.connected_school_count ?? b.connected_tenant_count ?? 0;

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

      {/* Search + New Brand */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search brands…"
            className="w-full pl-10 pr-4 h-11 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] focus:ring-2 focus:ring-[hsl(var(--admin-primary)/0.15)] transition-all"
          />
        </div>
        <Link
          href={`/tenant/${tenantSlug}/admin/brands/new`}
          className="h-11 px-4 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Brand</span>
        </Link>
      </div>

      {/* Brand list card */}
      <div className="ios-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-[hsl(var(--admin-primary)/0.25)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
            <p className="text-[14px] font-medium text-[hsl(var(--admin-text-muted))]">Loading brands…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[hsl(var(--admin-text-muted))]">category</span>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-sub))]">
                {search ? 'No brands match your search' : statusFilter ? `No ${statusFilter} brands` : 'No brands yet'}
              </p>
              {!search && !statusFilter && (
                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))] mt-0.5">Create your first brand to get started</p>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--admin-border))]">
            {filtered.map(brand => {
              const isArchived = brand.status === 'archived';
              const isBusy = deleting === brand.id || archiving === brand.id;
              const sc = schoolCount(brand);

              return (
                <div key={brand.id} className={`flex items-center gap-3.5 px-4 py-4 ${isArchived ? 'opacity-60' : ''}`}>
                  <BrandLogo url={brand.logo_url} name={brand.brand_name} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight truncate">
                        {brand.brand_name}
                      </p>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize flex-shrink-0 ${ST[brand.status] || ST.archived}`}>
                        {brand.status}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-[hsl(var(--admin-text-sub))] mt-0.5">
                      <span className="font-mono font-bold">{brand.brand_code}</span>
                      <span className="mx-1.5 text-[hsl(var(--admin-border))]">·</span>
                      {sc} {sc === 1 ? 'school' : 'schools'}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isBusy ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-[hsl(var(--admin-primary)/0.2)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Edit — always visible for managers */}
                        {canManage && (
                          <Link
                            href={`/tenant/${tenantSlug}/admin/brands/${brand.id}/edit`}
                            className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-[hsl(var(--admin-primary)/0.1)] active:scale-90 transition-all"
                          >
                            <span className="material-symbols-outlined text-[17px] text-[hsl(var(--admin-text-sub))]">edit</span>
                          </Link>
                        )}

                        {/* Archive — only for non-archived brands */}
                        {canManage && !isArchived && (
                          <button
                            type="button"
                            onClick={() => handleArchive(brand)}
                            className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-amber-50 active:scale-90 transition-all"
                            title="Archive brand"
                          >
                            <span className="material-symbols-outlined text-[17px] text-amber-500">inventory_2</span>
                          </button>
                        )}

                        {/* Restore — only for archived brands */}
                        {canManage && isArchived && (
                          <button
                            type="button"
                            onClick={() => handleRestore(brand)}
                            className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-green-50 active:scale-90 transition-all"
                            title="Restore brand"
                          >
                            <span className="material-symbols-outlined text-[17px] text-green-500">undo</span>
                          </button>
                        )}

                        {/* Delete — only super-admin, only for archived brands */}
                        {canDelete && isArchived && (
                          <button
                            type="button"
                            onClick={() => handleDelete(brand)}
                            disabled={deleting === brand.id}
                            className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-red-50 active:scale-90 transition-all disabled:opacity-50"
                            title="Delete brand permanently"
                          >
                            <span className="material-symbols-outlined text-[17px] text-red-400">delete</span>
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
    </div>
  );
}
