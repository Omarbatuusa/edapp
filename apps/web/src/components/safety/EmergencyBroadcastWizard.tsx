'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// EMERGENCY BROADCAST WIZARD — 5-step emergency broadcast
// iOS-premium admin design tokens, material-symbols-outlined icons
// ============================================================

interface EmergencyBroadcastWizardProps {
    tenantSlug: string;
    tenantId: string;
}

// --------------- Types ---------------

type EmergencyType = 'LOCKDOWN' | 'EVACUATION' | 'MEDICAL' | 'SEVERE_WEATHER' | 'TRANSPORT' | 'SECURITY_ALERT' | 'UTILITIES_OUTAGE';
type Scope = 'WHOLE_SCHOOL' | 'CAMPUS' | 'PHASE_GRADE' | 'STAFF_ONLY';

interface FormData {
    type: EmergencyType | '';
    scope: Scope | '';
    headline: string;
    body: string;
    request_safe_confirmation: boolean;
    request_roll_call: boolean;
    channels: { in_app: boolean; push: boolean; sms: boolean; email: boolean };
}

const INITIAL_FORM: FormData = {
    type: '',
    scope: '',
    headline: '',
    body: '',
    request_safe_confirmation: false,
    request_roll_call: false,
    channels: { in_app: true, push: false, sms: false, email: false },
};

// --------------- Constants ---------------

const EMERGENCY_TYPES: { id: EmergencyType; label: string; icon: string; color: string; bgClass: string }[] = [
    { id: 'LOCKDOWN', label: 'Lockdown', icon: 'lock', color: '#ef4444', bgClass: 'bg-red-50 dark:bg-red-950/40' },
    { id: 'EVACUATION', label: 'Evacuation', icon: 'directions_run', color: '#f97316', bgClass: 'bg-orange-50 dark:bg-orange-950/40' },
    { id: 'MEDICAL', label: 'Medical', icon: 'medical_services', color: '#ec4899', bgClass: 'bg-pink-50 dark:bg-pink-950/40' },
    { id: 'SEVERE_WEATHER', label: 'Severe Weather', icon: 'thunderstorm', color: '#3b82f6', bgClass: 'bg-blue-50 dark:bg-blue-950/40' },
    { id: 'TRANSPORT', label: 'Transport', icon: 'directions_bus', color: '#f59e0b', bgClass: 'bg-amber-50 dark:bg-amber-950/40' },
    { id: 'SECURITY_ALERT', label: 'Security Alert', icon: 'security', color: '#8b5cf6', bgClass: 'bg-purple-50 dark:bg-purple-950/40' },
    { id: 'UTILITIES_OUTAGE', label: 'Utilities Outage', icon: 'power_off', color: '#6b7280', bgClass: 'bg-gray-50 dark:bg-gray-950/40' },
];

const SCOPE_OPTIONS: { id: Scope; label: string; description: string; icon: string }[] = [
    { id: 'WHOLE_SCHOOL', label: 'Whole School', description: 'All staff, learners, and parents', icon: 'domain' },
    { id: 'CAMPUS', label: 'Campus / Branch', description: 'A specific campus or branch only', icon: 'location_city' },
    { id: 'PHASE_GRADE', label: 'Phase / Grade', description: 'Specific phase or grade group', icon: 'school' },
    { id: 'STAFF_ONLY', label: 'Staff Only', description: 'Internal staff communication only', icon: 'badge' },
];

const STEPS = ['Type', 'Scope', 'Message', 'Channels', 'Confirm'];

