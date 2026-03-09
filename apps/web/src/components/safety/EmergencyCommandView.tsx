'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// EMERGENCY COMMAND VIEW — Live emergency command dashboard
// iOS-premium admin design tokens, material-symbols-outlined icons
// ============================================================

interface EmergencyCommandViewProps {
    tenantSlug: string;
    tenantId: string;
    emergencyId: string;
    basePath: string;
}

interface Emergency {
    id: string;
    type: string;
    headline: string;
    body?: string;
    severity: string;
    status: string;
    scope?: string;
    activated_at: string;
    stood_down_at?: string;
    request_safe_confirmation?: boolean;
    request_roll_call?: boolean;
    ack_safe: number;
    ack_need_help: number;
    ack_total: number;
    roll_calls_completed: number;
    roll_calls_total: number;
    tasks: TaskItem[];
    timeline: TimelineEvent[];
}

interface TaskItem {
    id: string;
    title: string;
    assignee?: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';
}

interface TimelineEvent {
    id: string;
    type: string;
    message: string;
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
        return new Date(iso).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

function timeAgo(iso: string): string {
    try {
        const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    } catch {
        return '';
    }
}

function typeColor(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('lockdown') || t.includes('security')) return '#ef4444';
    if (t.includes('evacuation') || t.includes('weather')) return '#f97316';
    if (t.includes('medical')) return '#ec4899';
    return '#f59e0b';
}

function typeIcon(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('lockdown')) return 'lock';
    if (t.includes('evacuation')) return 'directions_run';
    if (t.includes('medical')) return 'medical_services';
    if (t.includes('weather')) return 'thunderstorm';
    if (t.includes('transport')) return 'directions_bus';
    if (t.includes('security')) return 'security';
    if (t.includes('utilities') || t.includes('outage')) return 'power_off';
    return 'warning';
}

