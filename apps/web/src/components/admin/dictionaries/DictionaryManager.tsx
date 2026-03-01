'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Check, X, GripVertical, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface DictGroup {
  group: string;
  items: DictItem[];
}

interface DictItem {
  key: string;
  label: string;
  icon: string;
  codePlaceholder: string;
  labelPlaceholder: string;
}

const DICT_GROUPS: DictGroup[] = [
  {
    group: 'School Structure',
    items: [
      { key: 'phases', label: 'Phases', icon: 'school', codePlaceholder: 'FOUNDATION', labelPlaceholder: 'Foundation Phase (Gr R-3)' },
      { key: 'grades', label: 'Grades', icon: 'grade', codePlaceholder: 'GR_1', labelPlaceholder: 'Grade 1' },
      { key: 'class_genders', label: 'Class Genders', icon: 'wc', codePlaceholder: 'MIXED', labelPlaceholder: 'Mixed' },
      { key: 'academic_year_structures', label: 'Academic Year Structure', icon: 'calendar_month', codePlaceholder: 'TERM_4', labelPlaceholder: '4 Terms' },
      { key: 'programme_types', label: 'Programme Type', icon: 'view_agenda', codePlaceholder: 'ACADEMIC', labelPlaceholder: 'Academic' },
      { key: 'teaching_levels', label: 'Teaching Level', icon: 'stairs', codePlaceholder: 'PRIMARY', labelPlaceholder: 'Primary School' },
    ],
  },
  {
    group: 'Subjects & Curriculum',
    items: [
      { key: 'subjects', label: 'Subjects', icon: 'auto_stories', codePlaceholder: 'MATH', labelPlaceholder: 'Mathematics' },
      { key: 'compulsory_subjects', label: 'Compulsory Subjects', icon: 'rule', codePlaceholder: 'HOME_LANG', labelPlaceholder: 'Home Language' },
      { key: 'subject_categories', label: 'Subject Categories', icon: 'category', codePlaceholder: 'SCIENCES', labelPlaceholder: 'Natural Sciences' },
      { key: 'subject_types', label: 'Subject Types', icon: 'menu_book', codePlaceholder: 'CORE', labelPlaceholder: 'Core Subject' },
      { key: 'subject_groups', label: 'Subject Groups', icon: 'workspaces', codePlaceholder: 'GROUP_A', labelPlaceholder: 'Group A — Languages' },
      { key: 'subject_language_levels', label: 'Subject Language Level', icon: 'translate', codePlaceholder: 'HL', labelPlaceholder: 'Home Language' },
      { key: 'assessment_models', label: 'Assessment Models', icon: 'assignment', codePlaceholder: 'SBA', labelPlaceholder: 'School-Based Assessment' },
      { key: 'curriculum_names', label: 'Curriculum Name', icon: 'library_books', codePlaceholder: 'CAPS', labelPlaceholder: 'CAPS' },
      { key: 'curriculum_authorities', label: 'Curriculum Authorities', icon: 'account_balance', codePlaceholder: 'DBE', labelPlaceholder: 'Department of Basic Education' },
      { key: 'exam_bodies', label: 'Examination Bodies', icon: 'quiz', codePlaceholder: 'IEB', labelPlaceholder: 'Independent Examinations Board' },
    ],
  },
  {
    group: 'Languages',
    items: [
      { key: 'language_levels', label: 'Language Levels', icon: 'translate', codePlaceholder: 'HL', labelPlaceholder: 'Home Language' },
      { key: 'languages_hl', label: 'Languages (HL)', icon: 'language', codePlaceholder: 'ENG', labelPlaceholder: 'English' },
      { key: 'languages_fal', label: 'Languages (FAL)', icon: 'language', codePlaceholder: 'AFR', labelPlaceholder: 'Afrikaans' },
      { key: 'home_languages', label: 'Home Languages', icon: 'home', codePlaceholder: 'ZUL', labelPlaceholder: 'isiZulu' },
    ],
  },
  {
    group: 'Staff & Roles',
    items: [
      { key: 'teaching_leadership_staff', label: 'Teaching & Leadership', icon: 'supervisor_account', codePlaceholder: 'HOD', labelPlaceholder: 'Head of Department' },
      { key: 'non_teaching_support_staff', label: 'Non-Teaching & Support', icon: 'support_agent', codePlaceholder: 'ADMIN_CLERK', labelPlaceholder: 'Administrative Clerk' },
      { key: 'optional_admin_roles', label: 'Optional/Admin Roles', icon: 'admin_panel_settings', codePlaceholder: 'EXAM_OFFICER', labelPlaceholder: 'Exam Officer' },
    ],
  },
  {
    group: 'Qualifications & Certification',
    items: [
      { key: 'certification_types', label: 'Certification Types', icon: 'verified', codePlaceholder: 'BED', labelPlaceholder: 'B.Ed' },
      { key: 'academic_documents', label: 'Academic Documents', icon: 'description', codePlaceholder: 'DEGREE_CERT', labelPlaceholder: 'Degree Certificate' },
      { key: 'reqv_levels', label: 'REQV Levels', icon: 'bar_chart', codePlaceholder: 'REQV_14', labelPlaceholder: 'REQV 14 (B.Ed / 4-year degree)' },
      { key: 'qualification_pathways', label: 'Qualification Pathways', icon: 'route', codePlaceholder: 'NSC', labelPlaceholder: 'National Senior Certificate' },
      { key: 'cert_subject_providers', label: 'Certificate Providers', icon: 'workspace_premium', codePlaceholder: 'CAMBRIDGE', labelPlaceholder: 'Cambridge International' },
    ],
  },
  {
    group: 'Personal Details',
    items: [
      { key: 'salutations', label: 'Salutations', icon: 'badge', codePlaceholder: 'MR', labelPlaceholder: 'Mr' },
      { key: 'religions', label: 'Religions', icon: 'diversity_3', codePlaceholder: 'ISLAM', labelPlaceholder: 'Islam' },
      { key: 'citizenship_types', label: 'Citizenship Types', icon: 'public', codePlaceholder: 'SA_CITIZEN', labelPlaceholder: 'South African Citizen' },
      { key: 'marital_statuses', label: 'Marital Status', icon: 'favorite', codePlaceholder: 'MARRIED', labelPlaceholder: 'Married' },
      { key: 'parent_rights', label: 'Parent Rights', icon: 'family_restroom', codePlaceholder: 'FULL_CUSTODY', labelPlaceholder: 'Full Custody' },
      { key: 'emergency_relationships', label: 'Emergency Relationships', icon: 'emergency', codePlaceholder: 'MOTHER', labelPlaceholder: 'Mother' },
      { key: 'blood_types', label: 'Blood Types', icon: 'bloodtype', codePlaceholder: 'O_POS', labelPlaceholder: 'O+' },
      { key: 'months', label: 'Months of the Year', icon: 'event', codePlaceholder: 'JAN', labelPlaceholder: 'January' },
    ],
  },
  {
    group: 'Health & Support',
    items: [
      { key: 'medical_aid_providers', label: 'Medical Aid Providers', icon: 'local_hospital', codePlaceholder: 'DISCOVERY', labelPlaceholder: 'Discovery Health' },
      { key: 'medical_disabilities', label: 'Medical Disabilities', icon: 'accessible', codePlaceholder: 'VISUAL', labelPlaceholder: 'Visual Impairment' },
      { key: 'school_allergies', label: 'School Allergies', icon: 'healing', codePlaceholder: 'PEANUTS', labelPlaceholder: 'Peanuts / Tree Nuts' },
      { key: 'psychological_issues', label: 'Psychological Issues', icon: 'psychology', codePlaceholder: 'ANXIETY', labelPlaceholder: 'Anxiety Disorder' },
      { key: 'educational_disabilities', label: 'Educational Disabilities', icon: 'accessibility_new', codePlaceholder: 'ADHD', labelPlaceholder: 'ADHD' },
      { key: 'support_profiles', label: 'Support Profiles', icon: 'support', codePlaceholder: 'MODERATE', labelPlaceholder: 'Moderate Support Needs' },
      { key: 'therapy_types', label: 'Therapy Types', icon: 'spa', codePlaceholder: 'SPEECH', labelPlaceholder: 'Speech Therapy' },
    ],
  },
];

