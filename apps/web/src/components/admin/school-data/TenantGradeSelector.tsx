'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Grade { code: string; label: string; sort_order: number }

// Map grades to phases for grouped display
const GRADE_PHASE_MAP: Record<string, string[]> = {
  'ECD': ['GR000'],
  'PRE_GR_R': ['GR00'],
  'GR_R': ['GR0'],
  'FP': ['GR01', 'GR02', 'GR03'],
  'IP': ['GR04', 'GR05', 'GR06'],
  'SP': ['GR07', 'GR08', 'GR09'],
  'FET': ['GR10', 'GR11', 'GR12'],
  'POST_MATRIC': ['GR13'],
};

const PHASE_LABELS: Record<string, string> = {
  'ECD': 'Early Childhood',
  'PRE_GR_R': 'Pre-Grade R',
  'GR_R': 'Grade R',
  'FP': 'Foundation Phase',
  'IP': 'Intermediate Phase',
  'SP': 'Senior Phase',
  'FET': 'FET Phase',
  'POST_MATRIC': 'Post-Matric',
};

interface Props {
  tenantId: string;
  enabledPhases?: string[];
}

export default function TenantGradeSelector({ tenantId, enabledPhases }: Props) {
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const dictRes = await fetch('/v1/admin/dict/grades', { headers });
        const grades = dictRes.ok ? await dictRes.json() : [];
        setAllGrades(grades.sort((a: Grade, b: Grade) => a.sort_order - b.sort_order));

        const linkRes = await fetch(`/v1/admin/tenants/${tenantId}/grades-classes/grades`, { headers });
        if (linkRes.ok) {
          const links = await linkRes.json();
          setSelected(new Set(links.map((l: any) => l.grade_code)));
        }
      } catch (err) {
        console.error('Failed to load grades:', err);
      }
      setLoading(false);
    }
    load();
  }, [tenantId]);

  // Group grades by phase
  const groupedGrades = useMemo(() => {
    const groups: Array<{ phase: string; label: string; grades: Grade[] }> = [];

    for (const [phase, gradeCodes] of Object.entries(GRADE_PHASE_MAP)) {
      // If enabledPhases provided, skip phases not selected
      if (enabledPhases && enabledPhases.length > 0 && !enabledPhases.includes(phase)) continue;

      const grades = gradeCodes
        .map(code => allGrades.find(g => g.code === code))
        .filter(Boolean) as Grade[];

      if (grades.length > 0) {
        groups.push({ phase, label: PHASE_LABELS[phase] || phase, grades });
      }
    }

    return groups;
  }, [allGrades, enabledPhases]);

  function toggle(code: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
    setSaved(false);
  }

  function selectAllInPhase(gradeCodes: string[]) {
    setSelected(prev => {
      const next = new Set(prev);
      const allSelected = gradeCodes.every(c => next.has(c));
      if (allSelected) {
        gradeCodes.forEach(c => next.delete(c));
      } else {
        gradeCodes.forEach(c => next.add(c));
      }
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/v1/admin/tenants/${tenantId}/grades-classes/grades/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ grade_codes: Array.from(selected) }),
      });
      if (res.ok) setSaved(true);
    } catch (err) {
      console.error('Failed to save grades:', err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">Grades</h3>
          <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">Select which grades this school offers</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Grades'}
        </button>
      </div>

      <div className="space-y-5">
        {groupedGrades.map(group => (
          <div key={group.phase}>
            <button
              type="button"
              onClick={() => selectAllInPhase(group.grades.map(g => g.code))}
              className="text-[13px] font-bold text-[hsl(var(--admin-text-sub))] mb-2 hover:text-[hsl(var(--admin-primary))] transition-colors"
            >
              {group.label}
            </button>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {group.grades.map(grade => {
                const isSelected = selected.has(grade.code);
                return (
                  <button
                    key={grade.code}
                    type="button"
                    onClick={() => toggle(grade.code)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.06)]'
                        : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]'
                    }`}
                  >
                    {isSelected
                      ? <CheckCircle2 size={16} className="text-[hsl(var(--admin-primary))] shrink-0" />
                      : <Circle size={16} className="text-[hsl(var(--admin-text-muted))] shrink-0" />
                    }
                    <span className={`text-[13px] font-medium ${isSelected ? 'text-[hsl(var(--admin-primary))]' : 'text-[hsl(var(--admin-text-main))]'}`}>
                      {grade.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">
        {selected.size} grade{selected.size !== 1 ? 's' : ''} selected
      </p>
    </div>
  );
}
