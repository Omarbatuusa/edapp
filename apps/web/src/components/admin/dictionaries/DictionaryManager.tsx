'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';

const DICTS = [
  { key: 'phases', label: 'Phases' },
  { key: 'grades', label: 'Grades' },
  { key: 'class_genders', label: 'Class Genders' },
  { key: 'subject_categories', label: 'Subject Categories' },
  { key: 'subject_types', label: 'Subject Types' },
  { key: 'language_levels', label: 'Language Levels' },
  { key: 'languages_hl', label: 'Languages (HL)' },
  { key: 'languages_fal', label: 'Languages (FAL)' },
  { key: 'salutations', label: 'Salutations' },
  { key: 'religions', label: 'Religions' },
];

interface Entry {
  id: string;
  code: string;
  label: string;
  is_active: boolean;
  sort_order?: number;
  phase_code?: string;
}

export default function DictionaryManager() {
  const [activeDict, setActiveDict] = useState('phases');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ code: '', label: '' });
  const [addMode, setAddMode] = useState(false);
  const [newEntry, setNewEntry] = useState({ code: '', label: '' });
  const [saving, setSaving] = useState(false);

  async function fetchEntries() {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const res = await fetch(`/v1/admin/dict/${activeDict}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setEntries(await res.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchEntries(); setAddMode(false); setEditingId(null); }, [activeDict]);

  async function handleToggle(id: string) {
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/dict/${activeDict}/${id}/toggle`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) fetchEntries();
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/dict/${activeDict}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { setEditingId(null); fetchEntries(); }
    setSaving(false);
  }

  async function handleAdd() {
    if (!newEntry.code || !newEntry.label) return;
    setSaving(true);
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/dict/${activeDict}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(newEntry),
    });
    if (res.ok) { setAddMode(false); setNewEntry({ code: '', label: '' }); fetchEntries(); }
    setSaving(false);
  }

  return (
    <div className="flex gap-0 h-full">
      {/* Sidebar tabs */}
      <div className="w-48 flex-shrink-0 border-r border-border pr-0">
        <div className="space-y-0.5">
          {DICTS.map(d => (
            <button
              key={d.key}
              onClick={() => setActiveDict(d.key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${activeDict === d.key ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-foreground'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pl-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{DICTS.find(d => d.key === activeDict)?.label}</h3>
          <button onClick={() => { setAddMode(true); setEditingId(null); }} className="h-8 px-3 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Add Entry
          </button>
        </div>

        {addMode && (
          <div className="surface-card p-4 border-2 border-primary/20 space-y-3">
            <p className="text-sm font-medium">New Entry</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={newEntry.code} onChange={e => setNewEntry(n => ({ ...n, code: e.target.value }))} placeholder="Code (e.g. FOUNDATION)" className="input-field text-sm" />
              <input value={newEntry.label} onChange={e => setNewEntry(n => ({ ...n, label: e.target.value }))} placeholder="Label (e.g. Foundation Phase)" className="input-field text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving} className="h-8 px-3 bg-primary text-primary-foreground text-xs rounded-lg">Save</button>
              <button onClick={() => setAddMode(false)} className="h-8 px-3 border border-border text-xs rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        <div className="surface-card overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <GripVertical size={14} className="text-muted-foreground/40 cursor-grab flex-shrink-0" />

                  {editingId === entry.id ? (
                    <>
                      <input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} className="input-field text-sm w-32" />
                      <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))} className="input-field text-sm flex-1" />
                      <button onClick={() => handleSaveEdit(entry.id)} disabled={saving} className="p-1.5 rounded hover:bg-green-100 text-green-600"><Check size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-muted"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-xs text-muted-foreground w-32 flex-shrink-0">{entry.code}</span>
                      <span className={`text-sm flex-1 ${!entry.is_active ? 'line-through text-muted-foreground' : ''}`}>{entry.label}</span>
                      {entry.phase_code && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{entry.phase_code}</span>}
                      <button onClick={() => { setEditingId(entry.id); setEditForm({ code: entry.code, label: entry.label }); }} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Edit2 size={13} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => handleToggle(entry.id)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        {entry.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} className="text-gray-400" />}
                      </button>
                    </>
                  )}
                </div>
              ))}
              {entries.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">No entries yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
