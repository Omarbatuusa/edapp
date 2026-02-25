'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';

const DICTS = [
  { key: 'phases', label: 'Phases', icon: 'school' },
  { key: 'grades', label: 'Grades', icon: 'grade' },
  { key: 'class_genders', label: 'Class Genders', icon: 'wc' },
  { key: 'subject_categories', label: 'Subject Categories', icon: 'category' },
  { key: 'subject_types', label: 'Subject Types', icon: 'menu_book' },
  { key: 'language_levels', label: 'Language Levels', icon: 'translate' },
  { key: 'languages_hl', label: 'Languages (HL)', icon: 'language' },
  { key: 'languages_fal', label: 'Languages (FAL)', icon: 'language' },
  { key: 'salutations', label: 'Salutations', icon: 'badge' },
  { key: 'religions', label: 'Religions', icon: 'church' },
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
    } catch { }
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

  const activeLabel = DICTS.find(d => d.key === activeDict)?.label || '';

  return (
    <div className="flex flex-col md:flex-row gap-0 min-h-[400px]">
      {/* Mobile: Horizontal scrollable pills */}
      <div className="md:hidden overflow-x-auto no-scrollbar border-b border-border pb-3 mb-4 -mx-1">
        <div className="flex gap-2 px-1 min-w-max">
          {DICTS.map(d => (
            <button
              key={d.key}
              onClick={() => setActiveDict(d.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeDict === d.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
                }`}
            >
              <span className="material-symbols-outlined text-sm">{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Sidebar tabs */}
      <div className="hidden md:block w-48 flex-shrink-0 border-r border-border pr-0">
        <div className="space-y-0.5">
          {DICTS.map(d => (
            <button
              key={d.key}
              onClick={() => setActiveDict(d.key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeDict === d.key
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-muted text-foreground'
                }`}
            >
              <span className="material-symbols-outlined text-base">{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 md:pl-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{activeLabel}</h3>
          <button
            onClick={() => { setAddMode(true); setEditingId(null); }}
            className="h-8 px-3 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Entry
          </button>
        </div>

        {addMode && (
          <div className="surface-card p-4 border-2 border-primary/20 space-y-3">
            <p className="text-sm font-medium">New Entry</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={newEntry.code}
                onChange={e => setNewEntry(n => ({ ...n, code: e.target.value }))}
                placeholder="Code (e.g. FOUNDATION)"
                className="h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                value={newEntry.label}
                onChange={e => setNewEntry(n => ({ ...n, label: e.target.value }))}
                placeholder="Label (e.g. Foundation Phase)"
                className="h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving} className="h-8 px-3 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 transition-colors">Save</button>
              <button onClick={() => setAddMode(false)} className="h-8 px-3 border border-border text-xs rounded-lg hover:bg-muted transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="surface-card overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <div className="w-6 h-6 mx-auto mb-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading entries...
            </div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-muted/20 transition-colors">
                  <GripVertical size={14} className="text-muted-foreground/40 cursor-grab flex-shrink-0 hidden sm:block" />

                  {editingId === entry.id ? (
                    <>
                      <input
                        value={editForm.code}
                        onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))}
                        className="h-8 px-2 border border-input rounded text-sm w-24 sm:w-32 bg-background"
                      />
                      <input
                        value={editForm.label}
                        onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                        className="h-8 px-2 border border-input rounded text-sm flex-1 bg-background"
                      />
                      <button onClick={() => handleSaveEdit(entry.id)} disabled={saving} className="p-1.5 rounded hover:bg-green-100 text-green-600">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-muted">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-xs text-muted-foreground w-20 sm:w-32 flex-shrink-0 truncate">{entry.code}</span>
                      <span className={`text-sm flex-1 truncate ${!entry.is_active ? 'line-through text-muted-foreground' : ''}`}>{entry.label}</span>
                      {entry.phase_code && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded hidden sm:inline">{entry.phase_code}</span>}
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
              {entries.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">menu_book</span>
                  <p className="text-sm">No entries yet</p>
                  <p className="text-xs mt-1">Add your first entry above</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
