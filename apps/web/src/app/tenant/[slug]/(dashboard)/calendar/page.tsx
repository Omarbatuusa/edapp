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
        <div className="h-[calc(100vh-80px)] flex flex-col">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Calendar</h1>
                    <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                        <button
                            onClick={() => setView('month')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'month' ? 'bg-white dark:bg-black/40 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'week' ? 'bg-white dark:bg-black/40 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'day' ? 'bg-white dark:bg-black/40 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Day
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1 mr-2">
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold px-2">February 2024</span>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button className="h-9 px-4 flex items-center gap-2 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors text-sm font-medium">
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm">
                        <Plus size={16} />
                        New Event
                    </button>
                </div>
            </div>

            {/* Calendar Grid (Month View Placeholder) */}
            <div className="flex-1 surface-card overflow-hidden flex flex-col p-0">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-border/40 bg-secondary/10">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                                    border-b border-r border-border/30 p-2 min-h-[100px] relative group transition-colors hover:bg-secondary/5
                                    ${!isCurrentMonth ? 'bg-secondary/10 text-muted-foreground/40' : ''}
                                `}
                            >
                                <span className={`text-sm font-medium ${day === 14 ? 'w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full -ml-1.5 -mt-1.5' : ''}`}>
                                    {date}
                                </span>

                                {/* Mock Events */}
                                <div className="mt-2 space-y-1">
                                    {EVENTS.filter(e => {
                                        const eventDate = new Date(e.start);
                                        return isCurrentMonth && eventDate.getDate() === day;
                                    }).map(event => (
                                        <div
                                            key={event.id}
                                            className={`
                                                text-[11px] px-2 py-1 rounded-md truncate font-medium cursor-pointer shadow-sm border-l-2
                                                ${event.type === 'academic' ? 'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-900/20 dark:text-blue-200' : ''}
                                                ${event.type === 'sport' ? 'bg-green-50 text-green-700 border-green-500 dark:bg-green-900/20 dark:text-green-200' : ''}
                                                ${event.type === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-500 dark:bg-purple-900/20 dark:text-purple-200' : ''}
                                            `}
                                        >
                                            {<span className="opacity-75 mr-1">{new Date(event.start).getHours()}:00</span>}
                                            {event.title}
                                        </div>
                                    ))}
                                </div>

                                <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded text-muted-foreground transition-all">
                                    <Plus size={14} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