const STATUS_PILL: Record<string, { bg: string; text: string; label: string }> = {
    ASSIGNED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Assigned' },
    IN_PROGRESS: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'In Progress' },
    DONE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Done' },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function EmergencyCommandView({ tenantSlug, tenantId, emergencyId, basePath }: EmergencyCommandViewProps) {
    const router = useRouter();
    const [emergency, setEmergency] = useState<Emergency | null>(null);
    const [loading, setLoading] = useState(true);
    const [showStandDownDialog, setShowStandDownDialog] = useState(false);
    const [standingDown, setStandingDown] = useState(false);

    const fetchEmergency = useCallback(async () => {
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/emergencies/${emergencyId}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setEmergency({
                    id: data.id,
                    type: data.type || '',
                    headline: data.headline || '',
                    body: data.body,
                    severity: data.severity || '',
                    status: data.status || 'ACTIVE',
                    scope: data.scope,
                    activated_at: data.activated_at || data.created_at || '',
                    stood_down_at: data.stood_down_at,
                    request_safe_confirmation: data.request_safe_confirmation,
                    request_roll_call: data.request_roll_call,
                    ack_safe: data.ack_safe ?? data.total_acknowledged ?? 0,
                    ack_need_help: data.ack_need_help ?? data.total_need_help ?? 0,
                    ack_total: data.ack_total ?? data.total_in_scope ?? 0,
                    roll_calls_completed: data.roll_calls_completed ?? 0,
                    roll_calls_total: data.roll_calls_total ?? 0,
                    tasks: data.tasks || [],
                    timeline: data.timeline || [],
                });
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [tenantId, emergencyId]);

    // Initial fetch + polling every 10s
    useEffect(() => {
        fetchEmergency();
        const interval = setInterval(fetchEmergency, 10000);
        return () => clearInterval(interval);
    }, [fetchEmergency]);

    const handleStandDown = async () => {
        setStandingDown(true);
        try {
            await fetch(`/v1/admin/tenants/${tenantId}/emergencies/${emergencyId}/stand-down`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });
            await fetchEmergency();
        } catch {
            // silent
        } finally {
            setStandingDown(false);
            setShowStandDownDialog(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-2xl border p-4 animate-pulse" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                        <div className="h-5 rounded w-1/3 mb-3" style={{ background: 'hsl(var(--admin-surface-alt))' }} />
                        <div className="h-4 rounded w-2/3" style={{ background: 'hsl(var(--admin-surface-alt))' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (!emergency) {
        return (
            <div className="max-w-2xl mx-auto p-4 text-center py-20">
                <Icon name="error_outline" style={{ fontSize: 48, color: 'hsl(var(--admin-text-muted))' }} />
                <p className="mt-3 font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>Emergency not found</p>
                <button onClick={() => router.back()} className="mt-4 text-sm font-medium" style={{ color: 'hsl(var(--admin-primary))' }}>Go back</button>
            </div>
        );
    }

    const color = typeColor(emergency.type);
    const ackPercent = emergency.ack_total > 0 ? Math.round((emergency.ack_safe / emergency.ack_total) * 100) : 0;
    const rollPercent = emergency.roll_calls_total > 0 ? Math.round((emergency.roll_calls_completed / emergency.roll_calls_total) * 100) : 0;
    const isStoodDown = emergency.status === 'STOOD_DOWN' || emergency.status === 'RESOLVED';

    return (
        <div className="max-w-2xl mx-auto space-y-4 p-4">
            {/* 1. Emergency banner */}
            <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: color }}>
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: color }}>
                    <Icon name={typeIcon(emergency.type)} style={{ fontSize: 22, color: '#fff' }} />
                    <div className="flex-1">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{emergency.type.replace(/_/g, ' ')}</span>
                    </div>
                    {isStoodDown && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">STOOD DOWN</span>
                    )}
                </div>
                <div className="p-4" style={{ background: 'hsl(var(--admin-surface))' }}>
                    <h2 className="text-lg font-bold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>{emergency.headline}</h2>
                    {emergency.body && <p className="text-sm mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>{emergency.body}</p>}
                    <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>Activated {formatTime(emergency.activated_at)}</p>

                    {!isStoodDown && (
                        <button
                            onClick={() => setShowStandDownDialog(true)}
                            className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors"
                            style={{ borderColor: 'hsl(var(--admin-danger))', color: 'hsl(var(--admin-danger))' }}
                        >
                            Stand Down Emergency
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Acknowledgement counters */}
            <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="how_to_reg" style={{ fontSize: 20, color: 'hsl(var(--admin-primary))' }} />
                    <h3 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Acknowledgements</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="rounded-xl p-3 text-center bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{emergency.ack_safe}</p>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">Safe</p>
                    </div>
                    <div className="rounded-xl p-3 text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{emergency.ack_need_help}</p>
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">Need Help</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: 'hsl(var(--admin-surface-alt))', border: '1px solid hsl(var(--admin-border))' }}>
                        <p className="text-2xl font-bold" style={{ color: 'hsl(var(--admin-text-main))' }}>{emergency.ack_total}</p>
                        <p className="text-xs font-medium" style={{ color: 'hsl(var(--admin-text-muted))' }}>Total</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${ackPercent}%` }} />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: 'hsl(var(--admin-text-muted))' }}>{ackPercent}% confirmed safe</p>
            </div>

            {/* 3. Roll call status */}
            <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Icon name="fact_check" style={{ fontSize: 20, color: 'hsl(var(--admin-primary))' }} />
                        <h3 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Roll Call Status</h3>
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                        {emergency.roll_calls_completed} of {emergency.roll_calls_total}
                    </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${rollPercent}%`, background: 'hsl(var(--admin-primary))' }} />
                </div>
                {emergency.roll_calls_total === 0 ? (
                    <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>No roll calls requested for this emergency.</p>
                ) : (
                    <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                        {rollPercent}% of classes have completed their roll call.
                    </p>
                )}
            </div>

            {/* 4. Tasks board */}
            <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Icon name="task_alt" style={{ fontSize: 20, color: 'hsl(var(--admin-primary))' }} />
                        <h3 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Tasks</h3>
                    </div>
                    {!isStoodDown && (
                        <button className="text-sm font-medium" style={{ color: 'hsl(var(--admin-primary))' }}>Add Task</button>
                    )}
                </div>
                {emergency.tasks.length === 0 ? (
                    <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>No tasks created yet.</p>
                ) : (
                    <div className="space-y-2">
                        {emergency.tasks.map(task => {
                            const pill = STATUS_PILL[task.status] || STATUS_PILL.ASSIGNED;
                            return (
                                <div key={task.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                                    <Icon name={task.status === 'DONE' ? 'check_circle' : 'radio_button_unchecked'} style={{ fontSize: 20, color: task.status === 'DONE' ? '#22c55e' : 'hsl(var(--admin-text-muted))' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{task.title}</p>
                                        {task.assignee && <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{task.assignee}</p>}
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pill.bg} ${pill.text}`}>{pill.label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 5. Timeline */}
            <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="timeline" style={{ fontSize: 20, color: 'hsl(var(--admin-primary))' }} />
                    <h3 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Timeline</h3>
                </div>
                {emergency.timeline.length === 0 ? (
                    <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>No events recorded yet.</p>
                ) : (
                    <div className="space-y-0">
                        {emergency.timeline.map((event, idx) => (
                            <div key={event.id} className="flex gap-3">
                                {/* Vertical line */}
                                <div className="flex flex-col items-center">
                                    <div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ background: idx === 0 ? color : 'hsl(var(--admin-border))' }} />
                                    {idx < emergency.timeline.length - 1 && (
                                        <div className="w-px flex-1 my-1" style={{ background: 'hsl(var(--admin-border))' }} />
                                    )}
                                </div>
                                <div className="pb-4 flex-1 min-w-0">
                                    <p className="text-sm" style={{ color: 'hsl(var(--admin-text-main))' }}>{event.message}</p>
                                    <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{timeAgo(event.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stand Down confirmation dialog */}
            {showStandDownDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'hsl(var(--admin-surface))' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                                <Icon name="front_hand" className="text-amber-600 dark:text-amber-400" style={{ fontSize: 26 }} />
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--admin-text-main))' }}>Stand Down?</h3>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                            This will mark the emergency as resolved and notify all users that the situation is under control. Are you sure?
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={handleStandDown}
                                disabled={standingDown}
                                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-50 bg-amber-600 hover:bg-amber-700"
                            >
                                {standingDown ? 'Standing down...' : 'Yes, Stand Down'}
                            </button>
                            <button
                                onClick={() => setShowStandDownDialog(false)}
                                disabled={standingDown}
                                className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
                                style={{ color: 'hsl(var(--admin-text-muted))' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
