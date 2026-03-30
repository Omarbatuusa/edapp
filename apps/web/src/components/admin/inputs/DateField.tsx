'use client';

import { FieldWrapper } from './FieldWrapper';

interface DateFieldProps {
    label: string;
    value: string;   // YYYY-MM-DD
    onChange: (v: string) => void;
    required?: boolean;
    error?: string;
    helper?: string;
    min?: string;
    max?: string;
    className?: string;
    disabled?: boolean;
}

export function DateField({
    label, value, onChange, required, error, helper, min, max, className, disabled,
}: DateFieldProps) {
    const state = error ? 'error' : (value ? 'success' : 'idle');
    return (
        <FieldWrapper label={label} required={required} state={state} error={error} helper={helper} className={className}>
            <input
                type="date"
                value={value}
                onChange={e => onChange(e.target.value)}
                min={min}
                max={max}
                disabled={disabled}
                aria-label={label}
                aria-invalid={state === 'error'}
                className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] disabled:opacity-50"
            />
        </FieldWrapper>
    );
}
