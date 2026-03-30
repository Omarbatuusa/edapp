'use client';

import { FieldWrapper } from './FieldWrapper';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: SelectOption[];
    required?: boolean;
    error?: string;
    helper?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SelectField({
    label, value, onChange, options, required, error, helper,
    placeholder, className, disabled,
}: SelectFieldProps) {
    const state = error ? 'error' : (value ? 'success' : 'idle');
    return (
        <FieldWrapper label={label} required={required} state={state} error={error} helper={helper} className={className} showIcon={false}>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                aria-label={label}
                aria-invalid={state === 'error'}
                className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] disabled:opacity-50 cursor-pointer"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </FieldWrapper>
    );
}
