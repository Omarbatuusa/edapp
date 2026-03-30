'use client';

import { FieldWrapper } from './FieldWrapper';

export interface RadioOption {
    value: string;
    label: string;
}

interface RadioGroupFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: RadioOption[];
    required?: boolean;
    error?: string;
    helper?: string;
    layout?: 'horizontal' | 'vertical';
    className?: string;
}

export function RadioGroupField({
    label, value, onChange, options, required, error, helper,
    layout = 'horizontal', className,
}: RadioGroupFieldProps) {
    const state = error ? 'error' : (value ? 'success' : 'idle');
    const groupName = `radio-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <FieldWrapper label={label} required={required} state={state} error={error} helper={helper} className={className} showIcon={false}>
            <div className={`p-3 ${layout === 'horizontal' ? 'flex flex-wrap gap-3' : 'flex flex-col gap-2'}`}>
                {options.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none group">
                        <input
                            type="radio"
                            name={groupName}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                            className="w-4 h-4 flex-shrink-0 cursor-pointer accent-[hsl(var(--admin-success))]"
                        />
                        <span className={`text-[14px] leading-snug transition-colors ${
                            value === opt.value
                                ? 'text-[hsl(var(--admin-text-main))] font-medium'
                                : 'text-[hsl(var(--admin-text-sub))]'
                        }`}>
                            {opt.label}
                        </span>
                    </label>
                ))}
            </div>
        </FieldWrapper>
    );
}
