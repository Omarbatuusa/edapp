'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// EMERGENCY HUB PAGE — Role-aware emergency hub
// iOS-premium admin design tokens, material-symbols-outlined icons
// ============================================================

interface EmergencyHubPageProps {
    tenantSlug: string;
    tenantId: string;
    role: string;
    basePath: string;
}

interface ActiveEmergency {
    id: string;
    type: string;
    headline: string;
    body?: string;
    severity: string;
    status: string;
    activated_at: string;
    request_safe_confirmation?: boolean;
    request_roll_call?: boolean;
    scope?: string;
    total_acknowledged?: number;
    total_need_help?: number;
    total_in_scope?: number;
    incidents_this_month?: number;
}

interface AlertItem {
    id: string;
    type: string;
    headline: string;
    created_at: string;
}

// --------------- Helpers ---------------

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
    return <span className={`material-symbols-outlined ${className || ''}`} style={style}>{name}</span>;
}

function formatTime(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

function timeAgo(iso: string): string {
    try {
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    } catch {
        return '';
    }
}

// --------------- Role detection ---------------

type RoleView = 'parent' | 'staff' | 'admin';

function detectRoleView(role: string): RoleView {
    const r = role.toLowerCase();
    if (['admin', 'principal', 'smt', 'deputy', 'super_admin', 'platform_super_admin', 'tenant_admin'].some(k => r.includes(k))) return 'admin';
    if (['parent', 'guardian', 'learner', 'student'].some(k => r.includes(k))) return 'parent';
    return 'staff';
}

// --------------- Severity colors ---------------

function severityColor(type: string): { bg: string; text: string; border: string } {
    const t = (type || '').toLowerCase();
    if (t.includes('lockdown') || t.includes('security')) return { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' };
    if (t.includes('evacuation') || t.includes('weather')) return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
    if (t.includes('medical')) return { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' };
    return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function EmergencyHubPage({ tenantSlug, tenantId, role, basePath }: EmergencyHubPageProps) {
    const router = useRouter();
    const roleView = detectRoleView(role);
    const [activeEmergency, setActiveEmergency] = useState<ActiveEmergency | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);

    const fetchEmergency = useCallback(async () => {
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/emergencies?status=ACTIVE`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                const items = Array.isArray(data) ? data : data.data || [];
                setActiveEmergency(items.length > 0 ? items[0] : null);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchEmergency();
    }, [fetchEmergency]);

    // Mock recent alerts
    useEffect(() => {
        setRecentAlerts([
            { id: '1', type: 'DRILL', headline: 'Fire drill completed successfully', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: '2', type: 'WEATHER', headline: 'Weather advisory lifted', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: '3', type: 'TRANSPORT', headline: 'Bus route B delayed 15 min', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
        ]);
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl border p-4 animate-pulse" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                        <div className="h-5 rounded w-1/3 mb-3" style={{ background: 'hsl(var(--admin-surface-alt))' }} />
                        <div className="h-4 rounded w-2/3" style={{ background: 'hsl(var(--admin-surface-alt))' }} />
                    </div>
                ))}
            </div>
        );
    }

    // ---- Parent / Learner view ----
    if (roleView === 'parent') {
        const sev = activeEmergency ? severityColor(activeEmergency.type) : null;
        return (
            <div className="max-w-2xl mx-auto space-y-4 p-4">
                {/* Status card */}
                {activeEmergency ? (
                    <div className={`rounded-2xl border-2 p-5 ${sev!.bg} ${sev!.border}`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sev!.text}`} style={{ background: 'rgba(0,0,0,0.06)' }}>
                                <Icon name="warning" style={{ fontSize: 24 }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold uppercase tracking-wider ${sev!.text}`}>Active Emergency</p>
                                <h2 className="text-lg font-semibold mt-1" style={{ color: 'hsl(var(--admin-text-main))' }}>{activeEmergency.headline}</h2>
                                {activeEmergency.body && (
                                    <p className="text-sm mt-1" style={{ color: 'hsl(var(--admin-text-muted))' }}>{activeEmergency.body}</p>
                                )}
                                <p className="text-xs mt-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                                    Activated {formatTime(activeEmergency.activated_at)}
                                </p>
                            </div>
                        </div>

                        {/* Inline I'm Safe button */}
                        {activeEmergency.request_safe_confirmation && (
                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid hsl(var(--admin-border))' }}>
                                <ImSafeInline tenantId={tenantId} emergencyId={activeEmergency.id} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl border p-5" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                                <Icon name="check_circle" className="text-green-600 dark:text-green-400" style={{ fontSize: 24 }} />
                            </div>
                            <div>
                                <h2 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>No Active Emergency</h2>
                                <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>All clear. Your school is operating normally.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact School */}
                <button
                    onClick={() => router.push(`/tenant/${tenantSlug}/${role}/safety/contact`)}
                    className="w-full rounded-2xl border p-4 flex items-center gap-3 transition-colors hover:opacity-80"
                    style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--admin-primary))', color: '#fff' }}>
                        <Icon name="call" style={{ fontSize: 20 }} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>Contact School</p>
                        <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>Call or message the school office</p>
                    </div>
                    <Icon name="chevron_right" style={{ color: 'hsl(var(--admin-text-muted))', fontSize: 20 }} />
                </button>

                {/* Safety Instructions */}
                <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Icon name="menu_book" style={{ fontSize: 20, color: 'hsl(var(--admin-primary))' }} />
                        <h3 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Safety Instructions</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                        In an emergency, follow the instructions provided by the school. Stay calm and wait for official communication.
                        Do not come to the school unless instructed to do so. Monitor this page and your notifications for updates.
                    </p>
                </div>

                {/* Recent alerts */}
                <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'hsl(var(--admin-text-main))' }}>Recent Alerts</h3>
                    {recentAlerts.length === 0 ? (
                        <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>No recent alerts.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentAlerts.map(alert => (
                                <div key={alert.id} className="flex items-start gap-3">
                                    <Icon name="notifications" style={{ fontSize: 18, color: 'hsl(var(--admin-text-muted))', marginTop: 2 }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm" style={{ color: 'hsl(var(--admin-text-main))' }}>{alert.headline}</p>
                                        <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{timeAgo(alert.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ---- Staff view ----
    if (roleView === 'staff') {
        return (
            <div className="max-w-2xl mx-auto space-y-4 p-4">
                {/* Active emergency banner */}
                {activeEmergency && (
                    <div className={`rounded-2xl border-2 p-5 ${severityColor(activeEmergency.type).bg} ${severityColor(activeEmergency.type).border}`}>
                        <div className="flex items-start gap-3">
                            <Icon name="warning" className={severityColor(activeEmergency.type).text} style={{ fontSize: 24 }} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold uppercase tracking-wider ${severityColor(activeEmergency.type).text}`}>Active Emergency</p>
                                <h2 className="text-lg font-semibold mt-1" style={{ color: 'hsl(var(--admin-text-main))' }}>{activeEmergency.headline}</h2>
                                <p className="text-xs mt-1" style={{ color: 'hsl(var(--admin-text-muted))' }}>Activated {formatTime(activeEmergency.activated_at)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push(`${basePath}/emergencies/${activeEmergency.id}/command`)}
                            className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
                            style={{ background: 'hsl(var(--admin-primary))' }}
                        >
                            View Command Centre
                        </button>
                    </div>
                )}

                {/* Log Incident */}
                <button
                    onClick={() => router.push(`${basePath}/incidents/new`)}
                    className="w-full rounded-2xl border p-4 flex items-center gap-3 transition-colors hover:opacity-80"
                    style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                        <Icon name="edit_note" className="text-amber-600 dark:text-amber-400" style={{ fontSize: 22 }} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>Log Incident</p>
                        <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>Report a safety or behavioural incident</p>
                    </div>
                    <Icon name="chevron_right" style={{ color: 'hsl(var(--admin-text-muted))', fontSize: 20 }} />
                </button>

                {/* Start Roll Call (only if active emergency) */}
                {activeEmergency && (
                    <button
                        onClick={() => router.push(`${basePath}/emergencies/${activeEmergency.id}/roll-call`)}
                        className="w-full rounded-2xl border-2 p-4 flex items-center gap-3 transition-colors hover:opacity-80 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30"
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/40">
                            <Icon name="fact_check" className="text-green-600 dark:text-green-400" style={{ fontSize: 22 }} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>Start Roll Call</p>
                            <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>Mark learner attendance for this emergency</p>
                        </div>
                        <Icon name="chevron_right" style={{ color: 'hsl(var(--admin-text-muted))', fontSize: 20 }} />
                    </button>
                )}

                {/* My Safety Tasks */}
                <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Icon name="task_alt" style={{ fontSize: 20, color: 'hsl(var(--admin-primary))' }} />
                        <h3 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>My Safety Tasks</h3>
                    </div>
                    <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>No tasks assigned. You will be notified when a task requires your attention.</p>
                </div>

                {/* Recent incidents */}
                <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'hsl(var(--admin-text-main))' }}>Recent Incidents</h3>
                    <div className="space-y-3">
                        {recentAlerts.map(alert => (
                            <div key={alert.id} className="flex items-start gap-3">
                                <Icon name="description" style={{ fontSize: 18, color: 'hsl(var(--admin-text-muted))', marginTop: 2 }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm" style={{ color: 'hsl(var(--admin-text-main))' }}>{alert.headline}</p>
                                    <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{timeAgo(alert.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ---- Admin / SMT view ----
    return (
        <div className="max-w-2xl mx-auto space-y-4 p-4">
            {/* Start Emergency */}
            <button
                onClick={() => router.push(`${basePath}/emergencies/new`)}
                className="w-full rounded-2xl p-5 flex items-center gap-4 transition-colors hover:opacity-90 text-white"
                style={{ background: 'hsl(var(--admin-danger))' }}
            >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20">
                    <Icon name="emergency" style={{ fontSize: 28, color: '#fff' }} />
                </div>
                <div className="flex-1 text-left">
                    <p className="font-bold text-lg">Start Emergency</p>
                    <p className="text-sm opacity-90">Broadcast an emergency alert to the school</p>
                </div>
                <Icon name="chevron_right" style={{ fontSize: 24 }} />
            </button>

            {/* Active emergency command preview */}
            {activeEmergency && (
                <div className={`rounded-2xl border-2 p-5 ${severityColor(activeEmergency.type).bg} ${severityColor(activeEmergency.type).border}`}>
                    <div className="flex items-start gap-3 mb-3">
                        <Icon name="crisis_alert" className={severityColor(activeEmergency.type).text} style={{ fontSize: 24 }} />
                        <div className="flex-1">
                            <p className={`text-xs font-bold uppercase tracking-wider ${severityColor(activeEmergency.type).text}`}>Active Emergency</p>
                            <h2 className="text-lg font-semibold mt-1" style={{ color: 'hsl(var(--admin-text-main))' }}>{activeEmergency.headline}</h2>
                            <p className="text-xs mt-1" style={{ color: 'hsl(var(--admin-text-muted))' }}>Activated {formatTime(activeEmergency.activated_at)}</p>
                        </div>
                    </div>

                    {/* Quick ack stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="rounded-xl p-3 text-center bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                            <p className="text-xl font-bold text-green-700 dark:text-green-300">{activeEmergency.total_acknowledged || 0}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">Safe</p>
                        </div>
                        <div className="rounded-xl p-3 text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                            <p className="text-xl font-bold text-red-700 dark:text-red-300">{activeEmergency.total_need_help || 0}</p>
                            <p className="text-xs text-red-600 dark:text-red-400">Need Help</p>
                        </div>
                        <div className="rounded-xl p-3 text-center" style={{ background: 'hsl(var(--admin-surface-alt))', border: '1px solid hsl(var(--admin-border))' }}>
                            <p className="text-xl font-bold" style={{ color: 'hsl(var(--admin-text-main))' }}>{activeEmergency.total_in_scope || 0}</p>
                            <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>Total</p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`${basePath}/emergencies/${activeEmergency.id}/command`)}
                        className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
                        style={{ background: 'hsl(var(--admin-primary))' }}
                    >
                        Open Command Centre
                    </button>
                </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="description" style={{ fontSize: 18, color: 'hsl(var(--admin-primary))' }} />
                        <span className="text-xs font-medium" style={{ color: 'hsl(var(--admin-text-muted))' }}>Incidents This Month</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: 'hsl(var(--admin-text-main))' }}>{activeEmergency?.incidents_this_month ?? 0}</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="crisis_alert" style={{ fontSize: 18, color: 'hsl(var(--admin-danger))' }} />
                        <span className="text-xs font-medium" style={{ color: 'hsl(var(--admin-text-muted))' }}>Active Emergencies</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: activeEmergency ? 'hsl(var(--admin-danger))' : 'hsl(var(--admin-text-main))' }}>
                        {activeEmergency ? 1 : 0}
                    </p>
                </div>
            </div>

            {/* Emergency history */}
            <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Emergency History</h3>
                    <button className="text-sm font-medium" style={{ color: 'hsl(var(--admin-primary))' }}>View All</button>
                </div>
                {recentAlerts.length === 0 ? (
                    <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>No past emergencies recorded.</p>
                ) : (
                    <div className="space-y-3">
                        {recentAlerts.map(alert => (
                            <div key={alert.id} className="flex items-start gap-3 pb-3" style={{ borderBottom: '1px solid hsl(var(--admin-border))' }}>
                                <Icon name="history" style={{ fontSize: 18, color: 'hsl(var(--admin-text-muted))', marginTop: 2 }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{alert.headline}</p>
                                    <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{formatTime(alert.created_at)}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Resolved</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Inline I'm Safe for parent view (small version)
// ============================================================

function ImSafeInline({ tenantId, emergencyId }: { tenantId: string; emergencyId: string }) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed'>('idle');

    const submit = async (safeStatus: 'SAFE' | 'NEED_HELP') => {
        setStatus('submitting');
        try {
            await fetch(`/v1/admin/tenants/${tenantId}/emergencies/${emergencyId}/acknowledgements`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: safeStatus }),
            });
            setStatus('confirmed');
        } catch {
            setStatus('idle');
        }
    };

    if (status === 'confirmed') {
        return (
            <div className="flex items-center gap-2 justify-center py-2">
                <Icon name="check_circle" className="text-green-600 dark:text-green-400" style={{ fontSize: 20 }} />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Response received</span>
            </div>
        );
    }

    if (status === 'submitting') {
        return (
            <div className="flex items-center justify-center py-3">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => submit('SAFE')}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
                I&apos;m Safe
            </button>
            <button
                onClick={() => submit('NEED_HELP')}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 border-orange-400 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
            >
                I Need Help
            </button>
        </div>
    );
}
