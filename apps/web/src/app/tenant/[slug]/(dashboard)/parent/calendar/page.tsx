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
        <div className="app-content-padding max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight">School Calendar</h1>
                <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))] mt-1">View school days, holidays, and events</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar — takes 2 cols on desktop */}
                <div className="lg:col-span-2">
                    <div className="ios-card">
                        <div className="flex items-center justify-between mb-5">
                            <button type="button" onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <h2 className="text-xl font-bold text-[hsl(var(--admin-text-main))] tracking-tight">
                                {MONTHS[month]} {year}
                            </h2>
                            <button type="button" onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {DAY_TYPES.map(t => (
                                <span key={t.value} className={`text-xs font-semibold px-3 py-1 rounded-full ${t.color}`}>
                                    {t.label}
                                </span>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-7 gap-px bg-[hsl(var(--admin-border)/0.3)] rounded-xl overflow-hidden">
                            {WEEKDAYS.map(wd => (
                                <div key={wd} className="bg-[hsl(var(--admin-surface-alt))] text-center py-2.5 text-sm font-semibold text-[hsl(var(--admin-text-muted))]">
                                    {wd}
                                </div>
                            ))}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-[hsl(var(--admin-background))] min-h-[64px] sm:min-h-[80px]" />
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
                                        className={`bg-[hsl(var(--admin-background))] min-h-[64px] sm:min-h-[80px] p-1.5 text-left hover:bg-[hsl(var(--admin-surface-alt))] transition-colors relative ${isWeekend ? 'opacity-60' : ''}`}
                                    >
                                        <span className={`text-sm font-medium ${isToday ? 'bg-[hsl(var(--admin-primary))] text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-[hsl(var(--admin-text-main))]'}`}>
                                            {date.getDate()}
                                        </span>
                                        {info && (
                                            <div className="mt-1">
                                                <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded ${getDayTypeStyle(info.day_type)} block truncate`}>
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
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-6">
                        {DAY_TYPES.map(t => {
                            const count = days.filter(d => d.day_type === t.value && d.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
                            return (
                                <div key={t.value} className="ios-card p-4 text-center">
                                    <div className={`text-2xl font-bold ${t.color.split(' ')[1]}`}>{count}</div>
                                    <div className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-1 font-medium">{t.label}s</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar — Upcoming Events */}
                <div className="space-y-6">
                    <div className="ios-card">
                        <h3 className="font-semibold text-lg text-[hsl(var(--admin-text-main))] mb-4 tracking-tight">Upcoming Events</h3>
                        {upcoming.length > 0 ? (
                            <div className="space-y-3">
                                {upcoming.map(evt => (
                                    <div key={evt.id} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-background))]">
                                        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-[hsl(var(--admin-primary))]">
                                                {new Date(evt.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[hsl(var(--admin-text-main))] truncate">
                                                {evt.label || getDayTypeLabel(evt.day_type)}
                                            </p>
                                            <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">
                                                {new Date(evt.date).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getDayTypeStyle(evt.day_type)}`}>
                                            {getDayTypeLabel(evt.day_type)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[hsl(var(--admin-text-muted))]">No upcoming events in the next 2 weeks.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Day Detail Modal */}
            {selectedDay && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--admin-background))] rounded-t-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
                        <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))] mx-auto mb-5" />
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${getDayTypeStyle(selectedDay.day_type)}`}>
                                {getDayTypeLabel(selectedDay.day_type)}
                            </span>
                            {selectedDay.term && (
                                <span className="text-sm text-[hsl(var(--admin-text-sub))]">Term {selectedDay.term}</span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-[hsl(var(--admin-text-main))]">
                            {selectedDay.label || getDayTypeLabel(selectedDay.day_type)}
                        </h3>
                        <p className="text-[15px] text-[hsl(var(--admin-text-sub))] mt-1">
                            {new Date(selectedDay.date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedDay(null)}
                            className="w-full mt-8 py-3.5 rounded-xl bg-[hsl(var(--admin-primary))] text-white font-semibold text-sm"
                        >
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
