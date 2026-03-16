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
}

export function FieldWrapper({ label, required, state = 'idle', error, helper, children, className = '' }: FieldWrapperProps) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {/* Label */}
            <label className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] flex items-center gap-1 px-1">
                {label}
                {required && <span className="text-red-500 text-[11px]">*</span>}
            </label>

            {/* Input container — iOS grouped row style */}
            <div className={`rounded-[12px] border transition-colors duration-150 overflow-hidden bg-[hsl(var(--admin-surface-alt)/0.5)] ${
                state === 'error'
                    ? 'border-red-400'
                    : state === 'success'
                    ? 'border-[hsl(var(--admin-primary)/0.4)]'
                    : 'border-[hsl(var(--admin-border)/0.6)]'
            }`}>
                {children}
            </div>

            {/* Feedback row */}
            {state === 'error' && error && (
                <p className="text-[12px] text-red-500 font-medium px-1">{error}</p>
            )}
            {state !== 'error' && helper && (
                <p className="text-[11px] text-[hsl(var(--admin-text-muted))] px-1 leading-snug">{helper}</p>
            )}
        </div>
    );
}
