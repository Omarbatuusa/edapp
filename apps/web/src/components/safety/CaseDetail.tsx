'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// CASE DETAIL - Incident / safeguarding case detail view
// iOS-premium admin design tokens
// ============================================================

interface CaseDetailProps {
    tenantSlug: string;
    tenantId: string;
    incidentId: string;
    basePath: string;
}

interface InvestigationNote {
    id: string;
    author: string;
    timestamp: string;
    text: string;
}

interface InvolvedPerson {
    id: string;
    name: string;
    role?: string;
}

interface Attachment {
    id: string;
    filename: string;
    mime_type: string;
    url: string;
}

interface Incident {
    id: string;
    case_number: string;
    status: string;
    category: string;
    category_label: string;
    severity: string;
    confidentiality_level: string;
    incident_date: string;
    incident_time: string;
    location: string;
    time_context: string;
    description: string;
    is_ongoing: boolean;
    has_threat_of_harm: boolean;
    bullying_type?: string;
    bullying_pattern_indicators?: string[];
    involved_learners: InvolvedPerson[];
    other_people_involved: string;
    reporter_type: string;
    has_evidence: boolean;
    attachments: Attachment[];
    notes: InvestigationNote[];
    assigned_to?: string;
    outcome?: string;
}

// --------------- helpers ---------------

const CARD = 'bg-[hsl(var(--admin-surface))] rounded-2xl border border-[hsl(var(--admin-border)/0.5)] p-4';
const SECTION_TITLE = 'text-xs font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-3';

const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ACKNOWLEDGED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    INVESTIGATING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    ESCALATED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    CLOSED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

const SEVERITY_COLORS: Record<string, string> = {
    LOW: 'border-l-green-500',
    MEDIUM: 'border-l-amber-500',
    HIGH: 'border-l-orange-500',
    CRITICAL: 'border-l-red-600',
};

const CATEGORY_ICONS: Record<string, string> = {
    BULLYING: 'group_off',
    UNSAFE: 'warning',
    MEDICAL: 'medical_services',
    COUNSELLING: 'psychology',
    INCIDENT: 'shield',
    OTHER: 'report',
};

