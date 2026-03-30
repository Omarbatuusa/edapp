'use client';

import { FieldWrapper } from './FieldWrapper';

export interface CheckboxGroupOption {
    value: string;
    label: string;
    description?: string;
}

interface CheckboxGroupFieldProps {
    label: string;
    options: CheckboxGroupOption[];
    value: string[];
    onChange: (selected: string[]) => void;
    required?: boolean;
    error?: string;
    helper?: string;
    minSelected?: number;
    className?: string;
}

export function CheckboxGroupField({
    label, options, value, onChange, required, error, helper, minSelected = 1, className,
}: CheckboxGroupFieldProps) {
    const met = value.length >= (required ? minSelected : 0);
    const state = error ? 'error' : (met && value.length > 0 ? 'success' : 'idle');

    const toggle = (optValue: string) => {
        onChange(
            value.includes(optValue)
                ? value.filter(v => v !== optValue)
                : [...value, optValue]
        );
    };

    return (
        <FieldWrapper label={label} required={required} state={state} error={error} helper={helper} className={className} showIcon={false}>
            <div className="p-2 space-y-1">
                {options.map(opt => (
                    <label key={opt.value} className="flex items-start gap-3 px-2 py-2 rounded-lg cursor-pointer select-none hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                        <input
                            type="checkbox"
                            checked={value.includes(opt.value)}
                            onChange={() => toggle(opt.value)}
                            className="mt-0.5 w-5 h-5 rounded flex-shrink-0 cursor-pointer accent-[hsl(var(--admin-success))]"
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[14px] font-medium text-[hsl(var(--admin-text-main))] leading-snug">{opt.label}</span>
                            {opt.description && (
                                <span className="text-[12px] text-[hsl(var(--admin-text-muted))] leading-snug">{opt.description}</span>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </FieldWrapper>
    );
}
