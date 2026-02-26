'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronRight } from 'lucide-react';

interface Phase { id: string; code: string; label: string; is_active: boolean }
interface Grade { id: string; code: string; label: string; phase_code: string; is_active: boolean }
interface Subject { id: string; subject_code: string; subject_name: string; category_code?: string }
interface Offering { id: string; subject_id: string; branch_id?: string; type_code?: string; language_level_code?: string }
interface Stream { id: string; stream_code: string; stream_name: string; tenant_id?: string }

interface Props { tenantId: string }

export default function SchoolDataManager({ tenantId }: Props) {
  const [open, setOpen] = useState<string>('phases');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enabledPhases, setEnabledPhases] = useState<Set<string>>(new Set());
  const [enabledGrades, setEnabledGrades] = useState<Set<string>>(new Set());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('session_token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => {
    async function load() {
      const [phasesRes, gradesRes, phaseLinksRes, gradeLinksRes, offeringsRes, subjectsRes, streamsRes] = await Promise.all([
        fetch('/v1/admin/dict/phases', { headers: headers() }),
        fetch('/v1/admin/dict/grades', { headers: headers() }),
        fetch(`/v1/admin/tenants/${tenantId}/school-data/phases`, { headers: headers() }),
        fetch(`/v1/admin/tenants/${tenantId}/school-data/grades`, { headers: headers() }),
        fetch(`/v1/admin/tenants/${tenantId}/school-data/subject-offerings`, { headers: headers() }),
        fetch('/v1/admin/subjects', { headers: headers() }),
        fetch(`/v1/admin/tenants/${tenantId}/school-data/streams`, { headers: headers() }),
      ]);
      if (phasesRes.ok) setPhases(await phasesRes.json());
      if (gradesRes.ok) setGrades(await gradesRes.json());
      if (phaseLinksRes.ok) { const d = await phaseLinksRes.json(); setEnabledPhases(new Set(d.map((p: any) => p.phase_code))); }
      if (gradeLinksRes.ok) { const d = await gradeLinksRes.json(); setEnabledGrades(new Set(d.map((g: any) => g.grade_code))); }
      if (offeringsRes.ok) setOfferings(await offeringsRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (streamsRes.ok) setStreams(await streamsRes.json());
      setLoading(false);
    }
    load();
  }, [tenantId]);

  async function savePhases() {
    setSaving(true);
    await fetch(`/v1/admin/tenants/${tenantId}/school-data/phases`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ phase_codes: Array.from(enabledPhases) }),
    });
    setSaving(false);
  }

  async function saveGrades() {
    setSaving(true);
    await fetch(`/v1/admin/tenants/${tenantId}/school-data/grades`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ grade_codes: Array.from(enabledGrades) }),
    });
    setSaving(false);
  }

  async function removeOffering(id: string) {
    const token = localStorage.getItem('session_token');
    await fetch(`/v1/admin/tenants/${tenantId}/school-data/subject-offerings/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setOfferings(o => o.filter(x => x.id !== id));
  }

  async function addOffering(subjectId: string) {
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/tenants/${tenantId}/school-data/subject-offerings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ subject_id: subjectId }),
    });
    if (res.ok) { const newOffering = await res.json(); setOfferings(o => [...o, newOffering]); }
  }

  if (loading) return <div className="p-8 text-center text-[hsl(var(--admin-text-muted))] text-[15px] font-medium">Loading school data...</div>;

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="ios-card overflow-hidden p-0 mb-4">
      <button onClick={() => setOpen(open === id ? '' : id)} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[16px] tracking-tight text-[hsl(var(--admin-text-main))] text-left hover:bg-[hsl(var(--admin-surface-alt))] active:bg-[hsl(var(--admin-surface-alt))] transition-colors">
        <span>{title}</span>
        {open === id ? <ChevronDown size={20} className="text-[hsl(var(--admin-text-muted))]" /> : <ChevronRight size={20} className="text-[hsl(var(--admin-text-muted))]" />}
      </button>
      {open === id && <div className="px-5 pb-5 border-t border-[hsl(var(--admin-border))]">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <Section id="phases" title="Phases & Grades">
        <div className="mt-4 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))] uppercase tracking-wider">Phases</p>
              <button onClick={savePhases} disabled={saving} className="h-8 px-3.5 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-medium rounded-full flex items-center gap-1.5 hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-95 transition-all"><Save size={14} /> Save</button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {phases.map(p => (
                <label key={p.code} className="flex items-center gap-2 cursor-pointer bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-surface-alt))/0.8] px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-[hsl(var(--admin-border))]">
                  <input type="checkbox" checked={enabledPhases.has(p.code)} onChange={e => { const s = new Set(enabledPhases); e.target.checked ? s.add(p.code) : s.delete(p.code); setEnabledPhases(s); }} className="w-4 h-4 rounded border-[hsl(var(--admin-border))] text-[hsl(var(--admin-primary))] focus:ring-[hsl(var(--admin-primary))]" />
                  <span className="text-[14px] font-medium text-[hsl(var(--admin-text-main))]">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-[hsl(var(--admin-border))]">
            <div className="flex items-center justify-between mb-3 mt-2">
              <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))] uppercase tracking-wider">Grades</p>
              <button onClick={saveGrades} disabled={saving} className="h-8 px-3.5 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-medium rounded-full flex items-center gap-1.5 hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-95 transition-all"><Save size={14} /> Save</button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {grades.filter(g => enabledPhases.has(g.phase_code) || enabledPhases.size === 0).map(g => (
                <label key={g.code} className="flex items-center gap-2 cursor-pointer bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-surface-alt))/0.8] px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-[hsl(var(--admin-border))]">
                  <input type="checkbox" checked={enabledGrades.has(g.code)} onChange={e => { const s = new Set(enabledGrades); e.target.checked ? s.add(g.code) : s.delete(g.code); setEnabledGrades(s); }} className="w-4 h-4 rounded border-[hsl(var(--admin-border))] text-[hsl(var(--admin-primary))] focus:ring-[hsl(var(--admin-primary))]" />
                  <span className="text-[14px] font-medium text-[hsl(var(--admin-text-main))]">{g.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="subjects" title="Subject Offerings">
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between bg-[hsl(var(--admin-surface-alt))] p-2 pl-4 rounded-xl">
            <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider">{offerings.length} subjects offered</p>
            <select onChange={e => e.target.value && addOffering(e.target.value)} className="h-9 px-3 text-[14px] bg-white dark:bg-black rounded-lg border border-[hsl(var(--admin-border))] focus:ring-2 focus:ring-[hsl(var(--admin-primary))/0.3] outline-none shadow-sm" defaultValue="">
              <option value="">+ Add subject...</option>
              {subjects.filter(s => !offerings.some(o => o.subject_id === s.id)).map(s => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
          </div>
          <div className="divide-y divide-[hsl(var(--admin-border))] border border-[hsl(var(--admin-border))] rounded-[16px] overflow-hidden">
            {offerings.map(o => {
              const subj = subjects.find(s => s.id === o.subject_id);
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                  <div>
                    <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] tracking-tight">{subj?.subject_name || o.subject_id}</p>
                    <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))]">{subj?.subject_code}</p>
                  </div>
                  <button onClick={() => removeOffering(o.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-[hsl(var(--admin-text-muted))] hover:text-red-500 active:scale-90 transition-all"><Trash2 size={16} /></button>
                </div>
              );
            })}
            {offerings.length === 0 && <p className="p-6 text-[15px] text-center text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface-alt))]">No subjects added yet</p>}
          </div>
        </div>
      </Section>

      <Section id="streams" title="Subject Streams">
        <div className="mt-4 space-y-3">
          {streams.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4 rounded-[16px] border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-[hsl(var(--admin-text-main))]">{s.stream_name}</p>
                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] font-mono mt-0.5">{s.stream_code}</p>
              </div>
              {!s.tenant_id && <span className="text-[11px] font-bold tracking-wider uppercase bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] px-2.5 py-1 rounded-full">Platform</span>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
