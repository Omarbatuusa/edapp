'use client';

import { useState, useMemo } from 'react';
import { getWeekDates, formatDate, WEEKDAYS_FULL, type CalendarEvent, EVENT_COLORS } from '@/lib/calendar-events';

interface WeeklyPlannerProps {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onAddClick?: (date: string) => void;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 07:00 – 17:00

export function WeeklyPlanner({ events = [], onEventClick, onAddClick }: WeeklyPlannerProps) {
    const now = new Date();
    const todayStr = formatDate(now);
    const [weekOffset, setWeekOffset] = useState(0);

    const refDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + weekOffset * 7);
        return d;
    }, [weekOffset]);

    const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);
    const [selectedDay, setSelectedDay] = useState(todayStr);

    const dayEvents = useMemo(() => {
        return events
            .filter(e => e.date === selectedDay)
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    }, [events, selectedDay]);

    const allDayEvents = dayEvents.filter(e => !e.startTime);
    const timedEvents = dayEvents.filter(e => e.startTime);

    return (
        <div className="ios-card p-0 overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">Weekly Planner</h3>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setWeekOffset(w => w - 1)} className="w-7 h-7 rounded-full hover:bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-text-sub))]">chevron_left</span>
                    </button>
                    <button type="button" onClick={() => { setWeekOffset(0); setSelectedDay(todayStr); }} className="text-[11px] font-semibold text-[hsl(var(--admin-primary))] px-2 hover:underline">
                        Today
                    </button>
                    <button type="button" onClick={() => setWeekOffset(w => w + 1)} className="w-7 h-7 rounded-full hover:bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-text-sub))]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Day tabs */}
            <div className="flex px-2 gap-0.5 overflow-x-auto hide-scrollbar pb-2">
                {weekDates.map((date, i) => {
                    const ds = formatDate(date);
                    const isToday = ds === todayStr;
                    const isActive = ds === selectedDay;
                    return (
                        <button
                            key={ds}
                            type="button"
                            onClick={() => setSelectedDay(ds)}
                            className={`
                                flex-1 min-w-[42px] flex flex-col items-center py-2 rounded-xl transition-all text-center
                                ${isActive ? 'bg-[hsl(var(--admin-primary))] text-white shadow-sm' : isToday ? 'bg-[hsl(var(--admin-primary)/0.1)]' : 'hover:bg-[hsl(var(--admin-surface-alt))]'}
                            `}
                        >
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white/80' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                                {WEEKDAYS_FULL[date.getDay()]}
                            </span>
                            <span className={`text-[15px] font-bold leading-tight ${isActive ? 'text-white' : isToday ? 'text-[hsl(var(--admin-primary))]' : 'text-[hsl(var(--admin-text-main))]'}`}>
                                {date.getDate()}
                            </span>
                            {/* Dot indicator */}
                            {events.some(e => e.date === ds) && !isActive && (
                                <span className="w-[4px] h-[4px] rounded-full bg-[hsl(var(--admin-primary))] mt-0.5" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Events list */}
            <div className="px-4 pb-4 space-y-2 max-h-[320px] overflow-y-auto">
                {/* All-day events */}
                {allDayEvents.map(ev => {
                    const c = EVENT_COLORS[ev.type];
                    return (
                        <button
                            key={ev.id}
                            type="button"
                            onClick={() => onEventClick?.(ev)}
                            className={`w-full text-left flex items-center gap-3 p-3 rounded-xl ${c.bg} transition-all hover:scale-[0.99] active:scale-[0.97]`}
                        >
                            <span className={`material-symbols-outlined text-[18px] ${c.text}`}>
                                {ev.type === 'holiday' ? 'beach_access' : ev.type === 'exam' ? 'quiz' : ev.type === 'assignment' ? 'assignment' : ev.type === 'sport' ? 'sports_soccer' : 'event'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-semibold ${c.text} truncate`}>{ev.title}</p>
                                <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">All day</p>
                            </div>
                        </button>
                    );
                })}

                {/* Timed events */}
                {timedEvents.map(ev => {
                    const c = EVENT_COLORS[ev.type];
                    return (
                        <button
                            key={ev.id}
                            type="button"
                            onClick={() => onEventClick?.(ev)}
                            className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-all hover:scale-[0.99] active:scale-[0.97]"
                        >
                            <div className={`w-1 self-stretch rounded-full ${c.dot}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))] truncate">{ev.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-medium text-[hsl(var(--admin-text-sub))]">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>
                                    {ev.location && (
                                        <span className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate">
                                            <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">location_on</span>
                                            {ev.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}

                {/* Empty state */}
                {dayEvents.length === 0 && (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-[32px] text-[hsl(var(--admin-text-muted)/0.4)] mb-2 block">event_available</span>
                        <p className="text-[13px] text-[hsl(var(--admin-text-muted))]">No events this day</p>
                        <button
                            type="button"
                            onClick={() => onAddClick?.(selectedDay)}
                            className="mt-2 text-[12px] font-semibold text-[hsl(var(--admin-primary))] hover:underline"
                        >
                            + Add Event
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
