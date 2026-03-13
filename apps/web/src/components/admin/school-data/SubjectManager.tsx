'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Search, Loader2, X } from 'lucide-react';
import BulkImportDialog from '../inputs/BulkImportDialog';
import TemplateDownloadButton from '../inputs/TemplateDownloadButton';

interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  category?: string;
  type?: string;
  language_level?: string;
  is_platform_subject?: boolean;
  is_active?: boolean;
}

interface Props {
  tenantId: string;
  isPlatform?: boolean;
}

export default function SubjectManager({ tenantId, isPlatform }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject_code: '', subject_name: '', category: '', type: '', language_level: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  async function loadSubjects() {
    setLoading(true);
    try {
      const res = await fetch('/v1/admin/subjects', { headers });
      if (res.ok) setSubjects(await res.json());
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
    setLoading(false);
  }

  useEffect(() => { loadSubjects(); }, []);

  const filtered = useMemo(() => {
    let list = subjects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.subject_name.toLowerCase().includes(q) || s.subject_code.toLowerCase().includes(q));
    }
    if (filterCat) list = list.filter(s => s.category === filterCat);
    return list;
  }, [subjects, search, filterCat]);

  const categories = useMemo(() => {
    const cats = new Set(subjects.map(s => s.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [subjects]);

  async function handleSave() {
    if (!form.subject_code || !form.subject_name) { setError('Code and name are required'); return; }
    setSaving(true);
    setError('');

    const url = editId ? `/v1/admin/subjects/${editId}` : '/v1/admin/subjects';
    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify({ ...form, tenant_id: isPlatform ? null : tenantId }),
    });

    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ subject_code: '', subject_name: '', category: '', type: '', language_level: '' });
      loadSubjects();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to save');
    }
    setSaving(false);
  }

  function startEdit(s: Subject) {
    setEditId(s.id);
    setForm({
      subject_code: s.subject_code,
      subject_name: s.subject_name,
      category: s.category || '',
      type: s.type || '',
      language_level: s.language_level || '',
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">Subjects</h3>
          <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">{subjects.length} subjects</p>
        </div>
        <div className="flex items-center gap-2">
          <TemplateDownloadButton templateType="subject" label="Template" />
          <button type="button" onClick={() => setShowImport(true)}
            className="h-9 px-3 rounded-xl border border-[hsl(var(--admin-border))] text-[13px] font-medium text-[hsl(var(--admin-text-sub))]">
            Import
          </button>
          <button type="button"
            onClick={() => { setEditId(null); setForm({ subject_code: '', subject_name: '', category: '', type: '', language_level: '' }); setShowForm(true); }}
            className="h-9 px-3 flex items-center gap-1.5 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all">
            <Plus size={14} /> Add Subject
          </button>
        </div>
      </div>

      {/* Search / Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] flex-1 min-w-[200px]">
          <Search size={14} className="text-[hsl(var(--admin-text-muted))]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects..."
            className="flex-1 bg-transparent text-[13px] text-[hsl(var(--admin-text-main))] outline-none" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} aria-label="Filter by category"
          className="h-9 px-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))] text-[13px] text-[hsl(var(--admin-text-main))]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="ios-card p-4 space-y-3 border border-[hsl(var(--admin-primary)/0.2)]">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-[hsl(var(--admin-text-main))]">{editId ? 'Edit Subject' : 'New Subject'}</h4>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.subject_code} onChange={e => setForm(f => ({ ...f, subject_code: e.target.value }))} placeholder="Subject Code *"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
            <input value={form.subject_name} onChange={e => setForm(f => ({ ...f, subject_name: e.target.value }))} placeholder="Subject Name *"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} aria-label="Type"
              className="h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none">
              <option value="">Type (optional)</option>
              <option value="Academic">Academic</option>
              <option value="Practical">Practical</option>
              <option value="Vocational">Vocational</option>
              <option value="Sport">Sport</option>
              <option value="Cultural">Cultural</option>
            </select>
          </div>
          {error && <p className="text-[12px] text-red-600 font-medium">{error}</p>}
          <button type="button" onClick={handleSave} disabled={saving}
            className="h-9 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-lg active:scale-95 disabled:opacity-50 transition-all">
            {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
          </button>
        </div>
      )}

      {/* Subject list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[hsl(var(--admin-primary))]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-[14px] text-[hsl(var(--admin-text-muted))]">No subjects found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3">Code</th>
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3">Name</th>
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3 hidden sm:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3 hidden md:table-cell">Type</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="text-[12px] font-mono font-semibold px-2 py-0.5 rounded bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]">{s.subject_code}</span>
                  </td>
                  <td className="py-2.5 px-3 text-[13px] font-medium text-[hsl(var(--admin-text-main))]">{s.subject_name}</td>
                  <td className="py-2.5 px-3 text-[12px] text-[hsl(var(--admin-text-sub))] hidden sm:table-cell">{s.category || '—'}</td>
                  <td className="py-2.5 px-3 text-[12px] text-[hsl(var(--admin-text-sub))] hidden md:table-cell">{s.type || '—'}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button type="button" onClick={() => startEdit(s)} className="p-1 hover:bg-[hsl(var(--admin-primary)/0.1)] rounded-lg transition-colors" aria-label="Edit">
                      <Pencil size={13} className="text-[hsl(var(--admin-text-muted))]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showImport && (
        <BulkImportDialog importType="subject" tenantId={tenantId} templateType="subject" onComplete={loadSubjects} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
