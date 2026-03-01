'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, GripVertical } from 'lucide-react';

interface DictGroup {
  group: string;
  items: { key: string; label: string; icon: string }[];
}

const DICT_GROUPS: DictGroup[] = [
  {
    group: 'School Structure',
    items: [
      { key: 'phases', label: 'Phases', icon: 'school' },
      { key: 'grades', label: 'Grades', icon: 'grade' },
      { key: 'class_genders', label: 'Class Genders', icon: 'wc' },
      { key: 'academic_year_structures', label: 'Academic Year Structure', icon: 'calendar_month' },
      { key: 'programme_types', label: 'Programme Type', icon: 'view_agenda' },
      { key: 'teaching_levels', label: 'Teaching Level', icon: 'stairs' },
    ],
  },
  {
    group: 'Subjects & Curriculum',
    items: [
      { key: 'subjects', label: 'Subjects', icon: 'auto_stories' },
      { key: 'compulsory_subjects', label: 'Compulsory Subjects', icon: 'rule' },
      { key: 'subject_categories', label: 'Subject Categories', icon: 'category' },
      { key: 'subject_types', label: 'Subject Types', icon: 'menu_book' },
      { key: 'subject_groups', label: 'Subject Groups', icon: 'workspaces' },
      { key: 'subject_language_levels', label: 'Subject Language Level', icon: 'translate' },
      { key: 'assessment_models', label: 'Assessment Models', icon: 'assignment' },
      { key: 'curriculum_names', label: 'Curriculum Name', icon: 'library_books' },
      { key: 'curriculum_authorities', label: 'Curriculum Authorities', icon: 'account_balance' },
      { key: 'exam_bodies', label: 'Examination Bodies', icon: 'quiz' },
    ],
  },
  {
    group: 'Languages',
    items: [
      { key: 'language_levels', label: 'Language Levels', icon: 'translate' },
      { key: 'languages_hl', label: 'Languages (HL)', icon: 'language' },
      { key: 'languages_fal', label: 'Languages (FAL)', icon: 'language' },
      { key: 'home_languages', label: 'Home Languages', icon: 'home' },
    ],
  },
  {
    group: 'Staff & Roles',
    items: [
      { key: 'teaching_leadership_staff', label: 'Teaching & Leadership', icon: 'supervisor_account' },
      { key: 'non_teaching_support_staff', label: 'Non-Teaching & Support', icon: 'support_agent' },
      { key: 'optional_admin_roles', label: 'Optional/Admin Roles', icon: 'admin_panel_settings' },
    ],
  },
  {
    group: 'Qualifications & Certification',
    items: [
      { key: 'certification_types', label: 'Certification Types', icon: 'verified' },
      { key: 'academic_documents', label: 'Academic Documents', icon: 'description' },
      { key: 'reqv_levels', label: 'REQV Levels', icon: 'bar_chart' },
      { key: 'qualification_pathways', label: 'Qualification Pathways', icon: 'route' },
      { key: 'cert_subject_providers', label: 'Certificate Providers', icon: 'workspace_premium' },
    ],
  },
  {
    group: 'Personal Details',
    items: [
      { key: 'salutations', label: 'Salutations', icon: 'badge' },
      { key: 'religions', label: 'Religions', icon: 'diversity_3' },
      { key: 'citizenship_types', label: 'Citizenship Types', icon: 'public' },
      { key: 'marital_statuses', label: 'Marital Status', icon: 'favorite' },
      { key: 'parent_rights', label: 'Parent Rights', icon: 'family_restroom' },
      { key: 'emergency_relationships', label: 'Emergency Relationships', icon: 'emergency' },
      { key: 'blood_types', label: 'Blood Types', icon: 'bloodtype' },
      { key: 'months', label: 'Months of the Year', icon: 'event' },
    ],
  },
  {
    group: 'Health & Support',
    items: [
      { key: 'medical_aid_providers', label: 'Medical Aid Providers', icon: 'local_hospital' },
      { key: 'medical_disabilities', label: 'Medical Disabilities', icon: 'accessible' },
      { key: 'school_allergies', label: 'School Allergies', icon: 'healing' },
      { key: 'psychological_issues', label: 'Psychological Issues', icon: 'psychology' },
      { key: 'educational_disabilities', label: 'Educational Disabilities', icon: 'accessibility_new' },
      { key: 'support_profiles', label: 'Support Profiles', icon: 'support' },
      { key: 'therapy_types', label: 'Therapy Types', icon: 'spa' },
    ],
  },
];

const DICTS = DICT_GROUPS.flatMap(g => g.items);

interface Entry {
  id: string; code: string; label: string; is_active: boolean;
  sort_order?: number; phase_code?: string;
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

