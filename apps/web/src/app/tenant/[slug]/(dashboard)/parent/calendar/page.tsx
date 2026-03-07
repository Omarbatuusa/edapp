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

export default function ParentCalendarPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [days, setDays] = useState<CalendarDay[]>([]);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    useEffect(() => {
        if (!slug) return;
        fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.id) setTenantId(data.id); })
            .catch(() => {});
    }, [slug]);

    const fetchDays = useCallback(async () => {
        if (!tenantId) return;
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/calendar?year=${year}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setDays(data.days || []);
            }
        } catch { /* ignore */ }
    }, [tenantId, year]);

    useEffect(() => { fetchDays(); }, [fetchDays]);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = daysInMonth[0]?.getDay() || 0;
    const dayMap = new Map(days.map(d => [d.date, d]));

    const getDayTypeStyle = (type: string) => DAY_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-600';
    const getDayTypeLabel = (type: string) => DAY_TYPES.find(t => t.value === type)?.label || type;

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    // Upcoming events (next 14 days)
    const today = new Date();
    const upcoming = days
        .filter(d => {
            const dd = new Date(d.date);
            const diff = (dd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 14 && d.day_type !== 'school_day';
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    return (
        <div className="app-content-padding max-w-3xl mx-auto space-y-4">
            <div>
                <h1 className="text-xl font-bold text-[hsl(var(--admin-text-main))]">School Calendar</h1>
                <p className="text-sm text-[hsl(var(--admin-text-sub))]">View school days, holidays, and events</p>
            </div>

            {/* Upcoming Events */}
            {upcoming.length > 0 && (
                <div className="ios-card">
                    <h3 className="text-sm font-semibold text-[hsl(var(--admin-text-main))] mb-3">Upcoming</h3>
                    <div className="space-y-2">
                        {upcoming.map(evt => (
                            <div key={evt.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[hsl(var(--admin-background))]">
                                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-[hsl(var(--admin-primary))]">
                                        {new Date(evt.date).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[hsl(var(--admin-text-main))] truncate">
                                        {evt.label || getDayTypeLabel(evt.day_type)}
                                    </p>
                                    <p className="text-xs text-[hsl(var(--admin-text-sub))]">
                                        {new Date(evt.date).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getDayTypeStyle(evt.day_type)}`}>
                                    {getDayTypeLabel(evt.day_type)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar */}
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
                        <span key={t.value} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${t.color}`}>
                            {t.label}
                        </span>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-px bg-[hsl(var(--admin-border)/0.3)] rounded-xl overflow-hidden">
                    {WEEKDAYS.map(wd => (
                        <div key={wd} className="bg-[hsl(var(--admin-surface-alt))] text-center py-2 text-xs font-semibold text-[hsl(var(--admin-text-muted))]">
                            {wd}
                        </div>
                    ))}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-[hsl(var(--admin-background))] min-h-[52px] sm:min-h-[68px]" />
                    ))}
                    {daysInMonth.map(date => {
                        const dateStr = formatDate(date);
                        const info = dayMap.get(dateStr);
                        const isToday = dateStr === formatDate(now);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        return (
                            <button
                                type="button"
                                key={date.getDate()}
                                onClick={() => info && setSelectedDay(info)}
                                className={`bg-[hsl(var(--admin-background))] min-h-[52px] sm:min-h-[68px] p-1 text-left hover:bg-[hsl(var(--admin-surface-alt))] transition-colors relative ${isWeekend ? 'opacity-60' : ''}`}
                            >
                                <span className={`text-xs font-medium ${isToday ? 'bg-[hsl(var(--admin-primary))] text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-[hsl(var(--admin-text-main))]'}`}>
                                    {date.getDate()}
                                </span>
                                {info && (
                                    <div className="mt-0.5">
                                        <span className={`text-[8px] sm:text-[10px] font-medium px-1 py-px rounded ${getDayTypeStyle(info.day_type)} block truncate`}>
                                            {info.label || getDayTypeLabel(info.day_type)}
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DAY_TYPES.map(t => {
                    const count = days.filter(d => d.day_type === t.value && d.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
                    return (
                        <div key={t.value} className="ios-card p-3 text-center">
                            <div className={`text-xl font-bold ${t.color.split(' ')[1]}`}>{count}</div>
                            <div className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-0.5">{t.label}s</div>
                        </div>
                    );
                })}
            </div>

            {/* Day Detail Modal */}
            {selectedDay && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--admin-background))] rounded-t-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
                        <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))] mx-auto mb-4" />
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getDayTypeStyle(selectedDay.day_type)}`}>
                                {getDayTypeLabel(selectedDay.day_type)}
                            </span>
                            {selectedDay.term && (
                                <span className="text-xs text-[hsl(var(--admin-text-sub))]">Term {selectedDay.term}</span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-[hsl(var(--admin-text-main))]">
                            {selectedDay.label || getDayTypeLabel(selectedDay.day_type)}
                        </h3>
                        <p className="text-sm text-[hsl(var(--admin-text-sub))] mt-1">
                            {new Date(selectedDay.date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedDay(null)}
                            className="w-full mt-6 py-3 rounded-xl bg-[hsl(var(--admin-primary))] text-white font-semibold text-sm"
                        >
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
