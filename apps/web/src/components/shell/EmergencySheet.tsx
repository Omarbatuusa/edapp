'use client';

import { useEffect, useRef } from 'react';
import { X, Phone, MessageCircle, AlertTriangle, Heart } from 'lucide-react';

interface EmergencySheetProps {
    isOpen: boolean;
    onClose: () => void;
    tenantName?: string;
}

/**
 * Emergency bottom sheet — accessible from the header SOS chip.
 * Shows emergency contacts, quick actions, and medical info link.
 * Scaffold UI: works even if backend data is not yet available.
 */
export function EmergencySheet({
    isOpen,
    onClose,
    tenantName = 'School',
}: EmergencySheetProps) {
    const panelRef = useRef<HTMLDivElement>(null);

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
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Bottom sheet */}
            <div
                ref={panelRef}
                className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--admin-surface))] rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Emergency"
            >
                {/* Handle + Header */}
                <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-[hsl(var(--admin-border)/0.5)]">
                    <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))] mb-3" />
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-lg font-bold text-[hsl(var(--admin-text-main))]">Emergency</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))] transition-colors text-[hsl(var(--admin-text-sub))]"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                    <Phone size={22} className="text-white" />
                                </div>
                                <span className="text-sm font-semibold text-red-700 dark:text-red-300">Call School</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                    <MessageCircle size={22} className="text-white" />
                                </div>
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">WhatsApp</span>
                            </button>
                        </div>
                        <button className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
                            <AlertTriangle size={18} />
                            <span>Report Emergency</span>
                        </button>
                    </div>

                    {/* Emergency Contacts */}
                    <div>
                        <h3 className="text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                            Emergency Contacts
                        </h3>
                        <div className="space-y-2">
                            {/* School emergency */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-surface-alt))]">
                                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] text-xl">school</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">{tenantName}</p>
                                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">School emergency line</p>
                                </div>
                                <button className="w-9 h-9 rounded-full bg-[hsl(var(--admin-primary))] flex items-center justify-center">
                                    <Phone size={16} className="text-white" />
                                </button>
                            </div>

                            {/* Placeholder contacts */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-surface-alt)/0.5)] opacity-60">
                                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-xl">contact_emergency</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[hsl(var(--admin-text-sub))]">Parent emergency contact</p>
                                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">Not configured yet</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Info Link */}
                    <div>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                                <Heart size={20} className="text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-[hsl(var(--admin-text-main))]">Medical Information</p>
                                <p className="text-xs text-[hsl(var(--admin-text-muted))]">View allergies, conditions & medication</p>
                            </div>
                            <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-lg">chevron_right</span>
                        </button>
                    </div>

                    {/* Empty state hint */}
                    <div className="text-center py-2">
                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">
                            Emergency contacts and medical info are managed by school administrators.
                            Contact your school to update this information.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
