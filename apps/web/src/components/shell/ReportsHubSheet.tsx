'use client';

import { useState, useEffect } from 'react';
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

/* ────────────────────────────────────────────────────────── */
/*  Report categories — consistent outlined icon set         */
/* ────────────────────────────────────────────────────────── */
const REPORT_CATEGORIES = [
    {
        id: 'incidents',
        icon: 'flag',
        label: 'Incidents',
        description: 'Report or view safety incidents',
        href: '/safety/new?category=SAFETY_CONCERN',
    },
    {
        id: 'bullying',
        icon: 'person_off',
        label: 'Bullying',
        description: 'Report bullying or harassment',
        href: '/safety/new?category=BULLYING',
    },
    {
        id: 'emergency-report',
        icon: 'emergency',
        label: 'Emergency',
        description: 'Report an emergency situation',
        href: null,
    },
    {
        id: 'silent-help',
        icon: 'support',
        label: 'Silent Help',
        description: 'Discreet request for support',
        href: '/safety/new?category=CHILD_PROTECTION',
        learnerOnly: true,
    },
];

const STAFF_SHORTCUT = {
    id: 'safeguarding-queue',
    icon: 'admin_panel_settings',
    label: 'Safeguarding Queue',
    description: 'Review and manage open cases',
    href: '/safety',
};

/* Mock recent reports */
const MOCK_RECENT: Array<{
    id: string;
    type: string;
    icon: string;
    title: string;
    status: 'open' | 'in_progress' | 'closed';
    time: string;
}> = [
    { id: '1', type: 'incident', icon: 'flag', title: 'Playground fall — Grade 3', status: 'in_progress', time: '2h ago' },
    { id: '2', type: 'bullying', icon: 'person_off', title: 'Verbal bullying report', status: 'open', time: '1d ago' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Open' },
    in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'In Progress' },
    closed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Closed' },
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
    const router = useRouter();
    const isLearner = role.includes('learner') || role.includes('student');
    const isStaff = role.includes('admin') || role.includes('staff') || role.includes('principal') ||
        role.includes('teacher') || role.includes('counsellor') || role.includes('hod') || role.includes('smt');
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');

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

    const visibleCategories = REPORT_CATEGORIES.filter(
        (cat) => !cat.learnerOnly || isLearner
    );

    const filteredRecent = MOCK_RECENT.filter(
        (r) => filter === 'all' || r.status === filter
    );

    const handleCategoryClick = (cat: (typeof REPORT_CATEGORIES)[number]) => {
        if (cat.id === 'emergency-report' && onOpenEmergency) {
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
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Reports panel */}
            <div
                className="
                    fixed inset-0 z-50 flex flex-col
                    bg-[hsl(var(--admin-background))]
                    md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                    md:w-[min(560px,calc(100vw-48px))] md:h-[min(80vh,720px)]
                    md:rounded-2xl md:shadow-2xl md:overflow-hidden
                    animate-in slide-in-from-bottom duration-300 md:fade-in md:zoom-in-95
                "
                role="dialog"
                aria-modal="true"
                aria-label="Reports Hub"
            >
                {/* Header */}
                <div
                    className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-background))] flex-shrink-0"
                    style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
                >
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.92] flex-shrink-0"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined text-[22px] md:hidden">arrow_back</span>
                        <X size={20} className="hidden md:block" />
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="material-symbols-outlined text-xl text-[hsl(var(--admin-primary))]">description</span>
                        <h2 className="text-[17px] font-semibold text-[hsl(var(--admin-text-main))] truncate">
                            Reports
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Create report section */}
                    <div className="p-4">
                        <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                            Create Report
                        </h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            {visibleCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat)}
                                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors text-left active:scale-[0.97] ios-shadow"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        cat.id === 'emergency-report'
                                            ? 'bg-red-100 dark:bg-red-900/20'
                                            : 'bg-[hsl(var(--admin-primary)/0.1)]'
                                    }`}>
                                        <span className={`material-symbols-outlined text-xl ${
                                            cat.id === 'emergency-report'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-[hsl(var(--admin-primary))]'
                                        }`}>
                                            {cat.icon}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))] leading-tight">
                                            {cat.label}
                                        </p>
                                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-tight mt-0.5 line-clamp-1">
                                            {cat.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Staff shortcut: Safeguarding Queue */}
                    {isStaff && (
                        <div className="px-4 pb-3">
                            <button
                                onClick={() => {
                                    onClose();
                                    router.push(`${basePath}${STAFF_SHORTCUT.href}`);
                                }}
                                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors ios-shadow"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-xl text-purple-600 dark:text-purple-400">
                                        {STAFF_SHORTCUT.icon}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">{STAFF_SHORTCUT.label}</p>
                                    <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">{STAFF_SHORTCUT.description}</p>
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-[0.5px] bg-[hsl(var(--admin-border)/0.5)] mx-4" />

                    {/* Recent reports */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">
                                Your Recent Reports
                            </h3>
                        </div>

                        {/* Filter chips */}
                        <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
                            {([
                                { key: 'all' as const, label: 'All' },
                                { key: 'open' as const, label: 'Open' },
                                { key: 'in_progress' as const, label: 'In Progress' },
                                { key: 'closed' as const, label: 'Closed' },
                            ]).map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${
                                        filter === key
                                            ? 'bg-[hsl(var(--admin-primary))] text-white'
                                            : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-border))]'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Report list */}
                        {filteredRecent.length > 0 ? (
                            <div className="space-y-1.5">
                                {filteredRecent.map((report) => {
                                    const status = STATUS_STYLES[report.status];
                                    return (
                                        <button
                                            key={report.id}
                                            onClick={() => {
                                                onClose();
                                                router.push(`${basePath}/safety/${report.id}`);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors text-left"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-lg text-[hsl(var(--admin-text-muted))]">
                                                    {report.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-main))] truncate">
                                                    {report.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.text}`}>
                                                        {status.label}
                                                    </span>
                                                    <span className="text-[11px] text-[hsl(var(--admin-text-muted))]">{report.time}</span>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center mx-auto mb-2">
                                    <span className="material-symbols-outlined text-[24px] text-[hsl(var(--admin-text-muted))]">description</span>
                                </div>
                                <p className="text-[13px] text-[hsl(var(--admin-text-muted))]">No reports matching this filter</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center px-4 pb-4">
                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">
                            All reports are confidential and reviewed by {tenantName} staff.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
