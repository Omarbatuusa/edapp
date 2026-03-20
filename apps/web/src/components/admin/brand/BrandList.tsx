'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRole } from '@/contexts/RoleContext';

interface Brand {
  id: string; brand_name: string; brand_code: string;
  status: string; created_at: string;
  connected_school_count?: number;
  connected_tenant_count?: number;
  logo_url?: string | null;
}
interface BrandListProps { tenantSlug: string; }

const DELETE_ROLES = ['platform_super_admin', 'app_super_admin'];

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

const ST: Record<string, string> = {
  active: 'text-green-600 bg-green-100',
  paused: 'text-amber-600 bg-amber-100',
  archived: 'text-gray-500 bg-gray-100',
};

export function BrandList({ tenantSlug }: BrandListProps) {
  const { fullRole } = useRole();
  const canDelete = DELETE_ROLES.some(r => fullRole.includes(r));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const r = await fetch('/v1/admin/brands', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      const data = await r.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Always refetch from server on mount — prevents stale data after back-navigation
  useEffect(() => { loadBrands(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Delete "${brand.brand_name}"? This cannot be undone.`)) return;
    setDeleting(brand.id);
    try {
      const token = localStorage.getItem('session_token');
      const res = await fetch(`/v1/admin/brands/${brand.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || 'Failed to delete brand');
        // Refetch anyway — brand may have already been removed externally
        await loadBrands();
        return;
      }
      // Refetch from server so list is always authoritative
      await loadBrands();
    } catch {
      alert('Failed to delete brand');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = brands.filter(b =>
    b.brand_name.toLowerCase().includes(search.toLowerCase()) ||
    b.brand_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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

      {/* List */}
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
                {search ? 'No brands match your search' : 'No brands yet'}
              </p>
              {!search && (
                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))] mt-0.5">Create your first brand to get started</p>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--admin-border))]">
            {filtered.map(brand => (
              <div key={brand.id} className="flex items-center gap-3.5 px-4 py-4">
                <BrandLogo url={brand.logo_url} name={brand.brand_name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight truncate">{brand.brand_name}</p>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize flex-shrink-0 ${ST[brand.status] || ST.archived}`}>
                      {brand.status}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-[hsl(var(--admin-text-sub))] mt-0.5">
                    <span className="font-mono font-bold">{brand.brand_code}</span>
                    <span className="mx-1.5 text-[hsl(var(--admin-border))]">·</span>
                    {brand.connected_school_count ?? brand.connected_tenant_count ?? 0} {(brand.connected_school_count ?? brand.connected_tenant_count ?? 0) === 1 ? 'school' : 'schools'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    href={`/tenant/${tenantSlug}/admin/brands/${brand.id}/edit`}
                    className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-[hsl(var(--admin-primary)/0.1)] active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[hsl(var(--admin-text-sub))]">edit</span>
                  </Link>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(brand)}
                      disabled={deleting === brand.id}
                      className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center hover:bg-red-50 active:scale-90 transition-all disabled:opacity-50"
                    >
                      {deleting === brand.id ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[17px] text-red-400 hover:text-red-600">delete</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
