'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// INCIDENT REPORT WIZARD — 6-step self-contained wizard
// iOS-premium admin design tokens, material-symbols-outlined icons
// ============================================================

interface IncidentReportWizardProps {
    tenantSlug: string;
    tenantId: string;
    preSelectedCategory?: string;
}

// --------------- Types ---------------

type Category = 'BULLYING' | 'SAFETY' | 'MEDICAL' | 'BEHAVIOUR' | 'DIGITAL' | 'CHILD_PROTECTION';
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type TimeOption = 'NOW' | 'EARLIER_TODAY' | 'YESTERDAY' | 'CHOOSE_DATE';

interface FormData {
    category: Category | '';
    // bullying-specific
    bullying_type: string;
    bullying_patterns: string[];
    wants_counsellor: boolean;
    wants_anonymity: boolean;
    // who & where
    learner_involved: string;
    other_people: string;
    location: string;
    time_option: TimeOption | '';
    chosen_date: string;
    // description
    description: string;
    is_ongoing: boolean;
    threat_of_harm: boolean;
    has_evidence: boolean;
    // severity
    severity: Severity | '';
    // evidence
    files: File[];
}

const INITIAL_FORM: FormData = {
    category: '',
    bullying_type: '',
    bullying_patterns: [],
    wants_counsellor: false,
    wants_anonymity: false,
    learner_involved: '',
    other_people: '',
    location: '',
    time_option: '',
    chosen_date: '',
    description: '',
    is_ongoing: false,
    threat_of_harm: false,
    has_evidence: false,
    severity: '',
    files: [],
};

// --------------- Constants ---------------

const CATEGORIES: { id: Category; label: string; description: string; icon: string; color: string; bgClass: string; subtitle?: string }[] = [
    { id: 'BULLYING', label: 'Bullying / Harassment', description: 'Report bullying, teasing, or harassment', icon: 'shield_with_heart', color: '#ef4444', bgClass: 'bg-red-50 dark:bg-red-950/40' },
    { id: 'SAFETY', label: 'Safety Concern', description: 'Something that could be unsafe', icon: 'warning', color: '#f59e0b', bgClass: 'bg-amber-50 dark:bg-amber-950/40' },
    { id: 'MEDICAL', label: 'Medical / Health', description: 'Health-related incident or concern', icon: 'health_and_safety', color: '#ec4899', bgClass: 'bg-pink-50 dark:bg-pink-950/40' },
    { id: 'BEHAVIOUR', label: 'Behaviour', description: 'Behavioural incident needing attention', icon: 'gavel', color: '#f97316', bgClass: 'bg-orange-50 dark:bg-orange-950/40' },
    { id: 'DIGITAL', label: 'Digital Safety', description: 'Online or device-related concern', icon: 'laptop_chromebook', color: '#3b82f6', bgClass: 'bg-blue-50 dark:bg-blue-950/40' },
    { id: 'CHILD_PROTECTION', label: 'Child Protection', description: 'Safeguarding concern', icon: 'child_care', color: '#8b5cf6', bgClass: 'bg-purple-50 dark:bg-purple-950/40', subtitle: 'Restricted' },
];

const BULLYING_TYPES = ['Verbal', 'Physical', 'Social exclusion', 'Cyberbullying', 'Harassment', 'Extortion', 'Other'];

const BULLYING_PATTERNS = [
    'This has happened before',
    'Same person or group involved',
    'Same location each time',
    'Same time of day',
    'Involves social media',
];

const LOCATIONS = [
    { value: 'CLASSROOM', label: 'Classroom' },
    { value: 'BATHROOM', label: 'Bathroom' },
    { value: 'CORRIDOR', label: 'Corridor' },
    { value: 'GATE', label: 'Gate' },
    { value: 'BUS', label: 'Bus' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'PLAYGROUND', label: 'Playground' },
    { value: 'SPORTS_FIELD', label: 'Sports Field' },
    { value: 'OTHER', label: 'Other' },
];