const CONFIDENTIALITY_COLORS: Record<string, string> = {
    STANDARD: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    SENSITIVE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    RESTRICTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function formatDateTime(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function mimeIcon(mime: string): string {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'videocam';
    if (mime.includes('pdf')) return 'picture_as_pdf';
    return 'attach_file';
}

// --------------- component ---------------

export function CaseDetail({ tenantSlug, tenantId, incidentId, basePath }: CaseDetailProps) {
    const router = useRouter();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Investigation note form
    const [noteText, setNoteText] = useState('');
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [submittingNote, setSubmittingNote] = useState(false);

    // Action modals
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignInput, setAssignInput] = useState('');
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [outcomeInput, setOutcomeInput] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // ---- data fetching ----

    const fetchIncident = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/v1/admin/tenants/${tenantId}/incidents/${incidentId}`);
            if (!res.ok) throw new Error(`Failed to load incident (${res.status})`);
            const data = await res.json();
            setIncident(data);
            setError(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load incident');
        } finally {
            setLoading(false);
        }
    }, [tenantId, incidentId]);

    useEffect(() => {
        fetchIncident();
    }, [fetchIncident]);

    // ---- actions ----

    const patchIncident = async (body: Record<string, unknown>) => {
        const res = await fetch(`/v1/admin/tenants/${tenantId}/incidents/${incidentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Action failed (${res.status})`);
        return res.json();
    };

    const handleAcknowledge = async () => {
        setActionLoading('acknowledge');
        try {
            await patchIncident({ status: 'ACKNOWLEDGED' });
            await fetchIncident();
        } catch { /* silently handled by UI state */ }
        setActionLoading(null);
    };

    const handleAssign = async () => {
        if (!assignInput.trim()) return;
        setActionLoading('assign');
        try {
            await patchIncident({ assigned_to: assignInput.trim() });
            setShowAssignModal(false);
            setAssignInput('');
            await fetchIncident();
        } catch { /* silently handled */ }
        setActionLoading(null);
    };

    const handleEscalate = async () => {
        setActionLoading('escalate');
        try {
            await patchIncident({ status: 'ESCALATED' });
            await fetchIncident();
        } catch { /* silently handled */ }
        setActionLoading(null);
    };

    const handleClose = async () => {
        if (!outcomeInput.trim()) return;
        setActionLoading('close');
        try {
            await patchIncident({ status: 'CLOSED', outcome: outcomeInput.trim() });
            setShowCloseModal(false);
            setOutcomeInput('');
            await fetchIncident();
        } catch { /* silently handled */ }
        setActionLoading(null);
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        setSubmittingNote(true);
        try {
            const res = await fetch(
                `/v1/admin/tenants/${tenantId}/incidents/${incidentId}/notes`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: noteText.trim() }),
                },
            );
            if (!res.ok) throw new Error('Failed to add note');
            setNoteText('');
            setShowNoteForm(false);
            await fetchIncident();
        } catch { /* silently handled */ }
        setSubmittingNote(false);
    };

    // ---- loading / error states ----

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-3 border-[hsl(var(--admin-primary))] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !incident) {
        return (
            <div className="app-content-padding max-w-2xl mx-auto pt-8">
                <div className={`${CARD} text-center py-12`}>
                    <span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] mb-3 block">
                        error_outline
                    </span>
                    <p className="text-[hsl(var(--admin-text-sub))] mb-4">{error || 'Incident not found'}</p>
                    <button
                        type="button"
                        onClick={() => router.push(`${basePath}/safety`)}
                        className="px-6 py-2.5 rounded-xl bg-[hsl(var(--admin-primary))] text-white text-sm font-semibold"
                    >
                        Back to Safety
                    </button>
                </div>
            </div>
        );
    }

    // ---- render ----

    const statusClass = STATUS_COLORS[incident.status] || STATUS_COLORS.SUBMITTED;
    const severityBorder = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.LOW;
    const categoryIcon = CATEGORY_ICONS[incident.category] || CATEGORY_ICONS.OTHER;
    const confidentialityClass = CONFIDENTIALITY_COLORS[incident.confidentiality_level] || CONFIDENTIALITY_COLORS.STANDARD;

    return (
        <div className="min-h-screen bg-[hsl(var(--admin-bg))] pb-28">
            {/* ========== 1. Sticky Header ========== */}
            <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[hsl(var(--admin-surface))] border-b border-[hsl(var(--admin-border)/0.5)] backdrop-blur-md">
                <button
                    type="button"
                    onClick={() => router.push(`${basePath}/safety`)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[hsl(var(--admin-border)/0.3)] transition-colors -ml-1"
                    aria-label="Back to safety"
                >
                    <span className="material-symbols-outlined text-[22px] text-[hsl(var(--admin-text-main))]">
                        arrow_back
                    </span>
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-[17px] font-bold text-[hsl(var(--admin-text-main))] truncate">
                        {incident.case_number}
                    </h1>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusClass}`}>
                    {incident.status.replace(/_/g, ' ')}
                </span>
            </header>

            <div className="app-content-padding max-w-2xl mx-auto space-y-4 pt-4">
                {/* ========== 2. Summary Card ========== */}
                <div className={`${CARD} border-l-4 ${severityBorder}`}>
                    <p className={SECTION_TITLE}>Summary</p>

                    {/* Category */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))]">
                            {categoryIcon}
                        </span>
                        <span className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))]">
                            {incident.category_label || incident.category}
                        </span>
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-3 text-[13px]">
                        <div>
                            <span className="text-[hsl(var(--admin-text-muted))] block mb-0.5">Severity</span>
                            <span className="font-medium text-[hsl(var(--admin-text-main))]">{incident.severity}</span>
                        </div>
                        <div>
                            <span className="text-[hsl(var(--admin-text-muted))] block mb-0.5">Confidentiality</span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${confidentialityClass}`}>
                                {incident.confidentiality_level}
                            </span>
                        </div>
                        <div>
                            <span className="text-[hsl(var(--admin-text-muted))] block mb-0.5">Date / Time</span>
                            <span className="font-medium text-[hsl(var(--admin-text-main))]">
                                {formatDate(incident.incident_date)}{' '}
                                {incident.incident_time && `at ${incident.incident_time}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-[hsl(var(--admin-text-muted))] block mb-0.5">Location</span>
                            <span className="font-medium text-[hsl(var(--admin-text-main))]">{incident.location || '---'}</span>
                        </div>
                    </div>

                    {incident.time_context && (
                        <div className="mt-3 text-xs text-[hsl(var(--admin-text-sub))]">
                            <span className="material-symbols-outlined text-[14px] align-middle mr-1">schedule</span>
                            {incident.time_context}
                        </div>
                    )}
                </div>

                {/* ========== 3. Description Card ========== */}
                <div className={CARD}>
                    <p className={SECTION_TITLE}>What happened</p>
                    <p className="text-[14px] leading-relaxed text-[hsl(var(--admin-text-main))] whitespace-pre-wrap">
                        {incident.description}
                    </p>

                    {(incident.is_ongoing || incident.has_threat_of_harm) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {incident.is_ongoing && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                    <span className="material-symbols-outlined text-[14px]">autorenew</span>
                                    Ongoing
                                </span>
                            )}
                            {incident.has_threat_of_harm && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                    <span className="material-symbols-outlined text-[14px]">dangerous</span>
                                    Threat of harm
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ========== 4. Bullying Details Card (conditional) ========== */}
                {incident.category === 'BULLYING' && (
                    <div className={CARD}>
                        <p className={SECTION_TITLE}>Bullying Details</p>

                        {incident.bullying_type && (
                            <div className="mb-3">
                                <span className="text-[13px] text-[hsl(var(--admin-text-muted))]">Type</span>
                                <p className="text-[14px] font-medium text-[hsl(var(--admin-text-main))] mt-0.5">
                                    {incident.bullying_type}
                                </p>
                            </div>
                        )}

                        {incident.bullying_pattern_indicators && incident.bullying_pattern_indicators.length > 0 && (
                            <div>
                                <span className="text-[13px] text-[hsl(var(--admin-text-muted))] block mb-2">
                                    Pattern indicators
                                </span>
                                <div className="space-y-1.5">
                                    {incident.bullying_pattern_indicators.map((indicator) => (
                                        <div key={indicator} className="flex items-center gap-2 text-[13px] text-[hsl(var(--admin-text-main))]">
                                            <span className="material-symbols-outlined text-[16px] text-green-600 dark:text-green-400">
                                                check_circle
                                            </span>
                                            {indicator}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== 5. People Involved Card ========== */}
                <div className={CARD}>
                    <p className={SECTION_TITLE}>People Involved</p>

                    {/* Involved learners */}
                    {incident.involved_learners && incident.involved_learners.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[13px] text-[hsl(var(--admin-text-muted))] block mb-2">Learners</span>
                            <div className="space-y-2">
                                {incident.involved_learners.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-[hsl(var(--admin-bg))]"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--admin-primary)/0.12)] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))]">
                                                person
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[hsl(var(--admin-text-main))] truncate">
                                                {person.name}
                                            </p>
                                            {person.role && (
                                                <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">{person.role}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other people */}
                    {incident.other_people_involved && (
                        <div className="mb-3">
                            <span className="text-[13px] text-[hsl(var(--admin-text-muted))] block mb-1">Other people</span>
                            <p className="text-[13px] text-[hsl(var(--admin-text-main))]">{incident.other_people_involved}</p>
                        </div>
                    )}

                    {/* Reporter type */}
                    {incident.reporter_type && (
                        <div>
                            <span className="text-[13px] text-[hsl(var(--admin-text-muted))] block mb-1">Reporter type</span>
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                {incident.reporter_type}
                            </span>
                        </div>
                    )}
                </div>

                {/* ========== 6. Evidence Card (conditional) ========== */}
                {incident.has_evidence && incident.attachments && incident.attachments.length > 0 && (
                    <div className={CARD}>
                        <p className={SECTION_TITLE}>Evidence</p>
                        <div className="space-y-2">
                            {incident.attachments.map((att) => (
                                <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-bg))] hover:bg-[hsl(var(--admin-border)/0.3)] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))]">
                                        {mimeIcon(att.mime_type)}
                                    </span>
                                    <span className="flex-1 text-[13px] font-medium text-[hsl(var(--admin-text-main))] truncate">
                                        {att.filename}
                                    </span>
                                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">
                                        download
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========== 7. Investigation Notes Card ========== */}
                <div className={CARD}>
                    <div className="flex items-center justify-between mb-3">
                        <p className={`${SECTION_TITLE} mb-0`}>Investigation Notes</p>
                        {!showNoteForm && (
                            <button
                                type="button"
                                onClick={() => setShowNoteForm(true)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.08)] hover:bg-[hsl(var(--admin-primary)/0.15)] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Add Note
                            </button>
                        )}
                    </div>

                    {/* Note add form */}
                    {showNoteForm && (
                        <div className="mb-4 p-3 rounded-xl bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border)/0.5)]">
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add investigation note..."
                                rows={3}
                                className="w-full bg-transparent text-[13px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] resize-none focus:outline-none"
                                aria-label="Investigation note"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowNoteForm(false); setNoteText(''); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border)/0.3)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddNote}
                                    disabled={submittingNote || !noteText.trim()}
                                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[hsl(var(--admin-primary))] text-white disabled:opacity-50 transition-colors"
                                >
                                    {submittingNote ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notes timeline */}
                    {incident.notes && incident.notes.length > 0 ? (
                        <div className="space-y-3">
                            {incident.notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:bg-[hsl(var(--admin-primary)/0.5)]"
                                >
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <span className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">
                                            {note.author}
                                        </span>
                                        <span className="text-[11px] text-[hsl(var(--admin-text-muted))]">
                                            {formatDateTime(note.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-[13px] leading-relaxed text-[hsl(var(--admin-text-sub))]">
                                        {note.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[13px] text-[hsl(var(--admin-text-muted))] italic">
                            No investigation notes yet.
                        </p>
                    )}
                </div>
            </div>

            {/* ========== 8. Actions Bar (fixed bottom) ========== */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-[hsl(var(--admin-surface))] border-t border-[hsl(var(--admin-border)/0.5)] px-4 py-3 backdrop-blur-md">
                <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto">
                    {incident.status === 'SUBMITTED' && (
                        <button
                            type="button"
                            onClick={handleAcknowledge}
                            disabled={actionLoading === 'acknowledge'}
                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[18px]">task_alt</span>
                            {actionLoading === 'acknowledge' ? 'Saving...' : 'Acknowledge'}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowAssignModal(true)}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Assign
                    </button>

                    <button
                        type="button"
                        onClick={handleEscalate}
                        disabled={actionLoading === 'escalate'}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[18px]">priority_high</span>
                        {actionLoading === 'escalate' ? 'Saving...' : 'Escalate'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowCloseModal(true)}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Close
                    </button>
                </div>
            </div>

            {/* ========== Assign Modal ========== */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className={`${CARD} w-full max-w-md shadow-xl`}>
                        <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] mb-1">
                            Assign Case
                        </h3>
                        <p className="text-[13px] text-[hsl(var(--admin-text-sub))] mb-4">
                            Enter the staff member ID or name to assign this case to.
                        </p>
                        <input
                            type="text"
                            value={assignInput}
                            onChange={(e) => setAssignInput(e.target.value)}
                            placeholder="Staff ID or name"
                            className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-bg))] text-[13px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary)/0.3)]"
                            aria-label="Staff ID or name"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => { setShowAssignModal(false); setAssignInput(''); }}
                                className="px-4 py-2 rounded-xl text-[13px] font-medium text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border)/0.3)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAssign}
                                disabled={actionLoading === 'assign' || !assignInput.trim()}
                                className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[hsl(var(--admin-primary))] text-white disabled:opacity-50 transition-colors"
                            >
                                {actionLoading === 'assign' ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== Close / Outcome Modal ========== */}
            {showCloseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className={`${CARD} w-full max-w-md shadow-xl`}>
                        <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] mb-1">
                            Close Case
                        </h3>
                        <p className="text-[13px] text-[hsl(var(--admin-text-sub))] mb-4">
                            Select or describe the outcome before closing.
                        </p>

                        {/* Quick outcome options */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {['Resolved', 'No further action', 'Referred externally', 'Disciplinary action taken'].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setOutcomeInput(opt)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        outcomeInput === opt
                                            ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300'
                                            : 'border-[hsl(var(--admin-border)/0.5)] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border)/0.2)]'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={outcomeInput}
                            onChange={(e) => setOutcomeInput(e.target.value)}
                            placeholder="Or describe the outcome..."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-bg))] text-[13px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary)/0.3)]"
                            aria-label="Outcome description"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => { setShowCloseModal(false); setOutcomeInput(''); }}
                                className="px-4 py-2 rounded-xl text-[13px] font-medium text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border)/0.3)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={actionLoading === 'close' || !outcomeInput.trim()}
                                className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-green-600 text-white disabled:opacity-50 transition-colors"
                            >
                                {actionLoading === 'close' ? 'Closing...' : 'Close Case'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
