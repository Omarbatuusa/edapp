'use client';

import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Plus,
    Filter
} from 'lucide-react';

// Mock Data
const EVENTS = [
    {
        id: 1,
        title: 'Grade 10 Mathematics Exam',
        start: '2024-02-15T09:00:00',
        end: '2024-02-15T11:00:00',
        type: 'academic',
        location: 'Hall A'
    },
    {
        id: 2,
        title: 'Soccer vs Jeppe (Away)',
        start: '2024-02-16T14:00:00',
        end: '2024-02-16T17:00:00',
        type: 'sport',
        location: 'Jeppe High'
    },
    {
        id: 3,
        title: 'Staff Meeting',
        start: '2024-02-14T08:00:00',
        end: '2024-02-14T09:00:00',
        type: 'admin',
        location: 'Staff Room'
    }
];

export default function CalendarPage() {
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Calendar</h1>
                    <div className="flex items-center bg-[hsl(var(--admin-surface-alt))] rounded-[10px] p-1 border border-[hsl(var(--admin-border))]">
                        <button
                            onClick={() => setView('month')}
                            className={`px-3.5 py-1.5 text-[14px] font-semibold rounded-[8px] transition-all ${view === 'month' ? 'bg-white dark:bg-black shadow-sm text-[hsl(var(--admin-text-main))]' : 'text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))]'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-3.5 py-1.5 text-[14px] font-semibold rounded-[8px] transition-all ${view === 'week' ? 'bg-white dark:bg-black shadow-sm text-[hsl(var(--admin-text-main))]' : 'text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))]'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-3.5 py-1.5 text-[14px] font-semibold rounded-[8px] transition-all ${view === 'day' ? 'bg-white dark:bg-black shadow-sm text-[hsl(var(--admin-text-main))]' : 'text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))]'}`}
                        >
                            Day
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[hsl(var(--admin-surface-alt))] rounded-[12px] p-1 border border-[hsl(var(--admin-border))]">
                        <button className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-white dark:hover:bg-black text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))] transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-[15px] font-bold px-3 tracking-tight text-[hsl(var(--admin-text-main))]">February 2024</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-white dark:hover:bg-black text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))] transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <button className="h-[40px] px-4 flex items-center gap-2 rounded-[12px] border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-surface-alt))/0.8] transition-colors text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="h-[40px] px-5 flex items-center gap-2 rounded-[12px] bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] transition-all text-[14px] font-semibold shadow-sm">
                        <Plus size={18} />
                        New Event
                    </button>
                </div>
            </div>

            {/* Calendar Grid (Month View Placeholder) */}
            <div className="flex-1 ios-card flex flex-col p-0 overflow-hidden border border-[hsl(var(--admin-border))] rounded-[20px]">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2.5 text-center text-[12px] font-bold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5">
                    {Array.from({ length: 35 }).map((_, i) => {
                        const day = i - 3; // Offset for mock Feb start
                        const isCurrentMonth = day > 0 && day <= 29;
                        const date = day > 0 ? day : day + 31; // Mock prev month

                        return (
                            <div
                                key={i}
                                className={`
                                    border-b border-r border-[hsl(var(--admin-border))] p-2.5 min-h-[120px] relative group transition-colors hover:bg-[hsl(var(--admin-surface-alt))]
                                    ${!isCurrentMonth ? 'bg-[hsl(var(--admin-surface-alt))/0.3] text-[hsl(var(--admin-text-muted))]' : ''}
                                    ${i % 7 === 6 ? 'border-r-0' : ''}
                                `}
                            >
                                <span className={`text-[15px] font-medium ${day === 14 ? 'w-8 h-8 flex items-center justify-center bg-[hsl(var(--admin-danger))] text-white font-bold rounded-full -ml-1 -mt-1 shadow-sm' : ''}`}>
                                    {date}
                                </span>

                                {/* Mock Events */}
                                <div className="mt-2.5 space-y-1.5">
                                    {EVENTS.filter(e => {
                                        const eventDate = new Date(e.start);
                                        return isCurrentMonth && eventDate.getDate() === day;
                                    }).map(event => (
                                        <div
                                            key={event.id}
                                            className={`
                                                text-[12px] px-2.5 py-1.5 rounded-[8px] truncate font-semibold cursor-pointer shadow-sm border-l-4 transition-transform hover:-translate-y-0.5
                                                ${event.type === 'academic' ? 'bg-[hsl(var(--admin-primary))/0.1] text-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary))]' : ''}
                                                ${event.type === 'sport' ? 'bg-[hsl(var(--admin-success))/0.1] text-[hsl(var(--admin-success))] border-[hsl(var(--admin-success))]' : ''}
                                                ${event.type === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-500' : ''}
                                            `}
                                        >
                                            <span className="opacity-70 mr-1.5 font-bold">{new Date(event.start).getHours()}:00</span>
                                            {event.title}
                                        </div>
                                    ))}
                                </div>

                                <button className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-primary))] hover:text-white rounded-full text-[hsl(var(--admin-text-muted))] transition-all active:scale-90 shadow-sm">
                                    <Plus size={16} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