const DICTS = DICT_GROUPS.flatMap(g => g.items);

interface Entry {
  id: string; code: string; label: string; is_active: boolean;
  sort_order?: number; phase_code?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('session_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch(`/v1/admin/dict/${activeDict}`, { headers: getAuthHeaders() });
      if (res.ok) setEntries(await res.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    fetchEntries();
    setAddMode(false);
    setUploadMode(false);
    setEditingId(null);
    setUploadErrors([]);
  }, [activeDict]);

  async function handleToggle(id: string, current: boolean) {
    const res = await fetch(`/v1/admin/dict/${activeDict}/${id}/toggle`, {
      method: 'PATCH', headers: getAuthHeaders(),
    });
    if (res.ok) setEntries(e => e.map(x => x.id === id ? { ...x, is_active: !current } : x));
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/v1/admin/dict/${activeDict}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { setEditingId(null); fetchEntries(); }
    setSaving(false);
  }

  async function handleAdd() {
    if (!newEntry.code || !newEntry.label) return;
    setSaving(true);
    const res = await fetch(`/v1/admin/dict/${activeDict}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(newEntry),
    });
    if (res.ok) { setAddMode(false); setNewEntry({ code: '', label: '' }); fetchEntries(); }
    setSaving(false);
  }

  function downloadTemplate() {
    const headers = 'code,label';
    const active = DICTS.find(d => d.key === activeDict) || DICTS[0];
    const row = `${active.codePlaceholder},${active.labelPlaceholder}`;
    const csv = `${headers}\n${row}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDict}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function parseCSV(text: string): { code: string; label: string }[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const results: { code: string; label: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 2 && parts[0] && parts[1]) {
        results.push({ code: parts[0], label: parts[1] });
      }
    }
    return results;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErrors([]);
    setUploading(true);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setUploadErrors(['No valid rows found. Ensure CSV has header row (code,label) and at least one data row.']);
        setUploading(false);
        return;
      }