const SEVERITY_OPTIONS: { value: Severity; label: string; description: string; color: string; bgClass: string }[] = [
    { value: 'LOW', label: 'Low', description: 'Informational / minor concern', color: '#3b82f6', bgClass: 'bg-blue-50 dark:bg-blue-950/40' },
    { value: 'MEDIUM', label: 'Medium', description: 'Needs follow-up within 48 hours', color: '#f59e0b', bgClass: 'bg-amber-50 dark:bg-amber-950/40' },
    { value: 'HIGH', label: 'High', description: 'Urgent — same-day response required', color: '#f97316', bgClass: 'bg-orange-50 dark:bg-orange-950/40' },
    { value: 'CRITICAL', label: 'Critical', description: 'Immediate escalation to safeguarding team', color: '#ef4444', bgClass: 'bg-red-50 dark:bg-red-950/40' },
];

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

export function IncidentReportWizard({ tenantSlug, tenantId, preSelectedCategory }: IncidentReportWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(preSelectedCategory ? 1 : 0);
    const [form, setForm] = useState<FormData>(() => ({
        ...INITIAL_FORM,
        category: (preSelectedCategory as Category) || '',
    }));
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [caseId, setCaseId] = useState('');
    const [error, setError] = useState('');

    const isBullying = form.category === 'BULLYING';

    // Step definitions change based on whether bullying is selected
    const steps = useMemo(() => {
        const base = [
            { key: 'category', title: 'What happened?', subtitle: 'Select the type of incident' },
            ...(isBullying ? [{ key: 'bullying', title: 'Bullying Details', subtitle: 'Help us understand the situation' }] : []),
            { key: 'who_where', title: 'Who & Where', subtitle: 'People and location involved' },
            { key: 'description', title: 'What happened', subtitle: 'Describe the incident in your own words' },
            { key: 'severity', title: 'How serious is this?', subtitle: 'This helps us prioritise the response' },
            { key: 'evidence', title: 'Evidence & Submit', subtitle: 'Attach files and review your report' },
        ];
        return base;
    }, [isBullying]);

    const totalSteps = steps.length;
    const currentStep = steps[step] || steps[0];

    // --------------- Field updaters ---------------

    const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }, []);

    const togglePattern = useCallback((pattern: string) => {
        setForm(prev => ({
            ...prev,
            bullying_patterns: prev.bullying_patterns.includes(pattern)
                ? prev.bullying_patterns.filter(p => p !== pattern)
                : [...prev.bullying_patterns, pattern],
        }));
    }, []);

    // --------------- Validation ---------------

    const canProceed = useMemo(() => {
        switch (currentStep.key) {
            case 'category': return !!form.category;
            case 'bullying': return !!form.bullying_type;
            case 'who_where': return !!form.learner_involved && !!form.location && !!form.time_option && (form.time_option !== 'CHOOSE_DATE' || !!form.chosen_date);
            case 'description': return form.description.trim().length >= 10;
            case 'severity': return !!form.severity;
            case 'evidence': return true;
            default: return false;
        }
    }, [currentStep.key, form]);

    // --------------- Navigation ---------------

    const goNext = useCallback(() => {
        if (step < totalSteps - 1) setStep(s => s + 1);
    }, [step, totalSteps]);

    const goBack = useCallback(() => {
        if (step > 0) setStep(s => s - 1);
    }, [step]);

    // --------------- Submit ---------------

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                category: form.category,
                bullying_type: isBullying ? form.bullying_type : undefined,
                bullying_patterns: isBullying ? form.bullying_patterns : undefined,
                wants_counsellor: isBullying ? form.wants_counsellor : undefined,
                wants_anonymity: isBullying ? form.wants_anonymity : undefined,
                learner_involved: form.learner_involved,
                other_people: form.other_people || undefined,
                location: form.location,
                time_option: form.time_option,
                chosen_date: form.time_option === 'CHOOSE_DATE' ? form.chosen_date : undefined,
                description: form.description,
                is_ongoing: form.is_ongoing,
                threat_of_harm: form.threat_of_harm,
                has_evidence: form.has_evidence,
                severity: form.severity,
            };

            const res = await fetch(`/v1/admin/tenants/${tenantId}/incidents`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || `Server error ${res.status}`);
            }

            const data = await res.json();
            setCaseId(data.case_id || data.id || 'PENDING');
            setSubmitted(true);

            // If files were selected, upload them separately
            if (form.files.length > 0) {
                const fd = new FormData();
                form.files.forEach(f => fd.append('files', f));
                await fetch(`/v1/admin/tenants/${tenantId}/incidents/${data.id || data.case_id}/attachments`, {
                    method: 'POST',
                    headers: { Authorization: getAuthHeaders().Authorization || '' },
                    body: fd,
                }).catch(() => { /* attachment upload is best-effort */ });
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [form, isBullying, tenantId]);

    // --------------- Confirmation screen ---------------

    if (submitted) {
        const expectedTime = form.severity === 'CRITICAL' ? 'Immediately' : form.severity === 'HIGH' ? 'Within 2 hours' : form.severity === 'MEDIUM' ? 'Within 48 hours' : 'Within 5 working days';
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'hsl(var(--admin-background))' }}>
                <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ background: 'hsl(var(--admin-surface))', border: '1px solid hsl(var(--admin-border))' }}>
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Icon name="check_circle" className="text-4xl text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--admin-text-main))' }}>Report Submitted</h2>
                    <p className="text-sm mb-6" style={{ color: 'hsl(var(--admin-text-sub))' }}>
                        Your incident report has been received and will be reviewed by the safeguarding team.
                    </p>
                    <div className="rounded-xl p-4 mb-6" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium" style={{ color: 'hsl(var(--admin-text-muted))' }}>Case Reference</span>
                            <span className="text-sm font-mono font-semibold" style={{ color: 'hsl(var(--admin-primary))' }}>{caseId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium" style={{ color: 'hsl(var(--admin-text-muted))' }}>Expected Response</span>
                            <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{expectedTime}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/tenant/${tenantSlug}/admin/safety`)}
                        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: 'hsl(var(--admin-primary))' }}
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    // --------------- Step Renderers ---------------

    function renderCategoryStep() {
        return (
            <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                    const selected = form.category === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => {
                                updateField('category', cat.id);
                                // Auto-advance after selection
                                setTimeout(() => setStep(1), 200);
                            }}
                            className={`relative rounded-2xl p-4 text-left transition-all ${cat.bgClass} ${selected ? 'ring-2' : 'ring-0'}`}
                            style={{
                                border: `1px solid ${selected ? cat.color : 'hsl(var(--admin-border))'}`,
                            }}
                        >
                            <div
                                className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                                style={{ background: `${cat.color}20` }}
                            >
                                <Icon name={cat.icon} style={{ color: cat.color, fontSize: '22px' }} />
                            </div>
                            <div className="text-sm font-semibold mb-0.5" style={{ color: 'hsl(var(--admin-text-main))' }}>{cat.label}</div>
                            <div className="text-xs leading-snug" style={{ color: 'hsl(var(--admin-text-sub))' }}>{cat.description}</div>
                            {cat.subtitle && (
                                <span
                                    className="absolute top-3 right-3 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                                    style={{ background: `${cat.color}18`, color: cat.color }}
                                >
                                    {cat.subtitle}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    function renderBullyingStep() {
        return (
            <div className="space-y-6">
                {/* Bullying type */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>Type of bullying</label>
                    <div className="space-y-2">
                        {BULLYING_TYPES.map(bt => (
                            <label
                                key={bt}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                                style={{
                                    background: form.bullying_type === bt ? 'hsl(var(--admin-surface-alt))' : 'transparent',
                                    border: `1px solid ${form.bullying_type === bt ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-border))'}`,
                                }}
                            >
                                <input
                                    type="radio"
                                    name="bullying_type"
                                    checked={form.bullying_type === bt}
                                    onChange={() => updateField('bullying_type', bt)}
                                    className="accent-[hsl(var(--admin-primary))]"
                                />
                                <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>{bt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Pattern checkboxes */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>Pattern indicators</label>
                    <div className="space-y-2">
                        {BULLYING_PATTERNS.map(p => (
                            <label
                                key={p}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
                                style={{ border: `1px solid hsl(var(--admin-border))` }}
                            >
                                <input
                                    type="checkbox"
                                    checked={form.bullying_patterns.includes(p)}
                                    onChange={() => togglePattern(p)}
                                    className="accent-[hsl(var(--admin-primary))] h-4 w-4"
                                />
                                <span className="text-sm" style={{ color: 'hsl(var(--admin-text-main))' }}>{p}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Safe reporter message */}
                <div className="rounded-xl p-4 flex gap-3 items-start" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                    <Icon name="volunteer_activism" style={{ color: 'hsl(var(--admin-primary))', fontSize: '20px' }} className="mt-0.5 shrink-0" />
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--admin-text-sub))' }}>
                        <strong style={{ color: 'hsl(var(--admin-text-main))' }}>You did the right thing by reporting.</strong>{' '}
                        Everything you share here will be treated with care and confidentiality.
                    </p>
                </div>

                {/* Counsellor + Anonymity */}
                <div className="space-y-2">
                    <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer" style={{ border: `1px solid hsl(var(--admin-border))` }}>
                        <input type="checkbox" checked={form.wants_counsellor} onChange={() => updateField('wants_counsellor', !form.wants_counsellor)} className="accent-[hsl(var(--admin-primary))] h-4 w-4" />
                        <span className="text-sm" style={{ color: 'hsl(var(--admin-text-main))' }}>I want a counsellor to speak to me</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer" style={{ border: `1px solid hsl(var(--admin-border))` }}>
                        <input type="checkbox" checked={form.wants_anonymity} onChange={() => updateField('wants_anonymity', !form.wants_anonymity)} className="accent-[hsl(var(--admin-primary))] h-4 w-4" />
                        <span className="text-sm" style={{ color: 'hsl(var(--admin-text-main))' }}>I don&apos;t want the other learner to know I reported</span>
                    </label>
                </div>
            </div>
        );
    }

    function renderWhoWhereStep() {
        return (
            <div className="space-y-5">
                {/* Learner involved */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'hsl(var(--admin-text-muted))' }}>Learner involved *</label>
                    <input
                        type="text"
                        placeholder="Full name of the learner"
                        value={form.learner_involved}
                        onChange={e => updateField('learner_involved', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                        style={{
                            background: 'hsl(var(--admin-surface-alt))',
                            border: '1px solid hsl(var(--admin-border))',
                            color: 'hsl(var(--admin-text-main))',
                        }}
                        aria-label="Learner involved"
                    />
                </div>

                {/* Other people */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'hsl(var(--admin-text-muted))' }}>Other people involved (optional)</label>
                    <input
                        type="text"
                        placeholder="Names of witnesses or others involved"
                        value={form.other_people}
                        onChange={e => updateField('other_people', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                        style={{
                            background: 'hsl(var(--admin-surface-alt))',
                            border: '1px solid hsl(var(--admin-border))',
                            color: 'hsl(var(--admin-text-main))',
                        }}
                        aria-label="Other people involved"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'hsl(var(--admin-text-muted))' }}>Location *</label>
                    <select
                        value={form.location}
                        onChange={e => updateField('location', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none"
                        style={{
                            background: 'hsl(var(--admin-surface-alt))',
                            border: '1px solid hsl(var(--admin-border))',
                            color: form.location ? 'hsl(var(--admin-text-main))' : 'hsl(var(--admin-text-muted))',
                        }}
                        aria-label="Location"
                    >
                        <option value="">Select location</option>
                        {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                </div>

                {/* Time */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>When did this happen? *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {([
                            { value: 'NOW', label: 'Just now' },
                            { value: 'EARLIER_TODAY', label: 'Earlier today' },
                            { value: 'YESTERDAY', label: 'Yesterday' },
                            { value: 'CHOOSE_DATE', label: 'Choose date' },
                        ] as { value: TimeOption; label: string }[]).map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => updateField('time_option', opt.value)}
                                className="rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                                style={{
                                    background: form.time_option === opt.value ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-surface-alt))',
                                    color: form.time_option === opt.value ? '#ffffff' : 'hsl(var(--admin-text-main))',
                                    border: `1px solid ${form.time_option === opt.value ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-border))'}`,
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {form.time_option === 'CHOOSE_DATE' && (
                        <input
                            type="date"
                            value={form.chosen_date}
                            onChange={e => updateField('chosen_date', e.target.value)}
                            className="mt-3 w-full rounded-xl px-4 py-3 text-sm outline-none"
                            style={{
                                background: 'hsl(var(--admin-surface-alt))',
                                border: '1px solid hsl(var(--admin-border))',
                                color: 'hsl(var(--admin-text-main))',
                            }}
                            aria-label="Choose date"
                        />
                    )}
                </div>
            </div>
        );
    }

    function renderDescriptionStep() {
        return (
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'hsl(var(--admin-text-muted))' }}>Description *</label>
                    <textarea
                        value={form.description}
                        onChange={e => updateField('description', e.target.value)}
                        placeholder="Tell us what happened (as clearly as you can)."
                        rows={6}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none leading-relaxed"
                        style={{
                            background: 'hsl(var(--admin-surface-alt))',
                            border: '1px solid hsl(var(--admin-border))',
                            color: 'hsl(var(--admin-text-main))',
                        }}
                        aria-label="Incident description"
                    />
                    <p className="mt-1 text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                        {form.description.trim().length < 10 ? `At least 10 characters required (${form.description.trim().length}/10)` : `${form.description.trim().length} characters`}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer" style={{ border: '1px solid hsl(var(--admin-border))' }}>
                        <input type="checkbox" checked={form.is_ongoing} onChange={() => updateField('is_ongoing', !form.is_ongoing)} className="accent-[hsl(var(--admin-primary))] h-4 w-4" />
                        <div>
                            <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>This is ongoing</span>
                            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--admin-text-muted))' }}>The situation is still happening or recurring</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer" style={{ border: '1px solid hsl(var(--admin-border))' }}>
                        <input type="checkbox" checked={form.threat_of_harm} onChange={() => updateField('threat_of_harm', !form.threat_of_harm)} className="accent-[hsl(var(--admin-danger))] h-4 w-4" />
                        <div>
                            <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>There is a threat of harm</span>
                            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--admin-text-muted))' }}>Someone could be in danger</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer" style={{ border: '1px solid hsl(var(--admin-border))' }}>
                        <input type="checkbox" checked={form.has_evidence} onChange={() => updateField('has_evidence', !form.has_evidence)} className="accent-[hsl(var(--admin-primary))] h-4 w-4" />
                        <div>
                            <span className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-main))' }}>I have evidence to attach</span>
                            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--admin-text-muted))' }}>Screenshots, photos, or documents</p>
                        </div>
                    </label>
                </div>
            </div>
        );
    }

    function renderSeverityStep() {
        return (
            <div className="space-y-4">
                {SEVERITY_OPTIONS.map(sev => {
                    const selected = form.severity === sev.value;
                    return (
                        <button
                            key={sev.value}
                            onClick={() => updateField('severity', sev.value)}
                            className={`w-full rounded-2xl p-4 text-left transition-all ${sev.bgClass}`}
                            style={{
                                border: `2px solid ${selected ? sev.color : 'transparent'}`,
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                    style={{ background: `${sev.color}20` }}
                                >
                                    <div className="h-3 w-3 rounded-full" style={{ background: sev.color }} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>{sev.label}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--admin-text-sub))' }}>{sev.description}</div>
                                </div>
                                {selected && (
                                    <Icon name="check_circle" className="ml-auto shrink-0" style={{ color: sev.color, fontSize: '22px' }} />
                                )}
                            </div>
                        </button>
                    );
                })}

                {/* Escalation panel for High / Critical */}
                {(form.severity === 'HIGH' || form.severity === 'CRITICAL') && (
                    <div
                        className="rounded-xl p-4 flex gap-3 items-start mt-2"
                        style={{
                            background: form.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed',
                            border: `1px solid ${form.severity === 'CRITICAL' ? '#fecaca' : '#fed7aa'}`,
                        }}
                    >
                        <Icon
                            name="notification_important"
                            style={{ color: form.severity === 'CRITICAL' ? '#ef4444' : '#f97316', fontSize: '20px' }}
                            className="mt-0.5 shrink-0"
                        />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: form.severity === 'CRITICAL' ? '#991b1b' : '#9a3412' }}>
                                {form.severity === 'CRITICAL' ? 'Immediate Escalation' : 'Urgent Response'}
                            </p>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: form.severity === 'CRITICAL' ? '#b91c1c' : '#c2410c' }}>
                                This will alert the safeguarding team immediately. A designated safeguarding lead will be notified and expected to respond{' '}
                                {form.severity === 'CRITICAL' ? 'within minutes.' : 'the same day.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    function renderEvidenceStep() {
        const categoryObj = CATEGORIES.find(c => c.id === form.category);
        const severityObj = SEVERITY_OPTIONS.find(s => s.value === form.severity);
        const locationObj = LOCATIONS.find(l => l.value === form.location);

        return (
            <div className="space-y-6">
                {/* File upload */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>Attachments (optional)</label>
                    <div
                        className="rounded-xl p-6 text-center cursor-pointer transition-colors hover:opacity-80"
                        style={{
                            background: 'hsl(var(--admin-surface-alt))',
                            border: '2px dashed hsl(var(--admin-border))',
                        }}
                        onClick={() => document.getElementById('incident-file-input')?.click()}
                    >
                        <Icon name="cloud_upload" className="text-3xl mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }} />
                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-sub))' }}>
                            Click to upload or drag files here
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                            Images, PDFs, or documents up to 10MB each
                        </p>
                    </div>
                    <input
                        id="incident-file-input"
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={e => {
                            const newFiles = Array.from(e.target.files || []);
                            updateField('files', [...form.files, ...newFiles]);
                            e.target.value = '';
                        }}
                    />
                    {form.files.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {form.files.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: 'hsl(var(--admin-surface-alt))', border: '1px solid hsl(var(--admin-border))' }}>
                                    <Icon name="attach_file" style={{ fontSize: '16px', color: 'hsl(var(--admin-text-muted))' }} />
                                    <span className="flex-1 truncate" style={{ color: 'hsl(var(--admin-text-main))' }}>{f.name}</span>
                                    <button onClick={() => updateField('files', form.files.filter((_, j) => j !== i))} className="text-xs font-medium" style={{ color: 'hsl(var(--admin-danger))' }}>Remove</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Review summary */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--admin-text-muted))' }}>Report Summary</label>
                    <div className="rounded-xl divide-y" style={{ background: 'hsl(var(--admin-surface-alt))', border: '1px solid hsl(var(--admin-border))' }}>
                        <SummaryRow label="Category" value={categoryObj?.label || form.category} />
                        {isBullying && <SummaryRow label="Bullying Type" value={form.bullying_type} />}
                        {isBullying && form.bullying_patterns.length > 0 && <SummaryRow label="Patterns" value={form.bullying_patterns.join(', ')} />}
                        <SummaryRow label="Learner" value={form.learner_involved} />
                        {form.other_people && <SummaryRow label="Others Involved" value={form.other_people} />}
                        <SummaryRow label="Location" value={locationObj?.label || form.location} />
                        <SummaryRow label="When" value={form.time_option === 'CHOOSE_DATE' ? form.chosen_date : (form.time_option || '').replace(/_/g, ' ').toLowerCase()} />
                        <SummaryRow label="Description" value={form.description.length > 120 ? form.description.slice(0, 120) + '...' : form.description} />
                        {form.is_ongoing && <SummaryRow label="Ongoing" value="Yes" />}
                        {form.threat_of_harm && <SummaryRow label="Threat of Harm" value="Yes" highlight />}
                        <SummaryRow label="Severity" value={severityObj?.label || form.severity} color={severityObj?.color} />
                        {form.files.length > 0 && <SummaryRow label="Attachments" value={`${form.files.length} file(s)`} />}
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl p-3 text-sm" style={{ background: '#fef2f2', color: 'hsl(var(--admin-danger))', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // --------------- Render ---------------

    const progressPercent = ((step + 1) / totalSteps) * 100;

    return (
        <div className="min-h-screen" style={{ background: 'hsl(var(--admin-background))' }}>
            {/* Header bar */}
            <div className="sticky top-0 z-10" style={{ background: 'hsl(var(--admin-surface))', borderBottom: '1px solid hsl(var(--admin-border))' }}>
                {/* Progress bar */}
                <div className="h-1 w-full" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                    <div
                        className="h-full transition-all duration-300 ease-out"
                        style={{
                            width: `${progressPercent}%`,
                            background: 'hsl(var(--admin-primary))',
                            borderRadius: '0 2px 2px 0',
                        }}
                    />
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                    {step > 0 && (
                        <button onClick={goBack} className="flex items-center justify-center h-9 w-9 rounded-xl transition-colors" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                            <Icon name="arrow_back" style={{ fontSize: '20px', color: 'hsl(var(--admin-text-main))' }} />
                        </button>
                    )}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold truncate" style={{ color: 'hsl(var(--admin-text-main))' }}>
                            {currentStep.title}
                        </h1>
                        <p className="text-xs truncate" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                            {currentStep.subtitle}
                        </p>
                    </div>
                    <span className="text-xs font-medium shrink-0 rounded-lg px-2.5 py-1" style={{ background: 'hsl(var(--admin-surface-alt))', color: 'hsl(var(--admin-text-sub))' }}>
                        Step {step + 1} of {totalSteps}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-lg px-4 py-6">
                {currentStep.key === 'category' && renderCategoryStep()}
                {currentStep.key === 'bullying' && renderBullyingStep()}
                {currentStep.key === 'who_where' && renderWhoWhereStep()}
                {currentStep.key === 'description' && renderDescriptionStep()}
                {currentStep.key === 'severity' && renderSeverityStep()}
                {currentStep.key === 'evidence' && renderEvidenceStep()}
            </div>

            {/* Bottom action bar (not shown on category step since it auto-advances) */}
            {currentStep.key !== 'category' && (
                <div
                    className="fixed bottom-0 left-0 right-0 px-4 py-4"
                    style={{
                        background: 'hsl(var(--admin-surface))',
                        borderTop: '1px solid hsl(var(--admin-border))',
                    }}
                >
                    <div className="mx-auto max-w-lg">
                        {currentStep.key === 'evidence' ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: 'hsl(var(--admin-primary))' }}
                            >
                                {submitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="send" style={{ fontSize: '18px' }} />
                                        Submit Report
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={goNext}
                                disabled={!canProceed}
                                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: canProceed ? 'hsl(var(--admin-primary))' : 'hsl(var(--admin-text-muted))' }}
                            >
                                Continue
                                <Icon name="arrow_forward" style={{ fontSize: '18px' }} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --------------- Summary Row ---------------

function SummaryRow({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 px-4 py-2.5">
            <span className="text-xs font-medium shrink-0" style={{ color: 'hsl(var(--admin-text-muted))' }}>{label}</span>
            <span
                className="text-xs text-right font-medium"
                style={{ color: highlight ? 'hsl(var(--admin-danger))' : color || 'hsl(var(--admin-text-main))' }}
            >
                {value}
            </span>
        </div>
    );
}
