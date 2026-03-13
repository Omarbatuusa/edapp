'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2, X } from 'lucide-react';
import BulkImportDialog from '../inputs/BulkImportDialog';
import TemplateDownloadButton from '../inputs/TemplateDownloadButton';

interface SchoolClass {
  id: string;
  section_name: string;
  class_code: string;
  grade_id: string;
  branch_id?: string;
  class_teacher_id?: string;
  is_active: boolean;
}

interface Props {
  tenantId: string;
}

export default function ClassManager({ tenantId }: Props) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ class_name: '', grade_code: '', branch_id: '', teacher_email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  async function loadClasses() {
    setLoading(true);
    try {
      const res = await fetch(`/v1/admin/tenants/${tenantId}/grades-classes/classes`, { headers });
      if (res.ok) setClasses(await res.json());
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
    setLoading(false);
  }

  useEffect(() => { loadClasses(); }, [tenantId]);

  async function handleSave() {
    if (!form.class_name || !form.grade_code) {
      setError('Class name and grade are required');
      return;
    }
    setSaving(true);
    setError('');

    const url = editId
      ? `/v1/admin/tenants/${tenantId}/grades-classes/classes/${editId}`
      : `/v1/admin/tenants/${tenantId}/grades-classes/classes`;

    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ class_name: '', grade_code: '', branch_id: '', teacher_email: '' });
      loadClasses();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to save');
    }
    setSaving(false);
  }

  function startEdit(cls: SchoolClass) {
    setEditId(cls.id);
    setForm({ class_name: cls.section_name, grade_code: cls.grade_id || '', branch_id: cls.branch_id || '', teacher_email: '' });
    setShowForm(true);
  }

  // Group classes by grade
  const grouped: Record<string, SchoolClass[]> = {};
  classes.forEach(c => {
    const key = c.grade_id || 'Ungraded';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">Classes</h3>
          <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">{classes.length} class{classes.length !== 1 ? 'es' : ''} configured</p>
        </div>
        <div className="flex items-center gap-2">
          <TemplateDownloadButton templateType="class" label="Template" />
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="h-9 px-3 rounded-xl border border-[hsl(var(--admin-border))] text-[13px] font-medium text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
          >
            Bulk Import
          </button>
          <button
            type="button"
            onClick={() => { setEditId(null); setForm({ class_name: '', grade_code: '', branch_id: '', teacher_email: '' }); setShowForm(true); }}
            className="h-9 px-3 flex items-center gap-1.5 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all"
          >
            <Plus size={14} /> Add Class
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="ios-card p-4 space-y-3 border border-[hsl(var(--admin-primary)/0.2)]">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-[hsl(var(--admin-text-main))]">{editId ? 'Edit Class' : 'New Class'}</h4>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1 block">Class Name *</label>
              <input
                value={form.class_name}
                onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))}
                placeholder="e.g. 10A"
                className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1 block">Grade Code *</label>
              <input
                value={form.grade_code}
                onChange={e => setForm(f => ({ ...f, grade_code: e.target.value }))}
                placeholder="e.g. GR10"
                className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]"
              />
            </div>
          </div>
          {error && <p className="text-[12px] text-red-600 font-medium">{error}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-lg active:scale-95 disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
          </button>
        </div>
      )}

      {/* Class list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[hsl(var(--admin-primary))]" />
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[14px] text-[hsl(var(--admin-text-muted))]">No classes yet. Add your first class above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort().map(([grade, cls]) => (
            <div key={grade}>
              <h4 className="text-[13px] font-bold text-[hsl(var(--admin-text-sub))] mb-2">{grade}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {cls.map(c => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${
                      c.is_active
                        ? 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]'
                        : 'border-red-200 bg-red-50 opacity-60'
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">{c.section_name}</p>
                      <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">{c.class_code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-[hsl(var(--admin-primary)/0.1)] transition-colors"
                      aria-label="Edit class"
                    >
                      <Pencil size={13} className="text-[hsl(var(--admin-text-muted))]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk import dialog */}
      {showImport && (
        <BulkImportDialog
          importType="class"
          tenantId={tenantId}
          templateType="class"
          onComplete={loadClasses}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
