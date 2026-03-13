'use client';

import { useMemo } from 'react';
import { FieldWrapper } from './FieldWrapper';

interface Props {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  context?: 'learner' | 'staff';
  cutoffDate?: string; // e.g. "06-30" for June 30
  employmentStartDate?: string;
  required?: boolean;
  error?: string;
}

function calcAge(dob: string, refDate: Date): number {
  const birth = new Date(dob);
  let age = refDate.getFullYear() - birth.getFullYear();
  const m = refDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birth.getDate())) age--;
  return age;
}

export default function DateOfBirthInput({
  label = 'Date of Birth',
  value,
  onChange,
  context = 'learner',
  cutoffDate = '06-30',
  employmentStartDate,
  required,
  error,
}: Props) {
  const ages = useMemo(() => {
    if (!value) return null;

    const today = new Date();
    const ageToday = calcAge(value, today);

    if (context === 'learner') {
      const year = today.getFullYear();
      const cutoff = new Date(`${year}-${cutoffDate}`);
      const ageCutoff = calcAge(value, cutoff);
      const dec31 = new Date(year, 11, 31);
      const ageDec = calcAge(value, dec31);
      return { ageToday, ageCutoff, ageDec };
    }

    if (context === 'staff' && employmentStartDate) {
      const startAge = calcAge(value, new Date(employmentStartDate));
      return { ageToday, startAge };
    }

    return { ageToday };
  }, [value, context, cutoffDate, employmentStartDate]);

  return (
    <FieldWrapper label={label} required={required} error={error}>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] transition-colors"
      />

      {ages && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <AgeCard label="Age today" value={ages.ageToday} />
          {context === 'learner' && 'ageCutoff' in ages && (
            <>
              <AgeCard label={`Age at cutoff`} value={(ages as any).ageCutoff} sub={cutoffDate.replace('-', '/')} />
              <AgeCard label="Age Dec 31" value={(ages as any).ageDec} />
            </>
          )}
          {context === 'staff' && 'startAge' in ages && (
            <AgeCard label="Age at start" value={(ages as any).startAge} />
          )}
        </div>
      )}
    </FieldWrapper>
  );
}

function AgeCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-[hsl(var(--admin-primary)/0.06)] px-3 py-2">
      <span className="text-[20px] font-extrabold text-[hsl(var(--admin-primary))]">{value}</span>
      <span className="text-[11px] font-medium text-[hsl(var(--admin-text-sub))] leading-tight text-center">{label}</span>
      {sub && <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">{sub}</span>}
    </div>
  );
}