  async function handleToggle(id: string, current: boolean) {
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/dict/${activeDict}/${id}/toggle`, {
      method: 'PATCH', headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) setEntries(e => e.map(x => x.id === id ? { ...x, is_active: !current } : x));
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

  const active = DICTS.find(d => d.key === activeDict) || DICTS[0];

  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-6 min-h-[400px]">

      {/* Mobile: horizontal pill tabs */}
      <div className="md:hidden -mx-1 mb-4">
        <div className="flex gap-2 px-1 overflow-x-auto no-scrollbar pb-1">
          {DICTS.map(d => (
            <button type="button" key={d.key} onClick={() => setActiveDict(d.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0 active:scale-95 transition-all ${
                activeDict === d.key
                  ? 'bg-[hsl(var(--admin-primary))] text-white shadow-sm'
                  : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] border border-[hsl(var(--admin-border))]'
              }`}>
              <span className="material-symbols-outlined text-[15px]">{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: sidebar with groups */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0 max-h-[calc(100vh-180px)] overflow-y-auto">
        <div className="ios-card p-1.5 space-y-2">
          {DICT_GROUPS.map(group => (
            <div key={group.group}>
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map(d => (
                  <button type="button" key={d.key} onClick={() => setActiveDict(d.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-semibold text-left transition-all ${
                      activeDict === d.key
                        ? 'bg-[hsl(var(--admin-primary))] text-white'
                        : 'text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))]'
                    }`}>
                    <span className="material-symbols-outlined text-[16px] flex-shrink-0">{d.icon}</span>
                    <span className="truncate">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))]">{active.icon}</span>
            <h3 className="text-[17px] font-bold tracking-tight text-[hsl(var(--admin-text-main))]">{active.label}</h3>
            {!loading && (
              <span className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface-alt))] px-2 py-0.5 rounded-full">
                {entries.length}
              </span>
            )}
          </div>
          <button type="button"
            onClick={() => { setAddMode(a => !a); setEditingId(null); }}
            className={`h-9 px-3.5 text-[13px] font-bold rounded-full flex items-center gap-1.5 active:scale-95 transition-all ${
              addMode
                ? 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] border border-[hsl(var(--admin-border))]'
                : 'bg-[hsl(var(--admin-primary))] text-white'
            }`}>
            <Plus size={14} className={addMode ? 'rotate-45 transition-transform' : 'transition-transform'} />
            {addMode ? 'Cancel' : 'Add Entry'}
          </button>
        </div>

        {/* Add form */}
        {addMode && (
          <div className="ios-card border-2 border-[hsl(var(--admin-primary)/0.3)] p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-primary)/0.06)]">
              <p className="text-[12px] font-bold text-[hsl(var(--admin-primary))] uppercase tracking-wider">New {active.label} Entry</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1.5 block">Code</label>
                  <input
                    value={newEntry.code}
                    onChange={e => setNewEntry(n => ({ ...n, code: e.target.value }))}
                    placeholder="e.g. FOUNDATION"
                    className="w-full h-10 px-3 bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] rounded-xl text-[14px] font-mono text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none focus:border-[hsl(var(--admin-primary))] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1.5 block">Label</label>
                  <input
                    value={newEntry.label}
                    onChange={e => setNewEntry(n => ({ ...n, label: e.target.value }))}
                    placeholder="e.g. Foundation Phase"
                    className="w-full h-10 px-3 bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] rounded-xl text-[14px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none focus:border-[hsl(var(--admin-primary))] transition-all"
                  />
                </div>
              </div>
              <button type="button" onClick={handleAdd} disabled={saving || !newEntry.code || !newEntry.label}
                className="w-full h-10 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-40">
                {saving ? 'Saving…' : `Add to ${active.label}`}
              </button>
            </div>
          </div>
        )}

        {/* Entries list */}
        <div className="ios-card p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-[hsl(var(--admin-primary)/0.25)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
              <p className="text-[14px] font-medium text-[hsl(var(--admin-text-muted))]">Loading…</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[40px] text-[hsl(var(--admin-text-muted))] opacity-25">{active.icon}</span>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-sub))]">No entries yet</p>
                <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-0.5">Add your first {active.label.toLowerCase()} entry above</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--admin-border))]">
              {entries.map(entry => (
                <div key={entry.id} className={`flex items-center gap-2.5 px-4 py-3.5 transition-colors ${!entry.is_active ? 'opacity-45' : ''}`}>
                  <GripVertical size={14} className="text-[hsl(var(--admin-text-muted))] opacity-30 cursor-grab flex-shrink-0 hidden sm:block" />

                  {editingId === entry.id ? (
                    <>
                      <input title="Code" value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))}
                        className="h-9 px-3 bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-primary)/0.4)] rounded-xl text-[13px] font-mono w-28 sm:w-32 outline-none text-[hsl(var(--admin-text-main))]" />
                      <input title="Label" value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                        className="h-9 px-3 bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-primary)/0.4)] rounded-xl text-[13px] flex-1 outline-none text-[hsl(var(--admin-text-main))]" />
                      <button type="button" title="Save" onClick={() => handleSaveEdit(entry.id)} disabled={saving}
                        className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
                        <Check size={15} className="text-green-600" />
                      </button>
                      <button type="button" title="Cancel" onClick={() => setEditingId(null)}
                        className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
                        <X size={15} className="text-[hsl(var(--admin-text-sub))]" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-[11px] font-bold text-[hsl(var(--admin-primary))] flex-shrink-0 bg-[hsl(var(--admin-primary)/0.09)] px-2 py-0.5 rounded-md w-24 sm:w-32 truncate">
                        {entry.code}
                      </span>
                      <span className="text-[14px] font-medium text-[hsl(var(--admin-text-main))] flex-1 truncate">{entry.label}</span>
                      {entry.phase_code && (
                        <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full hidden sm:inline flex-shrink-0">{entry.phase_code}</span>
                      )}
                      <button type="button" title="Edit entry"
                        onClick={() => { setEditingId(entry.id); setEditForm({ code: entry.code, label: entry.label }); }}
                        className="w-9 h-9 rounded-full hover:bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center active:scale-90 transition-all flex-shrink-0">
                        <Edit2 size={13} className="text-[hsl(var(--admin-text-muted))]" />
                      </button>
                      {/* iOS toggle switch */}
                      <button type="button" onClick={() => handleToggle(entry.id, entry.is_active)} className="flex-shrink-0" aria-label="Toggle active">
                        <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${entry.is_active ? 'bg-[hsl(var(--admin-primary))]' : 'bg-[hsl(var(--admin-border))]'}`}>
                          <div className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-200 ${entry.is_active ? 'left-[calc(100%-21px)]' : 'left-[3px]'}`} />
                        </div>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
