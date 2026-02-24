'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight } from 'lucide-react';
import TenantDrawer from './TenantDrawer';

interface Tenant {
  id: string;
  school_code: string;
  school_name: string;
  tenant_slug: string;
  status: string;
  brand_id: string;
  created_at: string;
}

interface Props {
  slug: string;
  readOnly?: boolean;
}

export default function TenantsList({ slug, readOnly = false }: Props) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function fetchTenants() {
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
  }

  useEffect(() => { fetchTenants(); }, [search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={readOnly ? 'Search by school code...' : 'Search by name, code or slug...'}
            className="w-full pl-9 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {!readOnly && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        )}
        {!readOnly && (
          <button
            onClick={() => setShowCreate(true)}
            className="h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Tenant
          </button>
        )}
      </div>

      <div className="surface-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No tenants found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Code</span>
              <span>Name</span>
              <span>Status</span>
              <span></span>
            </div>
            {tenants.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTenant(t)}
                className="w-full grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-4 py-3 text-left hover:bg-muted/20 transition-colors items-center"
              >
                <span className="font-mono text-sm font-medium text-primary">{t.school_code}</span>
                <span className="text-sm font-medium truncate">{t.school_name}</span>
                <span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'active' ? 'bg-green-100 text-green-700' :
                    t.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{t.status}</span>
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTenant && (
        <TenantDrawer
          tenant={selectedTenant}
          readOnly={readOnly}
          onClose={() => setSelectedTenant(null)}
          onSave={() => { setSelectedTenant(null); fetchTenants(); }}
        />
      )}

      {showCreate && (
        <TenantDrawer
          tenant={null}
          readOnly={false}
          onClose={() => setShowCreate(false)}
          onSave={() => { setShowCreate(false); fetchTenants(); }}
        />
      )}
    </div>
  );
}
