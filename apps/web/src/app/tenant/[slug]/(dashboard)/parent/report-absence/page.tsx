'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_CHILDREN } from '@/lib/parent';

export default function ReportAbsencePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [selectedChild, setSelectedChild] = useState('');
    const [absenceDate, setAbsenceDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const REASONS = [
        { value: 'illness', label: 'Illness / Medical', icon: 'medical_services' },
        { value: 'family', label: 'Family Emergency', icon: 'family_restroom' },
        { value: 'appointment', label: 'Medical Appointment', icon: 'event' },
        { value: 'religious', label: 'Religious Observance', icon: 'mosque' },
        { value: 'travel', label: 'Travel / Holiday', icon: 'flight' },
        { value: 'other', label: 'Other', icon: 'more_horiz' },
    ];

    const handleSubmit = () => {
        if (!selectedChild || !reason) return;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="app-content-padding max-w-lg mx-auto">
                <div className="ios-card text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                    </div>
                    <h2 className="text-xl font-bold text-[hsl(var(--admin-text-main))] mb-2">Absence Reported</h2>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))] mb-6">
                        The school has been notified. You will receive a confirmation shortly.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push(`/tenant/${slug}/parent`)}
                        className="px-6 py-3 rounded-xl bg-[hsl(var(--admin-primary))] text-white font-semibold text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-content-padding max-w-lg mx-auto space-y-4">
            <div>
                <h1 className="text-xl font-bold text-[hsl(var(--admin-text-main))]">Report Absence</h1>
                <p className="text-sm text-[hsl(var(--admin-text-sub))]">Notify the school about your child&apos;s absence</p>
            </div>

            {/* Select Child */}
            <div className="ios-card space-y-3">
                <label className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">Select Child</label>
                <div className="grid grid-cols-1 gap-2">
                    {MOCK_CHILDREN.map(child => (
                        <button
                            key={child.id}
                            type="button"
                            onClick={() => setSelectedChild(child.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                selectedChild === child.id
                                    ? 'border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.05)]'
                                    : 'border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-border))]'
                            }`}
                        >
                            <img
                                src={child.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&size=40&background=6366f1&color=fff`}
                                alt={child.name}
                                className="w-10 h-10 rounded-xl object-cover"
                            />
                            <div className="text-left">
                                <p className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">{child.name}</p>
                                <p className="text-xs text-[hsl(var(--admin-text-sub))]">{child.grade} &bull; {child.class}</p>
                            </div>
                            {selectedChild === child.id && (
                                <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] ml-auto">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dates */}
            <div className="ios-card space-y-3">
                <label className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">Absence Date(s)</label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-[hsl(var(--admin-text-sub))] mb-1 block">Start Date</label>
                        <input
                            type="date"
                            value={absenceDate}
                            onChange={e => setAbsenceDate(e.target.value)}
                            aria-label="Start date"
                            className="w-full px-3 py-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-background))] text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[hsl(var(--admin-text-sub))] mb-1 block">End Date (optional)</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            aria-label="End date"
                            className="w-full px-3 py-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-background))] text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Reason */}
            <div className="ios-card space-y-3">
                <label className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">Reason</label>
                <div className="grid grid-cols-2 gap-2">
                    {REASONS.map(r => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setReason(r.value)}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                                reason === r.value
                                    ? 'border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.05)]'
                                    : 'border-[hsl(var(--admin-border))]'
                            }`}
                        >
                            <span className={`material-symbols-outlined text-lg ${reason === r.value ? 'text-[hsl(var(--admin-primary))]' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                                {r.icon}
                            </span>
                            <span className="text-xs font-medium text-[hsl(var(--admin-text-main))]">{r.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className="ios-card space-y-3">
                <label className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">Additional Notes (optional)</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any additional details for the school..."
                    rows={3}
                    className="w-full px-3 py-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-background))] text-sm resize-none"
                />
            </div>

            {/* Submit */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedChild || !reason}
                className="w-full py-3.5 rounded-xl bg-[hsl(var(--admin-primary))] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
                Submit Absence Report
            </button>
        </div>
    );
}