// --------------- Helpers ---------------

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
    return <span className={`material-symbols-outlined ${className || ''}`} style={style}>{name}</span>;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function EmergencyBroadcastWizard({ tenantSlug, tenantId }: EmergencyBroadcastWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormData>({ ...INITIAL_FORM });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [emergencyId, setEmergencyId] = useState('');
    const [error, setError] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const totalSteps = STEPS.length;
    const progress = ((step + 1) / totalSteps) * 100;

    const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }, []);

    // --------------- Validation ---------------

    const canProceed = useMemo(() => {
        switch (step) {
            case 0: return form.type !== '';
            case 1: return form.scope !== '';
            case 2: return form.headline.trim().length >= 5;
            case 3: return true; // channels always valid (in_app is forced on)
            case 4: return true;
            default: return false;
        }
    }, [step, form]);

    // --------------- Submit ---------------

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            // Create draft
            const createRes = await fetch(`/v1/admin/tenants/${tenantId}/emergencies`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    type: form.type,
                    scope: form.scope,
                    headline: form.headline,
                    body: form.body,
                    request_safe_confirmation: form.request_safe_confirmation,
                    request_roll_call: form.request_roll_call,
                    channels: form.channels,
                    status: 'DRAFT',
                }),
            });

            if (!createRes.ok) throw new Error('Failed to create emergency');
            const created = await createRes.json();
            const id = created.id || created.data?.id;

            // Activate
            const activateRes = await fetch(`/v1/admin/tenants/${tenantId}/emergencies/${id}/activate`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });

            if (!activateRes.ok) throw new Error('Failed to activate emergency');

            setEmergencyId(id);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    // --------------- Navigation ---------------

    const goBack = () => {
        if (step === 0) {
            router.back();
        } else {
            setStep(s => s - 1);
        }
    };

    const goNext = () => {
        if (step < totalSteps - 1) {
            setStep(s => s + 1);
        }
    };

    // --------------- Success screen ---------------

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'hsl(var(--admin-surface))' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'hsl(var(--admin-danger))', color: '#fff' }}>
                    <Icon name="campaign" style={{ fontSize: 40 }} />
                </div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--admin-text-main))' }}>Emergency Activated</h1>
                <p className="text-center mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                    The emergency broadcast has been sent to all users in scope.
                </p>
                <p className="text-sm font-mono px-3 py-1 rounded-lg mb-8" style={{ background: 'hsl(var(--admin-surface-alt))', color: 'hsl(var(--admin-text-muted))' }}>
                    ID: {emergencyId}
                </p>
                <button
                    onClick={() => router.push(`/tenant/${tenantSlug}/admin/safety/emergencies/${emergencyId}/command`)}
                    className="w-full max-w-xs py-3 rounded-2xl font-semibold text-white transition-colors"
                    style={{ background: 'hsl(var(--admin-primary))' }}
                >
                    Open Command Centre
                </button>
                <button
                    onClick={() => router.back()}
                    className="mt-3 text-sm font-medium"
                    style={{ color: 'hsl(var(--admin-primary))' }}
                >
                    Back to Safety Hub
                </button>
            </div>
        );
    }

    // --------------- Wizard chrome ---------------

    const selectedType = EMERGENCY_TYPES.find(t => t.id === form.type);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--admin-surface))' }}>
            {/* Header */}
            <header className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3" style={{ background: 'hsl(var(--admin-surface))', borderBottom: '1px solid hsl(var(--admin-border))' }}>
                <button onClick={goBack} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                    <Icon name="arrow_back" style={{ fontSize: 20, color: 'hsl(var(--admin-text-main))' }} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Emergency Broadcast</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>Step {step + 1} of {totalSteps} &mdash; {STEPS[step]}</p>
                </div>
            </header>

            {/* Progress bar */}
            <div className="h-1 w-full" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: 'hsl(var(--admin-danger))' }} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
                {error && (
                    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 mb-4 flex items-start gap-2">
                        <Icon name="error" className="text-red-600 dark:text-red-400" style={{ fontSize: 18, marginTop: 1 }} />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Step 0: Type */}
                {step === 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>What type of emergency?</h2>
                        <p className="text-sm mb-4" style={{ color: 'hsl(var(--admin-text-muted))' }}>Select the emergency category to broadcast.</p>
                        <div className="grid grid-cols-2 gap-3">
                            {EMERGENCY_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => updateField('type', t.id)}
                                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 text-center transition-all ${form.type === t.id ? 'ring-2 ring-offset-2' : ''} ${t.bgClass}`}
                                    style={{
                                        borderColor: form.type === t.id ? t.color : 'hsl(var(--admin-border))',
                                        // @ts-expect-error ring color handled by className
                                        '--tw-ring-color': t.color,
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${t.color}20` }}>
                                        <Icon name={t.icon} style={{ fontSize: 26, color: t.color }} />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1: Scope */}
                {step === 1 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>Who should receive this?</h2>
                        <p className="text-sm mb-4" style={{ color: 'hsl(var(--admin-text-muted))' }}>Choose the scope of the broadcast.</p>
                        <div className="space-y-3">
                            {SCOPE_OPTIONS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => updateField('scope', s.id)}
                                    className="w-full rounded-2xl border-2 p-4 flex items-center gap-4 text-left transition-all"
                                    style={{
                                        borderColor: form.scope === s.id ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-border))',
                                        background: form.scope === s.id ? 'hsl(var(--admin-surface-alt))' : 'hsl(var(--admin-surface))',
                                    }}
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                                        <Icon name={s.icon} style={{ fontSize: 22, color: form.scope === s.id ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-text-muted))' }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{s.label}</p>
                                        <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>{s.description}</p>
                                    </div>
                                    {form.scope === s.id && (
                                        <Icon name="check_circle" style={{ fontSize: 22, color: 'hsl(var(--admin-primary))' }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Message */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>Compose Message</h2>
                        <p className="text-sm mb-4" style={{ color: 'hsl(var(--admin-text-muted))' }}>Write the alert headline and optional details.</p>

                        {/* Headline */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>Headline</label>
                                <span className="text-xs" style={{ color: form.headline.length > 80 ? 'hsl(var(--admin-danger))' : 'hsl(var(--admin-text-muted))' }}>
                                    {form.headline.length}/80
                                </span>
                            </div>
                            <input
                                type="text"
                                value={form.headline}
                                onChange={e => { if (e.target.value.length <= 80) updateField('headline', e.target.value); }}
                                placeholder="e.g. Lockdown in progress — stay in classrooms"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                                style={{ background: 'hsl(var(--admin-surface-alt))', border: '1px solid hsl(var(--admin-border))', color: 'hsl(var(--admin-text-main))' }}
                                aria-label="Emergency headline"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="text-sm font-medium block mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>Details (optional)</label>
                            <textarea
                                value={form.body}
                                onChange={e => updateField('body', e.target.value)}
                                placeholder="Additional information for recipients..."
                                rows={4}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
                                style={{ background: 'hsl(var(--admin-surface-alt))', border: '1px solid hsl(var(--admin-border))', color: 'hsl(var(--admin-text-main))' }}
                                aria-label="Emergency details"
                            />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3 pt-2">
                            <ToggleRow
                                label="Request I'm Safe confirmation"
                                description="Ask parents/learners to confirm they are safe"
                                checked={form.request_safe_confirmation}
                                onChange={v => updateField('request_safe_confirmation', v)}
                            />
                            <ToggleRow
                                label="Request staff roll call"
                                description="Ask teachers to complete a class roll call"
                                checked={form.request_roll_call}
                                onChange={v => updateField('request_roll_call', v)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Channels */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>Notification Channels</h2>
                        <p className="text-sm mb-4" style={{ color: 'hsl(var(--admin-text-muted))' }}>Choose how the alert is delivered.</p>

                        <div className="space-y-3">
                            <ChannelRow icon="phone_iphone" label="In-app notification" checked={true} disabled description="Always enabled" />
                            <ChannelRow
                                icon="notifications_active"
                                label="Push notification"
                                checked={form.channels.push}
                                onChange={v => updateField('channels', { ...form.channels, push: v })}
                                description="Send push to all mobile devices"
                            />
                            <ChannelRow icon="sms" label="SMS" checked={false} disabled description="Coming soon" />
                            <ChannelRow icon="email" label="Email" checked={false} disabled description="Coming soon" />
                        </div>
                    </div>
                )}

                {/* Step 4: Preview + Confirm */}
                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>Review & Activate</h2>
                        <p className="text-sm mb-4" style={{ color: 'hsl(var(--admin-text-muted))' }}>Preview what users will see, then activate.</p>

                        {/* Preview card */}
                        <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: selectedType?.color || 'hsl(var(--admin-border))' }}>
                            <div className="px-4 py-3 flex items-center gap-3" style={{ background: selectedType?.color || '#ef4444' }}>
                                <Icon name={selectedType?.icon || 'warning'} style={{ fontSize: 22, color: '#fff' }} />
                                <span className="text-sm font-bold text-white uppercase tracking-wider">{selectedType?.label || 'Emergency'} Alert</span>
                            </div>
                            <div className="p-4" style={{ background: 'hsl(var(--admin-surface))' }}>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>{form.headline}</h3>
                                {form.body && <p className="text-sm mb-3" style={{ color: 'hsl(var(--admin-text-muted))' }}>{form.body}</p>}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-full" style={{ background: 'hsl(var(--admin-surface-alt))', color: 'hsl(var(--admin-text-muted))' }}>
                                        {SCOPE_OPTIONS.find(s => s.id === form.scope)?.label}
                                    </span>
                                    {form.request_safe_confirmation && (
                                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">I&apos;m Safe requested</span>
                                    )}
                                    {form.request_roll_call && (
                                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Roll call requested</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface-alt))' }}>
                            <SummaryRow label="Type" value={selectedType?.label || ''} />
                            <SummaryRow label="Scope" value={SCOPE_OPTIONS.find(s => s.id === form.scope)?.label || ''} />
                            <SummaryRow label="Channels" value={['In-app', form.channels.push ? 'Push' : ''].filter(Boolean).join(', ')} />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-4 py-4 space-y-2" style={{ background: 'hsl(var(--admin-surface))', borderTop: '1px solid hsl(var(--admin-border))' }}>
                {step < totalSteps - 1 ? (
                    <button
                        onClick={goNext}
                        disabled={!canProceed}
                        className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-colors disabled:opacity-40"
                        style={{ background: canProceed ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-text-muted))' }}
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-colors disabled:opacity-50"
                        style={{ background: 'hsl(var(--admin-danger))' }}
                    >
                        {submitting ? 'Activating...' : 'Activate Emergency'}
                    </button>
                )}
            </div>

            {/* Confirmation dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'hsl(var(--admin-surface))' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--admin-danger))', color: '#fff' }}>
                                <Icon name="warning" style={{ fontSize: 26 }} />
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--admin-text-main))' }}>Are you sure?</h3>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                            This will broadcast an emergency alert to all users in scope. This action cannot be undone — the emergency can only be stood down after activation.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-50"
                                style={{ background: 'hsl(var(--admin-danger))' }}
                            >
                                {submitting ? 'Activating...' : 'Yes, Activate Emergency'}
                            </button>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={submitting}
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

// ============================================================
// Sub-components
// ============================================================

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}>
            <div className="flex-1 mr-3">
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{label}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-7 rounded-full relative transition-colors ${checked ? '' : ''}`}
                style={{ background: checked ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-surface-alt))' }}
                role="switch"
                aria-checked={checked}
                aria-label={label}
            >
                <span
                    className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform"
                    style={{ left: checked ? 'calc(100% - 26px)' : '2px' }}
                />
            </button>
        </div>
    );
}

function ChannelRow({ icon, label, checked, onChange, disabled, description }: { icon: string; label: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; description?: string }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-2xl border p-4 ${disabled ? 'opacity-50' : ''}`}
            style={{ borderColor: 'hsl(var(--admin-border))', background: 'hsl(var(--admin-surface))' }}
        >
            <Icon name={icon} style={{ fontSize: 22, color: 'hsl(var(--admin-text-muted))' }} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{label}</p>
                {description && <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{description}</p>}
            </div>
            <button
                onClick={() => !disabled && onChange?.(!checked)}
                disabled={disabled}
                className="w-12 h-7 rounded-full relative transition-colors"
                style={{ background: checked ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-surface-alt))' }}
                role="switch"
                aria-checked={checked}
                aria-label={label}
            >
                <span
                    className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform"
                    style={{ left: checked ? 'calc(100% - 26px)' : '2px' }}
                />
            </button>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>{label}</span>
            <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{value}</span>
        </div>
    );
}
