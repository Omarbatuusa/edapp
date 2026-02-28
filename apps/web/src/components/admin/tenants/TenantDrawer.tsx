'use client';

import { useState } from 'react';
import { X, Ban } from 'lucide-react';

interface Tenant {
  id: string; school_code: string; school_name: string;
  tenant_slug: string; status: string; brand_id: string;
}
interface Props { tenant: Tenant | null; readOnly: boolean; onClose: () => void; onSave: () => void; }

export default function TenantDrawer({ tenant, readOnly, onClose, onSave }: Props) {
  const isNew = !tenant;
  const [form, setForm] = useState({
    school_code: tenant?.school_code || '', school_name: tenant?.school_name || '',
    tenant_slug: tenant?.tenant_slug || '', status: tenant?.status || 'active', brand_id: tenant?.brand_id || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [disabling, setDisabling] = useState(false);
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true); setError('');
    try {
      const token = localStorage.getItem('session_token');
      const url = isNew ? '/v1/admin/tenants' : `/v1/admin/tenants/${tenant!.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); setError(err.message || 'Save failed'); }
      else { onSave(); }
    } catch (e: any) { setError(e.message || 'Save failed'); }
    setSaving(false);
  }

  async function handleDisable() {
    if (!tenant || !confirm(`Disable ${tenant.school_name}? This will prevent all logins.`)) return;
    setDisabling(true);
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/tenants/${tenant.id}/disable`, {
      method: 'PATCH', headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) onSave();
    setDisabling(false);
  }

  const statusStyle: Record<string, string> = {
    active: 'text-green-600 bg-green-100', paused: 'text-amber-600 bg-amber-100', archived: 'text-gray-500 bg-gray-100',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative ml-auto w-full sm:max-w-[430px] bg-[hsl(var(--admin-bg))] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--admin-border))]">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] active:scale-90 transition-transform flex-shrink-0">
            <X size={16} className="text-[hsl(var(--admin-text-sub))]" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold tracking-tight text-[hsl(var(--admin-text-main))] truncate">
              {isNew ? 'New Tenant' : readOnly ? tenant!.school_name : 'Edit Tenant'}
            </h2>
            {!isNew && <p className="text-[12px] font-mono font-semibold text-[hsl(var(--admin-text-muted))] mt-0.5">{tenant!.school_code}</p>}
          </div>
          {!readOnly && (
            <button onClick={handleSave} disabled={saving}
              className="h-9 px-5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-full active:scale-95 transition-all disabled:opacity-50 flex-shrink-0">
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-5 mt-4 bg-red-50 border border-red-100 rounded-[14px] px-4 py-3">
              <p className="text-[13px] text-red-600 font-medium">{error}</p>
            </div>
          )}

          {readOnly ? (
            <div className="px-5 py-4 space-y-1">
              <SL>School Details</SL>
              <div className="ios-card p-0 overflow-hidden divide-y divide-[hsl(var(--admin-border))]">
                <IR icon="domain" label="School Name" value={tenant?.school_name} />
                <IR icon="tag" label="School Code" value={tenant?.school_code} mono />
                <IR icon="link" label="URL Slug" value={tenant?.tenant_slug} mono />
                <div className="flex items-center gap-3 px-4 py-4">
                  <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">radio_button_checked</span>
                  <span className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))] flex-1">Status</span>
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full capitalize ${statusStyle[tenant?.status || ''] || statusStyle.archived}`}>{tenant?.status || '—'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-1">
              <SL>School Details</SL>
              <div className="ios-card p-0 overflow-hidden divide-y divide-[hsl(var(--admin-border))]">
                <FR label="School Name" icon="domain">
                  <input value={form.school_name} onChange={set('school_name')} placeholder="e.g. Lakewood Primary School"
                    className="flex-1 bg-transparent text-[15px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none text-right min-w-0" />
                </FR>
                <FR label="School Code" icon="tag">
                  <input value={form.school_code} onChange={set('school_code')} placeholder="e.g. LAK-001"
                    className="flex-1 bg-transparent text-[15px] font-mono text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none text-right min-w-0" />
                </FR>
                <FR label="URL Slug" icon="link">
                  <input value={form.tenant_slug} onChange={set('tenant_slug')} placeholder="e.g. lakewood"
                    className="flex-1 bg-transparent text-[15px] font-mono text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none text-right min-w-0" />
                </FR>
              </div>

              <SL>Status</SL>
              <div className="ios-card p-0 overflow-hidden">
                <FR label="Status" icon="radio_button_checked">
                  <select value={form.status} onChange={set('status')}
                    className="flex-1 bg-transparent text-[15px] text-[hsl(var(--admin-text-main))] outline-none text-right appearance-none cursor-pointer">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </FR>
              </div>

              {!isNew && (
                <>
                  <SL>Danger Zone</SL>
                  <div className="ios-card p-0 overflow-hidden">
                    <button onClick={handleDisable} disabled={disabling} className="w-full flex items-center gap-3 px-4 py-4 active:bg-red-50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Ban size={16} className="text-red-600" />
                      </div>
                      <span className="text-[15px] font-semibold text-red-600 flex-1 text-left">
                        {disabling ? 'Disabling…' : 'Disable Tenant'}
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-red-300">chevron_right</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SL({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] px-1 pt-4 pb-1.5">{children}</p>;
}
function FR({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))] flex-shrink-0">{icon}</span>
      <span className="text-[15px] font-medium text-[hsl(var(--admin-text-main))] flex-shrink-0 w-[100px]">{label}</span>
      {children}
    </div>
  );
}
function IR({ icon, label, value, mono }: { icon: string; label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))] flex-shrink-0">{icon}</span>
      <span className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))] flex-1">{label}</span>
      <span className={`text-[15px] font-semibold text-[hsl(var(--admin-text-main))] ${mono ? 'font-mono text-[13px]' : ''}`}>{value || '—'}</span>
    </div>
  );
}
