'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2, X } from 'lucide-react';

interface Stream {
  id: string;
  stream_code: string;
  stream_name: string;
  description?: string;
}

interface Props {
  tenantId: string;
}

export default function SubjectStreamManager({ tenantId }: Props) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ stream_code: '', stream_name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  async function loadStreams() {
    setLoading(true);
    try {
      const res = await fetch(`/v1/admin/subjects/streams/${tenantId}`, { headers });
      if (res.ok) setStreams(await res.json());
    } catch (err) {
      console.error('Failed to load streams:', err);
    }
    setLoading(false);
  }

  useEffect(() => { loadStreams(); }, [tenantId]);

  async function handleSave() {
    if (!form.stream_code || !form.stream_name) { setError('Code and name are required'); return; }
    setSaving(true);
    setError('');

    const url = editId
      ? `/v1/admin/subjects/streams/${tenantId}/${editId}`
      : `/v1/admin/subjects/streams/${tenantId}`;

    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ stream_code: '', stream_name: '', description: '' });
      loadStreams();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to save');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">Subject Streams</h3>
          <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">e.g. Sciences, Commerce, Humanities</p>
        </div>
        <button type="button"
          onClick={() => { setEditId(null); setForm({ stream_code: '', stream_name: '', description: '' }); setShowForm(true); }}
          className="h-9 px-3 flex items-center gap-1.5 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all">
          <Plus size={14} /> Add Stream
        </button>
      </div>

      {showForm && (
        <div className="ios-card p-4 space-y-3 border border-[hsl(var(--admin-primary)/0.2)]">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold">{editId ? 'Edit Stream' : 'New Stream'}</h4>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.stream_code} onChange={e => setForm(f => ({ ...f, stream_code: e.target.value }))} placeholder="Stream Code *"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
            <input value={form.stream_name} onChange={e => setForm(f => ({ ...f, stream_name: e.target.value }))} placeholder="Stream Name *"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
          </div>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)"
            className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button type="button" onClick={handleSave} disabled={saving}
            className="h-9 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-lg active:scale-95 disabled:opacity-50 transition-all">
            {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[hsl(var(--admin-primary))]" />
        </div>
      ) : streams.length === 0 ? (
        <p className="text-center py-8 text-[14px] text-[hsl(var(--admin-text-muted))]">No streams defined yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {streams.map(s => (
            <div key={s.id} className="flex items-start justify-between p-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
              <div>
                <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">{s.stream_name}</p>
                <p className="text-[11px] font-mono text-[hsl(var(--admin-text-muted))]">{s.stream_code}</p>
                {s.description && <p className="text-[11px] text-[hsl(var(--admin-text-sub))] mt-1">{s.description}</p>}
              </div>
              <button type="button"
                onClick={() => { setEditId(s.id); setForm({ stream_code: s.stream_code, stream_name: s.stream_name, description: s.description || '' }); setShowForm(true); }}
                className="p-1 hover:bg-[hsl(var(--admin-primary)/0.1)] rounded-lg" aria-label="Edit">
                <Pencil size={13} className="text-[hsl(var(--admin-text-muted))]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
