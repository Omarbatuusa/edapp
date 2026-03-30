'use client';

import { FieldWrapper } from './FieldWrapper';

interface TextFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password';
    required?: boolean;
    error?: string;
    helper?: string;
    placeholder?: string;
    maxLength?: number;
    className?: string;
    disabled?: boolean;
    readOnly?: boolean;
}

export function TextField({
    label, value, onChange, type = 'text', required, error, helper,
    placeholder, maxLength, className, disabled, readOnly,
}: TextFieldProps) {
    const state = error ? 'error' : (value ? 'success' : 'idle');
    return (
        <FieldWrapper label={label} required={required} state={state} error={error} helper={helper} className={className}>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                readOnly={readOnly}
                aria-label={label}
                aria-invalid={state === 'error'}
                className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)] disabled:opacity-50"
            />
        </FieldWrapper>
    );
}
