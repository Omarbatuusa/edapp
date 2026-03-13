'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Subject { id: string; subject_code: string; subject_name: string }
interface Stream { id: string; stream_code: string; stream_name: string }
interface Offering {
  id: string;
  subject_id: string;
  grade_code: string;
  stream_id?: string;
  offering_role: string;
  is_compulsory: boolean;
  periods_per_week?: number;
  subject?: Subject;
}

interface Props {
  tenantId: string;
}

export default function SubjectOfferingManager({ tenantId }: Props) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject_id: '', grade_code: '', stream_id: '', offering_role: 'COMPULSORY', periods_per_week: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  async function loadAll() {
    setLoading(true);
    try {
      const [oRes, sRes, stRes] = await Promise.all([
        fetch(`/v1/admin/subjects/offerings/${tenantId}`, { headers }),
        fetch('/v1/admin/subjects', { headers }),
        fetch(`/v1/admin/subjects/streams/${tenantId}`, { headers }),
      ]);
      if (oRes.ok) setOfferings(await oRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
      if (stRes.ok) setStreams(await stRes.json());
    } catch (err) {
      console.error('Load failed:', err);
    }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [tenantId]);

  async function handleSave() {
    if (!form.subject_id || !form.grade_code) { setError('Subject and grade are required'); return; }
    setSaving(true);
    setError('');

    const res = await fetch(`/v1/admin/subjects/offerings/${tenantId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...form,
        stream_id: form.stream_id || null,
        is_compulsory: form.offering_role === 'COMPULSORY',
        periods_per_week: form.periods_per_week ? parseInt(form.periods_per_week, 10) : null,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({ subject_id: '', grade_code: '', stream_id: '', offering_role: 'COMPULSORY', periods_per_week: '' });
      loadAll();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to save');
    }
    setSaving(false);
  }

  const filtered = filterGrade ? offerings.filter(o => o.grade_code === filterGrade) : offerings;
  const grades = Array.from(new Set(offerings.map(o => o.grade_code))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">Subject Offerings</h3>
          <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">What subjects are offered per grade</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} aria-label="Filter grade"
            className="h-9 px-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))] text-[13px]">
            <option value="">All Grades</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <button type="button" onClick={() => setShowForm(true)}
            className="h-9 px-3 flex items-center gap-1.5 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all">
            <Plus size={14} /> Add Offering
          </button>
        </div>
      </div>

      {showForm && (
        <div className="ios-card p-4 space-y-3 border border-[hsl(var(--admin-primary)/0.2)]">
          <h4 className="text-[13px] font-bold text-[hsl(var(--admin-text-main))]">New Offering</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} aria-label="Subject"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))]">
              <option value="">Select Subject *</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>)}
            </select>
            <input value={form.grade_code} onChange={e => setForm(f => ({ ...f, grade_code: e.target.value }))} placeholder="Grade Code * (e.g. GR10)"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
            <select value={form.stream_id} onChange={e => setForm(f => ({ ...f, stream_id: e.target.value }))} aria-label="Stream"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))]">
              <option value="">No Stream</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.stream_name}</option>)}
            </select>
            <select value={form.offering_role} onChange={e => setForm(f => ({ ...f, offering_role: e.target.value }))} aria-label="Offering role"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))]">
              <option value="COMPULSORY">Compulsory</option>
              <option value="ELECTIVE">Elective</option>
              <option value="ADDITIONAL">Additional</option>
              <option value="ENRICHMENT">Enrichment</option>
            </select>
            <input value={form.periods_per_week} onChange={e => setForm(f => ({ ...f, periods_per_week: e.target.value }))} placeholder="Periods/week (optional)" type="number"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none" />
          </div>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={saving}
              className="h-9 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-lg active:scale-95 disabled:opacity-50 transition-all">
              {saving ? 'Saving...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="h-9 px-3 text-[13px] text-[hsl(var(--admin-text-sub))]">Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-[14px] text-[hsl(var(--admin-text-muted))]">No offerings configured yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3">Subject</th>
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3">Grade</th>
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3 hidden sm:table-cell">Role</th>
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3 hidden md:table-cell">Periods</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                  <td className="py-2 px-3 text-[13px] font-medium text-[hsl(var(--admin-text-main))]">
                    {o.subject?.subject_name || o.subject_id}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[12px] font-mono px-2 py-0.5 rounded bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]">{o.grade_code}</span>
                  </td>
                  <td className="py-2 px-3 text-[12px] text-[hsl(var(--admin-text-sub))] hidden sm:table-cell">{o.offering_role}</td>
                  <td className="py-2 px-3 text-[12px] text-[hsl(var(--admin-text-sub))] hidden md:table-cell">{o.periods_per_week || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
