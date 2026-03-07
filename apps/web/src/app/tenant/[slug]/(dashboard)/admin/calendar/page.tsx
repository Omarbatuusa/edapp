'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

const DAY_TYPES = [
    { value: 'school_day', label: 'School Day', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'holiday', label: 'Holiday', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'exam', label: 'Exam', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'admin', label: 'Admin Day', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'half_day', label: 'Half Day', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarDay {
    id: string;
    date: string;
    day_type: string;
    label: string | null;
    academic_year: number;
    term: number | null;
    is_blocked: boolean;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [days, setDays] = useState<CalendarDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [editingDay, setEditingDay] = useState<CalendarDay | null>(null);
    const [formType, setFormType] = useState('school_day');
    const [formLabel, setFormLabel] = useState('');
    const [formTerm, setFormTerm] = useState('1');
    const [saving, setSaving] = useState(false);

    // Fetch tenant ID
    useEffect(() => {
        if (!slug) return;
        fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.id) setTenantId(data.id); })
            .catch(() => {});
    }, [slug]);

    // Fetch calendar days
    const fetchDays = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/calendar?year=${year}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setDays(data.days || []);
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, [tenantId, year]);

    useEffect(() => { fetchDays(); }, [fetchDays]);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = daysInMonth[0]?.getDay() || 0;
    const dayMap = new Map(days.map(d => [d.date, d]));

    const getDayInfo = (date: Date): CalendarDay | undefined => {
        return dayMap.get(formatDate(date));
    };

    const getDayTypeStyle = (type: string) => {
        return DAY_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-600';
    };

    const openModal = (date: Date) => {
        const dateStr = formatDate(date);
        const existing = dayMap.get(dateStr);
        setSelectedDate(dateStr);
        if (existing) {
            setEditingDay(existing);
            setFormType(existing.day_type);
            setFormLabel(existing.label || '');
            setFormTerm(String(existing.term || 1));
        } else {
            setEditingDay(null);
            setFormType('school_day');
            setFormLabel('');
            setFormTerm('1');
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!tenantId) return;
        setSaving(true);
        try {
            if (editingDay) {
                await fetch(`/v1/admin/tenants/${tenantId}/calendar/${editingDay.id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ day_type: formType, label: formLabel || null, term: parseInt(formTerm, 10) }),
                });
            } else {
                await fetch(`/v1/admin/tenants/${tenantId}/calendar`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        date: selectedDate,
                        day_type: formType,
                        label: formLabel || null,
                        academic_year: year,
                        term: parseInt(formTerm, 10),
                    }),
                });
            }
            setModalOpen(false);
            fetchDays();
        } catch { /* ignore */ }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!tenantId || !editingDay) return;
        setSaving(true);
        try {
            await fetch(`/v1/admin/tenants/${tenantId}/calendar/${editingDay.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            setModalOpen(false);
            fetchDays();
        } catch { /* ignore */ }
        setSaving(false);
    };

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    return (
        <div className="app-content-padding space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[hsl(var(--admin-text-main))]">Academic Calendar</h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">Manage school days, holidays, and exams</p>
                </div>
            </div>

            {/* Month navigation */}
            <div className="ios-card p-4">
                <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={prevMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <h2 className="text-lg font-semibold text-[hsl(var(--admin-text-main))]">
                        {MONTHS[month]} {year}
                    </h2>
                    <button type="button" onClick={nextMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {DAY_TYPES.map(t => (
                        <span key={t.value} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${t.color}`}>
                            {t.label}
                        </span>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-px bg-[hsl(var(--admin-border)/0.3)] rounded-xl overflow-hidden">
                    {/* Weekday headers */}
                    {WEEKDAYS.map(wd => (
                        <div key={wd} className="bg-[hsl(var(--admin-surface-alt))] text-center py-2 text-xs font-semibold text-[hsl(var(--admin-text-muted))]">
                            {wd}
                        </div>
                    ))}

                    {/* Empty cells before first day */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-[hsl(var(--admin-background))] min-h-[60px] sm:min-h-[80px]" />
                    ))}

                    {/* Day cells */}
                    {daysInMonth.map(date => {
                        const info = getDayInfo(date);
                        const isToday = formatDate(date) === formatDate(now);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        return (
                            <button
                                type="button"
                                key={date.getDate()}
                                onClick={() => openModal(date)}
                                className={`bg-[hsl(var(--admin-background))] min-h-[60px] sm:min-h-[80px] p-1 text-left hover:bg-[hsl(var(--admin-surface-alt))] transition-colors relative ${isWeekend ? 'opacity-60' : ''}`}
                            >
                                <span className={`text-xs font-medium ${isToday ? 'bg-[hsl(var(--admin-primary))] text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-[hsl(var(--admin-text-main))]'}`}>
                                    {date.getDate()}
                                </span>
                                {info && (
                                    <div className="mt-0.5">
                                        <span className={`text-[9px] sm:text-[10px] font-medium px-1 py-px rounded ${getDayTypeStyle(info.day_type)} block truncate`}>
                                            {info.label || DAY_TYPES.find(t => t.value === info.day_type)?.label}
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {DAY_TYPES.map(t => {
                    const count = days.filter(d => d.day_type === t.value && d.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
                    return (
                        <div key={t.value} className="ios-card p-3 text-center">
                            <div className={`text-2xl font-bold ${t.color.split(' ')[1]}`}>{count}</div>
                            <div className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">{t.label}s</div>
                        </div>
                    );
                })}
            </div>

            {/* Edit modal */}
            {modalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--admin-background))] rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-[hsl(var(--admin-border)/0.5)]">
                            <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))] mb-3" />
                            <div className="flex items-center justify-between w-full">
                                <h2 className="text-lg font-semibold text-[hsl(var(--admin-text-main))]">
                                    {editingDay ? 'Edit Day' : 'Add Day'} — {selectedDate}
                                </h2>
                                <button type="button" onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))]">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--admin-text-main))] mb-1 block">Day Type</label>
                                <select
                                    value={formType}
                                    onChange={e => setFormType(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-background))] text-sm"
                                    aria-label="Day type"
                                >
                                    {DAY_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--admin-text-main))] mb-1 block">Label (optional)</label>
                                <input
                                    type="text"
                                    value={formLabel}
                                    onChange={e => setFormLabel(e.target.value)}
                                    placeholder="e.g. Heritage Day, Mid-year exams"
                                    className="w-full px-3 py-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-background))] text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--admin-text-main))] mb-1 block">Term</label>
                                <select
                                    value={formTerm}
                                    onChange={e => setFormTerm(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-background))] text-sm"
                                    aria-label="Term"
                                >
                                    <option value="1">Term 1</option>
                                    <option value="2">Term 2</option>
                                    <option value="3">Term 3</option>
                                    <option value="4">Term 4</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-xl bg-[hsl(var(--admin-primary))] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                                >
                                    {saving ? 'Saving...' : editingDay ? 'Update' : 'Add Day'}
                                </button>
                                {editingDay && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="px-4 py-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
