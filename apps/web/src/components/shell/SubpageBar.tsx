'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SubpageBarProps {
    title?: string;
    onBack?: () => void;
    onClose?: () => void;
    actions?: React.ReactNode;
}

/**
 * Sticky bar shown on subpages (non-tab-root routes).
 * Provides back/close navigation + optional title and right actions.
 * Uses admin-header styling (backdrop blur, sticky).
 */
export function SubpageBar({ title, onBack, onClose, actions }: SubpageBarProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <div className="sticky top-0 z-20 bg-[hsl(var(--admin-background)/0.75)] backdrop-blur-[24px] saturate-[180%] border-b border-[hsl(var(--admin-border)/0.5)] px-4 py-3 flex items-center gap-3">
            {/* Back or Close button */}
            {onClose ? (
                <button
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.92]"
                    aria-label="Close"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            ) : (
                <button
                    onClick={handleBack}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.92]"
                    aria-label="Go back"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
            )}

            {/* Title */}
            {title && (
                <h2 className="text-[17px] font-semibold text-[hsl(var(--admin-text-main))] truncate flex-1">
                    {title}
                </h2>
            )}

            {/* Right actions */}
            {actions && (
                <div className="flex items-center gap-1 ml-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}