      setUploadProgress({ done: 0, total: rows.length });
      const errors: string[] = [];
      let done = 0;

      for (const row of rows) {
        try {
          const res = await fetch(`/v1/admin/dict/${activeDict}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(row),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            errors.push(`Row "${row.code}": ${data.message || res.statusText}`);
          }
        } catch {
          errors.push(`Row "${row.code}": Network error`);
        }
        done++;
        setUploadProgress({ done, total: rows.length });
      }

      if (errors.length > 0) setUploadErrors(errors);
      fetchEntries();
    } catch {
      setUploadErrors(['Failed to read file. Please ensure it is a valid CSV file.']);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))] flex-shrink-0">{active.icon}</span>
            <h3 className="text-[17px] font-bold tracking-tight text-[hsl(var(--admin-text-main))] truncate">{active.label}</h3>
            {!loading && (
              <span className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface-alt))] px-2 py-0.5 rounded-full flex-shrink-0">
                {entries.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button type="button" title="Upload CSV"
              onClick={() => { setUploadMode(u => !u); setAddMode(false); setEditingId(null); setUploadErrors([]); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                uploadMode
                  ? 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] border border-[hsl(var(--admin-border))]'
                  : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))]'
              }`}>
              <Upload size={15} />
            </button>
            <button type="button" title={addMode ? 'Cancel' : 'Add new entry'}
              onClick={() => { setAddMode(a => !a); setUploadMode(false); setEditingId(null); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                addMode
                  ? 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] border border-[hsl(var(--admin-border))]'
                  : 'bg-[hsl(var(--admin-primary))] text-white'
              }`}>
              <Plus size={16} className={addMode ? 'rotate-45 transition-transform' : 'transition-transform'} />
            </button>
          </div>
        </div>

        {/* Upload panel */}
        {uploadMode && (
          <div className="ios-card border-2 border-[hsl(var(--admin-primary)/0.3)] p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-primary)/0.06)]">
              <p className="text-[12px] font-bold text-[hsl(var(--admin-primary))] uppercase tracking-wider">
                Bulk Upload — {active.label}
              </p>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">
                Upload a CSV file with <span className="font-mono font-bold text-[hsl(var(--admin-text-main))]">code</span> and <span className="font-mono font-bold text-[hsl(var(--admin-text-main))]">label</span> columns. Download the template first, add your entries, then upload.
              </p>

              <div className="flex gap-2">
                <button type="button" onClick={downloadTemplate}
                  className="flex-1 h-10 bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))] text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[hsl(var(--admin-border))] active:scale-[0.98] transition-all">
                  <Download size={14} />
                  Download Template
                </button>
                <label
                  className={`flex-1 h-10 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer ${
                    uploading
                      ? 'bg-[hsl(var(--admin-primary)/0.5)] text-white cursor-wait'
                      : 'bg-[hsl(var(--admin-primary))] text-white hover:opacity-90'
                  }`}>
                  <FileSpreadsheet size={14} />
                  {uploading ? `Uploading ${uploadProgress.done}/${uploadProgress.total}...` : 'Upload CSV'}
                  <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              {uploadErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-red-700">
                    <AlertCircle size={14} />
                    <span className="text-[12px] font-bold">{uploadErrors.length} error{uploadErrors.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-0.5">
                    {uploadErrors.map((err, i) => (
                      <p key={i} className="text-[11px] text-red-600 font-mono">{err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                    placeholder={active.codePlaceholder}
                    className="w-full h-10 px-3 bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] rounded-xl text-[14px] font-mono text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none focus:border-[hsl(var(--admin-primary))] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1.5 block">Label</label>
                  <input
                    value={newEntry.label}
                    onChange={e => setNewEntry(n => ({ ...n, label: e.target.value }))}
                    placeholder={active.labelPlaceholder}
                    className="w-full h-10 px-3 bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] rounded-xl text-[14px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] outline-none focus:border-[hsl(var(--admin-primary))] transition-all"
                  />
                </div>
              </div>
              <button type="button" onClick={handleAdd} disabled={saving || !newEntry.code || !newEntry.label}
                className="w-full h-10 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-40">
                {saving ? 'Saving...' : `Add to ${active.label}`}
              </button>
            </div>
          </div>
        )}

        {/* Entries list */}
        <div className="ios-card p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-[hsl(var(--admin-primary)/0.25)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
              <p className="text-[14px] font-medium text-[hsl(var(--admin-text-muted))]">Loading...</p>
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
