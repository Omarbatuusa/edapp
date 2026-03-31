'use client';

import { useMemo } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { validateLearnerAge, validateAdultAge } from '@/lib/validators';

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

  // Age range enforcement
  const ageError = useMemo(() => {
    if (!value) return null;
    if (context === 'learner') return validateLearnerAge(value);
    if (context === 'staff') return validateAdultAge(value);
    return null;
  }, [value, context]);

  const effectiveError = error || ageError || undefined;
  const state = effectiveError ? 'error' : value ? 'success' : 'idle';
  const hasAgeWarning = !!ageError;

  return (
    <FieldWrapper label={label} required={required} state={state} error={effectiveError} icon="cake">
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        {...(state === 'error' ? { 'aria-invalid': true } : {})}
        className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />

      {ages && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 px-3 pb-3">
          <AgeCard label="Age today" value={ages.ageToday} warn={hasAgeWarning} />
          {context === 'learner' && 'ageCutoff' in ages && (
            <>
              <AgeCard label="Age at cutoff" value={(ages as any).ageCutoff} sub={cutoffDate.replace('-', '/')} />
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

function AgeCard({ label, value, sub, warn }: { label: string; value: number; sub?: string; warn?: boolean }) {
  const numColor = warn ? 'text-[hsl(var(--admin-danger))]' : 'text-[hsl(var(--admin-primary))]';
  const bgColor = warn ? 'bg-[hsl(var(--admin-danger)/0.06)]' : 'bg-[hsl(var(--admin-primary)/0.06)]';
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl ${bgColor} px-3 py-2`}>
      <span className={`text-[20px] font-extrabold ${numColor}`}>{value}</span>
      <span className="text-[11px] font-medium text-[hsl(var(--admin-text-sub))] leading-tight text-center">{label}</span>
      {sub && <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">{sub}</span>}
    </div>
  );
}
