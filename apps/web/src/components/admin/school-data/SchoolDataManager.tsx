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

  if (loading) return <div className="p-8 text-center text-muted-foreground text-sm">Loading school data...</div>;

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="surface-card overflow-hidden">
      <button onClick={() => setOpen(open === id ? '' : id)} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-left hover:bg-muted/20 transition-colors">
        <span>{title}</span>
        {open === id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {open === id && <div className="px-5 pb-5 border-t border-border">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <Section id="phases" title="Phases & Grades">
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Phases</p>
              <button onClick={savePhases} disabled={saving} className="h-7 px-3 bg-primary text-primary-foreground text-xs rounded-lg flex items-center gap-1"><Save size={12} /> Save</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {phases.map(p => (
                <label key={p.code} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={enabledPhases.has(p.code)} onChange={e => { const s = new Set(enabledPhases); e.target.checked ? s.add(p.code) : s.delete(p.code); setEnabledPhases(s); }} className="rounded" />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Grades</p>
              <button onClick={saveGrades} disabled={saving} className="h-7 px-3 bg-primary text-primary-foreground text-xs rounded-lg flex items-center gap-1"><Save size={12} /> Save</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {grades.filter(g => enabledPhases.has(g.phase_code) || enabledPhases.size === 0).map(g => (
                <label key={g.code} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={enabledGrades.has(g.code)} onChange={e => { const s = new Set(enabledGrades); e.target.checked ? s.add(g.code) : s.delete(g.code); setEnabledGrades(s); }} className="rounded" />
                  <span className="text-sm">{g.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="subjects" title="Subject Offerings">
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{offerings.length} subjects offered</p>
            <select onChange={e => e.target.value && addOffering(e.target.value)} className="input-field text-sm" defaultValue="">
              <option value="">+ Add subject...</option>
              {subjects.filter(s => !offerings.some(o => o.subject_id === s.id)).map(s => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
          </div>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {offerings.map(o => {
              const subj = subjects.find(s => s.id === o.subject_id);
              return (
                <div key={o.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{subj?.subject_name || o.subject_id}</p>
                    <p className="text-xs text-muted-foreground">{subj?.subject_code}</p>
                  </div>
                  <button onClick={() => removeOffering(o.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              );
            })}
            {offerings.length === 0 && <p className="p-4 text-sm text-center text-muted-foreground">No subjects added yet</p>}
          </div>
        </div>
      </Section>

      <Section id="streams" title="Subject Streams">
        <div className="mt-4 space-y-3">
          {streams.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">{s.stream_name}</p>
                <p className="text-xs text-muted-foreground font-mono">{s.stream_code}</p>
              </div>
              {!s.tenant_id && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Platform</span>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
