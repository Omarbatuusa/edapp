'use client';

import { ReactNode } from 'react';

type FieldState = 'idle' | 'success' | 'error';

interface FieldWrapperProps {
    label: string;
    required?: boolean;
    state?: FieldState;
    error?: string;
    helper?: string;
    children: ReactNode;
    className?: string;
    /** Set false to suppress the success/error icon (e.g. fields with custom trailing controls) */
    showIcon?: boolean;
    /** Material Symbols icon name to render on the left inside the field (e.g. 'person', 'email', 'badge') */
    icon?: string;
}

export function FieldWrapper({ label, required, state = 'idle', error, helper, children, className = '', showIcon = true, icon }: FieldWrapperProps) {
    const containerClass = state === 'error'
        ? 'border-[hsl(var(--admin-danger)/0.6)] field-container-error'
        : state === 'success'
        ? 'border-[hsl(var(--admin-focus-ring)/0.35)] field-container-success'
        : 'border-[hsl(var(--admin-border)/0.55)] field-container';

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {/* Label */}
            <label className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] flex items-center gap-1 px-0.5 tracking-tight">
                {label}
                {required && <span className="text-[hsl(var(--admin-danger))] text-[11px]">*</span>}
            </label>

            {/* Input container — Apple grouped row style */}
            <div className={`relative rounded-[10px] border-[1.5px] transition-all duration-200 ease-out bg-[hsl(var(--admin-surface))] ${containerClass}`}>
                {icon ? (
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted)/0.7)] pl-3 flex-shrink-0 pointer-events-none">
                            {icon}
                        </span>
                        <div className="flex-1 min-w-0">{children}</div>
                    </div>
                ) : children}
                {showIcon && state === 'success' && (
                    <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-success))] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        check_circle
                    </span>
                )}
                {showIcon && state === 'error' && (
                    <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-danger))] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        error
                    </span>
                )}
            </div>

            {/* Feedback row — min-height prevents layout shift */}
            <div className="min-h-[18px] px-0.5">
                {state === 'error' && error ? (
                    <p className="text-[12px] text-[hsl(var(--admin-danger)/0.85)] font-medium">{error}</p>
                ) : helper ? (
                    <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-snug">{helper}</p>
                ) : null}
            </div>
        </div>
    );
}
