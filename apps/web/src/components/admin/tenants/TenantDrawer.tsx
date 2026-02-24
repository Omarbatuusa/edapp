'use client';

import { useState } from 'react';
import { X, Save, Ban } from 'lucide-react';

interface Tenant {
  id: string;
  school_code: string;
  school_name: string;
  tenant_slug: string;
  status: string;
  brand_id: string;
}

interface Props {
  tenant: Tenant | null;
  readOnly: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function TenantDrawer({ tenant, readOnly, onClose, onSave }: Props) {
  const isNew = !tenant;
  const [form, setForm] = useState({
    school_code: tenant?.school_code || '',
    school_name: tenant?.school_name || '',
    tenant_slug: tenant?.tenant_slug || '',
    status: tenant?.status || 'active',
    brand_id: tenant?.brand_id || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [disabling, setDisabling] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('session_token');
      const url = isNew ? '/v1/admin/tenants' : `/v1/admin/tenants/${tenant!.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Save failed');
      } else {
        onSave();
      }
    } catch (e: any) {
      setError(e.message || 'Save failed');
    }
    setSaving(false);
  }

  async function handleDisable() {
    if (!tenant || !confirm(`Disable ${tenant.school_name}? This will prevent all logins.`)) return;
    setDisabling(true);
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/tenants/${tenant.id}/disable`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) onSave();
    setDisabling(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-background border-l border-border flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{isNew ? 'New Tenant' : tenant!.school_name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {readOnly ? (
            <div className="space-y-3">
              <InfoRow label="School Code" value={tenant?.school_code} />
              <InfoRow label="School Name" value={tenant?.school_name} />
              <InfoRow label="Slug" value={tenant?.tenant_slug} />
              <InfoRow label="Status" value={tenant?.status} />
            </div>
          ) : (
            <>
              <Field label="School Code" required>
                <input value={form.school_code} onChange={e => setForm(f => ({ ...f, school_code: e.target.value }))} placeholder="e.g. LAK-001" className="input-field" />
              </Field>
              <Field label="School Name" required>
                <input value={form.school_name} onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))} placeholder="e.g. Lakewood Primary School" className="input-field" />
              </Field>
              <Field label="Tenant Slug" required>
                <input value={form.tenant_slug} onChange={e => setForm(f => ({ ...f, tenant_slug: e.target.value }))} placeholder="e.g. lakewood" className="input-field" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </Field>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </>
          )}
        </div>

        {!readOnly && (
          <div className="flex gap-3 px-6 py-4 border-t border-border">
            {!isNew && (
              <button onClick={handleDisable} disabled={disabling} className="h-10 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2">
                <Ban size={14} /> Disable
              </button>
            )}
            <div className="flex-1" />
            <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
