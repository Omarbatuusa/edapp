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
    icon?: string;
}

export function DateField({
    label, value, onChange, required, error, helper, min, max, className, disabled, icon = 'calendar_today',
}: DateFieldProps) {
    const state = error ? 'error' : (value ? 'success' : 'idle');
    return (
        <FieldWrapper label={label} required={required} state={state} error={error} helper={helper} className={className} icon={icon}>
            <input
                type="date"
                value={value}
                onChange={e => onChange(e.target.value)}
                min={min}
                max={max}
                disabled={disabled}
                aria-label={label}
                {...(state === 'error' ? { 'aria-invalid': true } : {})}
                className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
        </FieldWrapper>
    );
}
