'use client';

import { useEffect } from 'react';

interface SafetyChooserSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onChooseEmergency: () => void;
    onChooseReports: () => void;
}

/**
 * Safety chooser — quick selection between Emergency and Incident Report.
 * Opens from the shield icon in the header.
 * Mobile: bottom sheet. Tablet/Desktop: centered compact dialog.
 */
export function SafetyChooserSheet({
    isOpen,
    onClose,
    onChooseEmergency,
    onChooseReports,
}: SafetyChooserSheetProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div
                className="
                    fixed z-50 flex flex-col
                    bg-[hsl(var(--admin-surface))] overflow-hidden
                    inset-x-0 bottom-0 rounded-t-2xl shadow-2xl
                    animate-in slide-in-from-bottom duration-300
                    md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                    md:w-[min(360px,calc(100vw-48px))] md:rounded-2xl
                "
                role="dialog"
                aria-modal="true"
                aria-label="Safety options"
            >
                {/* Handle (mobile) */}
                <div className="flex justify-center pt-3 md:hidden">
                    <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2 md:pt-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-[hsl(var(--admin-primary))]">shield</span>
                        <h2 className="text-[16px] font-semibold text-[hsl(var(--admin-text-main))]">Safety & Reports</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Options */}
                <div className="px-4 pb-5 pt-1 space-y-2.5 safe-area-bottom">
                    {/* Report Incident */}
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            setTimeout(onChooseReports, 150);
                        }}
                        className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border)/0.5)] transition-colors text-left active:scale-[0.97]"
                    >
                        <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[22px] text-amber-600 dark:text-amber-400">flag</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">Report Incident</p>
                            <p className="text-[12px] text-[hsl(var(--admin-text-muted))] mt-0.5">Bullying, safety concern, or other</p>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                    </button>

                    {/* Emergency Contacts */}
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            setTimeout(onChooseEmergency, 150);
                        }}
                        className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors text-left active:scale-[0.97]"
                    >
                        <div className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[22px] text-white">emergency</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-red-700 dark:text-red-300">Emergency</p>
                            <p className="text-[12px] text-red-600/70 dark:text-red-400/70 mt-0.5">Call school, contacts & medical info</p>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-red-400">chevron_right</span>
                    </button>
                </div>
            </div>
        </>
    );
}
