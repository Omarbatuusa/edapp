'use client';

import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { useShellActions } from '@/contexts/ShellActionsContext';
import { SAFETY_CARD_ROLES, SAFEGUARDING_STAFF_ROLES } from '@/config/navigation';

/**
 * Safety & Reports quick-access card for dashboards.
 * Shows Report Incident + Emergency buttons, plus Safeguarding Queue for staff.
 * Self-gates based on role — renders nothing for platform/community roles.
 * Uses RoleContext and ShellActionsContext — no props needed.
 */
export function SafetyQuickAccess() {
    const router = useRouter();
    const { fullRole, getDashboardPath } = useRole();
    const { openEmergency, openReportsHub } = useShellActions();

    if (!SAFETY_CARD_ROLES.has(fullRole)) return null;

    const showSafeguarding = SAFEGUARDING_STAFF_ROLES.has(fullRole);
    const basePath = getDashboardPath();

    return (
        <div className="ios-card p-0 overflow-hidden">
            <div className="px-4 pt-4 pb-3">
                <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                    Safety & Reports
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                    {/* Report Incident */}
                    <button
                        type="button"
                        onClick={openReportsHub}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border)/0.5)] transition-colors text-left active:scale-[0.97]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-xl text-amber-600 dark:text-amber-400">flag</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))] leading-tight">Report</p>
                            <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-tight mt-0.5">Incident</p>
                        </div>
                    </button>

                    {/* Emergency Contacts */}
                    <button
                        type="button"
                        onClick={openEmergency}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors text-left active:scale-[0.97]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-xl text-white">shield</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-red-700 dark:text-red-300 leading-tight">Emergency</p>
                            <p className="text-[11px] text-red-600/70 dark:text-red-400/70 leading-tight mt-0.5">Contacts</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Safeguarding Queue — staff only */}
            {showSafeguarding && (
                <button
                    type="button"
                    onClick={() => router.push(`${basePath}/safety`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-t border-[hsl(var(--admin-border)/0.3)] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-purple-600 dark:text-purple-400">admin_panel_settings</span>
                    </div>
                    <span className="text-[13px] font-medium text-[hsl(var(--admin-text-main))] flex-1 text-left">Safeguarding Queue</span>
                    <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                </button>
            )}
        </div>
    );
}
