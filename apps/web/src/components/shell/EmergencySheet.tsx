'use client';

import { useEffect } from 'react';

interface EmergencySheetProps {
    isOpen: boolean;
    onClose: () => void;
    tenantName?: string;
}

/**
 * Emergency takeover screen.
 * Mobile: fullwidth. Tablet/Desktop: centered panel.
 * Single close icon (X) — no duplicate back/X.
 */
export function EmergencySheet({
    isOpen,
    onClose,
    tenantName = 'School',
}: EmergencySheetProps) {
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
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Emergency panel */}
            <div
                className="
                    fixed inset-0 z-50 flex flex-col
                    bg-[hsl(var(--admin-background))]
                    md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                    md:w-[min(480px,calc(100vw-48px))] md:h-[min(75vh,640px)]
                    md:rounded-2xl md:shadow-2xl md:overflow-hidden
                    animate-in slide-in-from-bottom duration-300
                "
                role="dialog"
                aria-modal="true"
                aria-label="Emergency"
            >
                {/* Header — single X close button */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-background))] flex-shrink-0 safe-area-top">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.92] flex-shrink-0"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined text-[22px]">close</span>
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="material-symbols-outlined text-xl text-red-600 dark:text-red-400">shield</span>
                        <h2 className="text-[17px] font-semibold text-[hsl(var(--admin-text-main))] truncate">Emergency</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Quick actions */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors active:scale-[0.97]"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-xl text-white">call</span>
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-[13px] font-semibold text-red-700 dark:text-red-300">Call School</p>
                                    <p className="text-[11px] text-red-600/70 dark:text-red-400/70">Emergency line</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.97] ios-shadow"
                            >
                                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-xl text-white">chat</span>
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">WhatsApp</p>
                                    <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">Send message</p>
                                </div>
                            </button>
                        </div>

                        <button
                            type="button"
                            className="w-full mt-3 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] transition-colors active:scale-[0.97]"
                        >
                            <span className="material-symbols-outlined text-xl">warning</span>
                            Report Emergency
                        </button>
                    </div>

                    {/* Emergency contacts */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                            Emergency Contacts
                        </h3>
                        <div className="space-y-1.5">
                            {[
                                { icon: 'school', label: tenantName, sub: 'School emergency line', color: 'bg-[hsl(var(--admin-primary)/0.1)]', iconColor: 'text-[hsl(var(--admin-primary))]' },
                                { icon: 'local_police', label: 'Security', sub: 'Campus security office', color: 'bg-amber-100 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' },
                                { icon: 'psychology', label: 'Counsellor', sub: 'Student counselling', color: 'bg-purple-100 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
                                { icon: 'medical_services', label: 'School Nurse', sub: 'Medical assistance', color: 'bg-teal-100 dark:bg-teal-900/20', iconColor: 'text-teal-600 dark:text-teal-400' },
                            ].map((contact) => (
                                <button
                                    type="button"
                                    key={contact.label}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${contact.color} flex items-center justify-center flex-shrink-0`}>
                                        <span className={`material-symbols-outlined text-xl ${contact.iconColor}`}>{contact.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">{contact.label}</p>
                                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">{contact.sub}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[18px] text-white">call</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Medical info link */}
                    <div>
                        <button
                            type="button"
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-xl text-pink-600 dark:text-pink-400">favorite</span>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">Medical Information</p>
                                <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">View allergies, conditions & medication</p>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="text-center pb-2">
                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-relaxed">
                            Emergency contacts and medical info are managed by {tenantName} administrators.
                            <br />Contact your school to update this information.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
