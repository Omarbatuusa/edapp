'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Phase { code: string; label: string; sort_order: number }

interface Props {
  tenantId: string;
}

export default function TenantPhaseSelector({ tenantId }: Props) {
  const [allPhases, setAllPhases] = useState<Phase[]>([]);
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
        // Load all available phases from dict
        const dictRes = await fetch('/v1/admin/dict/phases', { headers });
        const phases = dictRes.ok ? await dictRes.json() : [];
        setAllPhases(phases.sort((a: Phase, b: Phase) => a.sort_order - b.sort_order));

        // Load tenant's current phase links
        const linkRes = await fetch(`/v1/admin/tenants/${tenantId}/grades-classes/phases`, { headers });
        if (linkRes.ok) {
          const links = await linkRes.json();
          setSelected(new Set(links.map((l: any) => l.phase_code)));
        }
      } catch (err) {
        console.error('Failed to load phases:', err);
      }
      setLoading(false);
    }
    load();
  }, [tenantId]);

  function toggle(code: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/v1/admin/tenants/${tenantId}/grades-classes/phases/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ phase_codes: Array.from(selected) }),
      });
      if (res.ok) setSaved(true);
    } catch (err) {
      console.error('Failed to save phases:', err);
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
          <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">School Phases</h3>
          <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">Select which phases this school offers</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Phases'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {allPhases.map(phase => {
          const isSelected = selected.has(phase.code);
          return (
            <button
              key={phase.code}
              type="button"
              onClick={() => toggle(phase.code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.06)]'
                  : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))] hover:border-[hsl(var(--admin-primary)/0.3)]'
              }`}
            >
              {isSelected
                ? <CheckCircle2 size={18} className="text-[hsl(var(--admin-primary))] shrink-0" />
                : <Circle size={18} className="text-[hsl(var(--admin-text-muted))] shrink-0" />
              }
              <div>
                <p className={`text-[13px] font-semibold ${isSelected ? 'text-[hsl(var(--admin-primary))]' : 'text-[hsl(var(--admin-text-main))]'}`}>
                  {phase.label}
                </p>
                <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">{phase.code}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-[hsl(var(--admin-text-muted))]">
        {selected.size} phase{selected.size !== 1 ? 's' : ''} selected
      </p>
    </div>
  );
}
