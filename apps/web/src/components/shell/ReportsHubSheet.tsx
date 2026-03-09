'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface ReportsHubSheetProps {
    isOpen: boolean;
    onClose: () => void;
    tenantSlug: string;
    role: string;
    basePath: string;
    tenantName?: string;
    onOpenEmergency?: () => void;
}

const CATEGORIES = [
    {
        id: 'incidents',
        icon: 'report',
        label: 'Incidents',
        description: 'Report or view incidents',
        color: 'amber',
        href: '/incidents',
    },
    {
        id: 'bullying',
        icon: 'group_off',
        label: 'Bullying',
        description: 'Report bullying or harassment',
        color: 'red',
        href: '/safety',
    },
    {
        id: 'emergency',
        icon: 'emergency',
        label: 'Emergency',
        description: 'Access emergency contacts & SOS',
        color: 'rose',
        href: null, // opens EmergencySheet instead
    },
    {
        id: 'silent-help',
        icon: 'volunteer_activism',
        label: 'Silent Help',
        description: 'Discreet request for support',
        color: 'purple',
        href: '/safety',
        learnerOnly: true,
    },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; hoverBg: string }> = {
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: 'text-amber-600 dark:text-amber-400',
        hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
    },
    red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: 'text-red-600 dark:text-red-400',
        hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
    },
    rose: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        icon: 'text-rose-600 dark:text-rose-400',
        hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/30',
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    },
};

export function ReportsHubSheet({
    isOpen,
    onClose,
    tenantSlug,
    role,
    basePath,
    tenantName = 'School',
    onOpenEmergency,
}: ReportsHubSheetProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const isLearner = role.includes('learner') || role.includes('student');

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

    const visibleCategories = CATEGORIES.filter(
        (cat) => !cat.learnerOnly || isLearner
    );

    const handleCategoryClick = (cat: (typeof CATEGORIES)[number]) => {
        if (cat.id === 'emergency' && onOpenEmergency) {
            onClose();
            setTimeout(() => onOpenEmergency(), 150);
            return;
        }
        if (cat.href) {
            onClose();
            router.push(`${basePath}${cat.href}`);
        }
    };

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
                className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--admin-surface))] rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Reports Hub"
            >
                {/* Handle + Header */}
                <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-[hsl(var(--admin-border)/0.5)]">
                    <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))] mb-3" />
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] text-lg">
                                    summarize
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-[hsl(var(--admin-text-main))]">
                                Reports
                            </h2>
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
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {visibleCategories.map((cat) => {
                            const colors = COLOR_MAP[cat.color] || COLOR_MAP.amber;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl ${colors.bg} ${colors.hoverBg} transition-colors active:scale-[0.97]`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center">
                                        <span
                                            className={`material-symbols-outlined text-2xl ${colors.icon}`}
                                        >
                                            {cat.icon}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">
                                            {cat.label}
                                        </p>
                                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))] mt-0.5 leading-tight">
                                            {cat.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer hint */}
                    <div className="text-center pt-4 pb-2">
                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">
                            All reports are confidential and reviewed by {tenantName} staff.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
