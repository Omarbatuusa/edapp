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

const borderClass: Record<FieldState, string> = {
    idle: 'border-[#e2e8f0]',
    success: 'border-[#2563eb] border-[3px]',
    error: 'border-red-500 border-[3px]',
};

export function FieldWrapper({ label, required, state = 'idle', error, helper, children, className = '' }: FieldWrapperProps) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className={`rounded-xl border bg-white dark:bg-slate-900 transition-all duration-150 overflow-hidden ${borderClass[state]}`}>
                {children}
            </div>
            {state === 'success' && (
                <div className="flex items-center gap-1 text-[#2563eb] text-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>Looks good</span>
                </div>
            )}
            {state === 'error' && error && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>{error}</span>
                </div>
            )}
            {state === 'idle' && helper && (
                <p className="text-xs text-slate-400">{helper}</p>
            )}
        </div>
    );
}
