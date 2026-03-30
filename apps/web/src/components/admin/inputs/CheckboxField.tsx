'use client';

interface CheckboxFieldProps {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    required?: boolean;
    error?: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}

export function CheckboxField({
    label, checked, onChange, required, error, description, className = '', disabled,
}: CheckboxFieldProps) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className={`flex items-start gap-3 p-3 rounded-[12px] border transition-[border-color,box-shadow] duration-150 cursor-pointer select-none ${
                error
                    ? 'border-[hsl(var(--admin-danger)/0.55)] bg-[hsl(var(--admin-danger)/0.03)]'
                    : checked
                    ? 'border-[hsl(var(--admin-success-border))] bg-[hsl(var(--admin-surface-alt)/0.5)]'
                    : 'border-[hsl(var(--admin-border)/0.6)] bg-[hsl(var(--admin-surface-alt)/0.5)] field-container'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                    required={required}
                    disabled={disabled}
                    aria-invalid={!!error}
                    className="mt-0.5 w-5 h-5 rounded flex-shrink-0 cursor-pointer accent-[hsl(var(--admin-success))]"
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[14px] font-medium text-[hsl(var(--admin-text-main))] leading-snug">{label}</span>
                    {description && (
                        <span className="text-[12px] text-[hsl(var(--admin-text-muted))] leading-snug">{description}</span>
                    )}
                </div>
            </label>
            {error && (
                <p className="text-[12px] text-[hsl(var(--admin-danger))] font-medium px-1">{error}</p>
            )}
        </div>
    );
}
