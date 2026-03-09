'use client';

import React, { useState, useCallback } from 'react';

// ============================================================
// ROLL CALL UI — Staff roll call interface during emergencies
// iOS-premium admin design tokens, material-symbols-outlined icons
// ============================================================

interface RollCallUIProps {
    tenantSlug: string;
    tenantId: string;
    emergencyId: string;
}

type LearnerStatus = 'UNMARKED' | 'PRESENT_SAFE' | 'MISSING' | 'INJURED';

interface LearnerEntry {
    id: string;
    name: string;
    status: LearnerStatus;
    note: string;
    showNote: boolean;
}

// --------------- Mock data ---------------

const MOCK_LEARNERS: { id: string; name: string }[] = [
    { id: '1', name: 'Amahle Dlamini' },
    { id: '2', name: 'Bongani Khumalo' },
    { id: '3', name: 'Chantelle van Wyk' },
    { id: '4', name: 'David Naidoo' },
    { id: '5', name: 'Erin September' },
    { id: '6', name: 'Fikile Mthembu' },
    { id: '7', name: 'Grace Molefe' },
    { id: '8', name: 'Hassan Patel' },
    { id: '9', name: 'Itumeleng Modise' },
    { id: '10', name: 'Jessica Botha' },
    { id: '11', name: 'Kabelo Maseko' },
    { id: '12', name: 'Lerato Mokoena' },
    { id: '13', name: 'Mandla Zulu' },
    { id: '14', name: 'Nompumelelo Ndlovu' },
    { id: '15', name: 'Oscar Fourie' },
    { id: '16', name: 'Palesa Mahlangu' },
    { id: '17', name: 'Quinton Williams' },
    { id: '18', name: 'Refilwe Tshabalala' },
    { id: '19', name: 'Sipho Ngcobo' },
    { id: '20', name: 'Thandi Cele' },
];

// --------------- Helpers ---------------

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
    return <span className={`material-symbols-outlined ${className || ''}`} style={style}>{name}</span>;
}

function getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function RollCallUI({ tenantSlug, tenantId, emergencyId }: RollCallUIProps) {
    const [learners, setLearners] = useState<LearnerEntry[]>(
        MOCK_LEARNERS.map(l => ({ ...l, status: 'UNMARKED' as LearnerStatus, note: '', showNote: false }))
    );
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const updateLearner = useCallback((id: string, updates: Partial<LearnerEntry>) => {
        setLearners(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }, []);

    const totalMarked = learners.filter(l => l.status !== 'UNMARKED').length;
    const totalSafe = learners.filter(l => l.status === 'PRESENT_SAFE').length;
    const totalMissing = learners.filter(l => l.status === 'MISSING').length;
    const totalInjured = learners.filter(l => l.status === 'INJURED').length;
    const allMarked = totalMarked === learners.length;

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await fetch(`/v1/admin/tenants/${tenantId}/emergencies/${emergencyId}/roll-calls`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    entries: learners.map(l => ({
                        learner_id: l.id,
                        status: l.status,
                        note: l.note || undefined,
                    })),
                }),
            });
            setSubmitted(true);
        } catch {
            // silent
        } finally {
            setSubmitting(false);
        }
    };

    // --------------- Success ---------------

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'hsl(var(--admin-surface))' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 mb-6">
                    <Icon name="check_circle" className="text-green-600 dark:text-green-400" style={{ fontSize: 48 }} />
                </div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--admin-text-main))' }}>Roll Call Submitted</h1>
                <p className="text-center mb-6" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                    {totalSafe} safe, {totalMissing} missing, {totalInjured} injured
                </p>
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
                    <div className="rounded-xl p-3 text-center bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                        <p className="text-xl font-bold text-green-700 dark:text-green-300">{totalSafe}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Safe</p>
                    </div>
                    <div className="rounded-xl p-3 text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <p className="text-xl font-bold text-red-700 dark:text-red-300">{totalMissing}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Missing</p>
                    </div>
                    <div className="rounded-xl p-3 text-center bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{totalInjured}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">Injured</p>
                    </div>
                </div>
                <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>The command centre has been updated.</p>
            </div>
        );
    }

    // --------------- Main UI ---------------

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--admin-surface))' }}>
            {/* Header */}
            <header className="sticky top-0 z-20 px-4 py-3" style={{ background: 'hsl(var(--admin-surface))', borderBottom: '1px solid hsl(var(--admin-border))' }}>
                <div className="flex items-center gap-3 mb-2">
                    <Icon name="fact_check" style={{ fontSize: 22, color: 'hsl(var(--admin-primary))' }} />
                    <div className="flex-1">
                        <h1 className="font-semibold" style={{ color: 'hsl(var(--admin-text-main))' }}>Emergency Roll Call</h1>
                        <p className="text-xs" style={{ color: 'hsl(var(--admin-text-muted))' }}>{totalMarked} of {learners.length} marked</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--admin-surface-alt))' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(totalMarked / learners.length) * 100}%`, background: allMarked ? '#22c55e' : 'hsl(var(--admin-primary))' }} />
                </div>
                {/* Quick stats */}
                <div className="flex gap-4 mt-2">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">{totalSafe} safe</span>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">{totalMissing} missing</span>
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{totalInjured} injured</span>
                </div>
            </header>

            {/* Learner grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full">
                {learners.map(learner => (
                    <div
                        key={learner.id}
                        className="rounded-2xl border p-4 transition-all"
                        style={{
                            borderColor: learner.status === 'MISSING' ? '#ef4444' : learner.status === 'INJURED' ? '#f97316' : learner.status === 'PRESENT_SAFE' ? '#22c55e' : 'hsl(var(--admin-border))',
                            background: 'hsl(var(--admin-surface))',
                        }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            {/* Avatar */}
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    background: learner.status === 'PRESENT_SAFE' ? '#dcfce7' : learner.status === 'MISSING' ? '#fee2e2' : learner.status === 'INJURED' ? '#ffedd5' : 'hsl(var(--admin-surface-alt))',
                                    color: learner.status === 'PRESENT_SAFE' ? '#16a34a' : learner.status === 'MISSING' ? '#dc2626' : learner.status === 'INJURED' ? '#ea580c' : 'hsl(var(--admin-text-muted))',
                                }}
                            >
                                {getInitials(learner.name)}
                            </div>
                            <p className="flex-1 font-medium text-sm" style={{ color: 'hsl(var(--admin-text-main))' }}>{learner.name}</p>
                            {/* Note toggle */}
                            <button
                                onClick={() => updateLearner(learner.id, { showNote: !learner.showNote })}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
                                style={{ background: 'hsl(var(--admin-surface-alt))' }}
                                aria-label="Add note"
                            >
                                <Icon name="edit_note" style={{ fontSize: 18, color: 'hsl(var(--admin-text-muted))' }} />
                            </button>
                        </div>

                        {/* Status buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => updateLearner(learner.id, { status: 'PRESENT_SAFE' })}
                                className={`py-2 rounded-xl text-xs font-semibold transition-all border-2 ${learner.status === 'PRESENT_SAFE' ? 'bg-green-600 text-white border-green-600' : 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'}`}
                            >
                                Present & Safe
                            </button>
                            <button
                                onClick={() => updateLearner(learner.id, { status: 'MISSING' })}
                                className={`py-2 rounded-xl text-xs font-semibold transition-all border-2 ${learner.status === 'MISSING' ? 'bg-red-600 text-white border-red-600' : 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'}`}
                            >
                                Missing
                            </button>
                            <button
                                onClick={() => updateLearner(learner.id, { status: 'INJURED' })}
                                className={`py-2 rounded-xl text-xs font-semibold transition-all border-2 ${learner.status === 'INJURED' ? 'bg-orange-600 text-white border-orange-600' : 'border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'}`}
                            >
                                Injured
                            </button>
                        </div>

                        {/* Note input */}
                        {learner.showNote && (
                            <div className="mt-3">
                                <input
                                    type="text"
                                    value={learner.note}
                                    onChange={e => updateLearner(learner.id, { note: e.target.value })}
                                    placeholder="Optional note..."
                                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                                    style={{ background: 'hsl(var(--admin-surface-alt))', border: '1px solid hsl(var(--admin-border))', color: 'hsl(var(--admin-text-main))' }}
                                    aria-label={`Note for ${learner.name}`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom action bar */}
            <div className="sticky bottom-0 px-4 py-4" style={{ background: 'hsl(var(--admin-surface))', borderTop: '1px solid hsl(var(--admin-border))' }}>
                <button
                    onClick={handleSubmit}
                    disabled={!allMarked || submitting}
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-colors disabled:opacity-40"
                    style={{ background: allMarked ? '#22c55e' : 'hsl(var(--admin-text-muted))' }}
                >
                    {submitting ? 'Submitting...' : allMarked ? 'Submit Roll Call' : `Mark all learners (${learners.length - totalMarked} remaining)`}
                </button>
            </div>
        </div>
    );
}
