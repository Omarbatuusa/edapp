'use client';

import { useState, useMemo } from 'react';
import { getDaysInMonth, formatDate, WEEKDAYS_SHORT, MONTHS, type CalendarEvent, EVENT_COLORS } from '@/lib/calendar-events';

interface MiniCalendarProps {
    events?: CalendarEvent[];
    selectedDate?: string;
    onSelectDate?: (date: string) => void;
    onAddEvent?: (date: string) => void;
}

export function MiniCalendar({ events = [], selectedDate, onSelectDate, onAddEvent }: MiniCalendarProps) {
    const now = new Date();
    const todayStr = formatDate(now);
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
    const firstDayOfWeek = days[0]?.getDay() ?? 0;

    // Map date → events for dot rendering
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(e => {
            const arr = map.get(e.date) || [];
            arr.push(e);
            map.set(e.date, arr);
        });
        return map;
    }, [events]);

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };
    const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); onSelectDate?.(todayStr); };

    return (
        <div className="ios-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-sub))]">chevron_left</span>
                </button>
                <button type="button" onClick={goToday} className="text-[15px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight hover:text-[hsl(var(--admin-primary))] transition-colors">
                    {MONTHS[month]} {year}
                </button>
                <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-sub))]">chevron_right</span>
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS_SHORT.map((d, i) => (
                    <div key={i} className="text-center text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`e${i}`} className="aspect-square" />
                ))}

                {days.map(date => {
                    const dateStr = formatDate(date);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const dayEvents = eventsByDate.get(dateStr) || [];
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                        <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                                onSelectDate?.(dateStr);
                                if (dayEvents.length === 0) onAddEvent?.(dateStr);
                            }}
                            className={`
                                aspect-square p-0.5 flex flex-col items-center justify-center rounded-full relative transition-all text-[14px] font-semibold
                                ${isToday && !isSelected ? 'bg-[hsl(var(--admin-primary))] text-white' : ''}
                                ${isSelected ? 'ring-2 ring-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.12)]' : ''}
                                ${!isToday && !isSelected && isWeekend ? 'text-[hsl(var(--admin-text-muted))]' : ''}
                                ${!isToday && !isSelected && !isWeekend ? 'text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))]' : ''}
                            `}
                        >
                            {date.getDate()}
                            {/* Event dots */}
                            {dayEvents.length > 0 && (
                                <span className="absolute bottom-[2px] flex gap-[2px]">
                                    {dayEvents.slice(0, 3).map((ev, i) => (
                                        <span key={i} className={`w-[4px] h-[4px] rounded-full ${isToday && !isSelected ? 'bg-white/80' : EVENT_COLORS[ev.type]?.dot || 'bg-gray-400'}`} />
                                    ))}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Today button */}
            <div className="mt-2 flex justify-center">
                <button type="button" onClick={goToday} className="text-[12px] font-semibold text-[hsl(var(--admin-primary))] hover:underline">
                    Today
                </button>
            </div>
        </div>
    );
}
