'use client';

import { useState, useEffect } from 'react';
import type { CalendarEvent, EventType } from '@/lib/calendar-events';

interface AddEventSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (event: Omit<CalendarEvent, 'id'>) => void;
    preselectedDate?: string;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'class', label: 'Class' },
    { value: 'exam', label: 'Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'sport', label: 'Sport / Activity' },
    { value: 'personal', label: 'Personal' },
    { value: 'holiday', label: 'Holiday' },
];

export function AddEventSheet({ isOpen, onClose, onSave, preselectedDate }: AddEventSheetProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState<EventType>('meeting');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDate(preselectedDate || new Date().toISOString().split('T')[0]);
            setStartTime('');
            setEndTime('');
            setType('meeting');
            setDescription('');
            setLocation('');
        }
    }, [isOpen, preselectedDate]);

    const handleSave = () => {
        if (!title.trim() || !date) return;
        onSave?.({
            title: title.trim(),
            date,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            type,
            description: description.trim() || undefined,
            location: location.trim() || undefined,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] fade-in" onClick={onClose} />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-[91] bg-[hsl(var(--admin-surface))] rounded-t-[20px] shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-9 h-1 rounded-full bg-[hsl(var(--admin-border))]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 border-b border-[hsl(var(--admin-border)/0.5)]">
                    <button type="button" onClick={onClose} className="text-[14px] font-medium text-[hsl(var(--admin-text-sub))]">
                        Cancel
                    </button>
                    <h3 className="text-[16px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">New Event</h3>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="text-[14px] font-bold text-[hsl(var(--admin-primary))] disabled:opacity-40"
                    >
                        Save
                    </button>
                </div>

                {/* Form */}
                <div className="p-5 space-y-4">
                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Event title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        autoFocus
                        className="w-full text-[18px] font-semibold text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] bg-transparent outline-none tracking-tight"
                    />

                    {/* Event type pills */}
                    <div className="flex flex-wrap gap-2">
                        {EVENT_TYPES.map(t => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                                    type === t.value
                                        ? 'bg-[hsl(var(--admin-primary))] text-white shadow-sm'
                                        : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))]'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Date & Time row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1 block">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                aria-label="Event date"
                                className="w-full px-3 py-2.5 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] text-[14px] text-[hsl(var(--admin-text-main))] font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1 block">Start</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                aria-label="Start time"
                                className="w-full px-3 py-2.5 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] text-[14px] text-[hsl(var(--admin-text-main))] font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1 block">End</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                aria-label="End time"
                                className="w-full px-3 py-2.5 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] text-[14px] text-[hsl(var(--admin-text-main))] font-medium"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1 block">Location</label>
                        <div className="relative">
                            <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))] absolute left-3 top-1/2 -translate-y-1/2">location_on</span>
                            <input
                                type="text"
                                placeholder="Add location"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] text-[14px] text-[hsl(var(--admin-text-main))] font-medium placeholder:text-[hsl(var(--admin-text-muted))]"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-1 block">Notes</label>
                        <textarea
                            placeholder="Add description..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] text-[14px] text-[hsl(var(--admin-text-main))] font-medium placeholder:text-[hsl(var(--admin-text-muted))] resize-none"
                        />
                    </div>
                </div>

                {/* Safe area spacer (mobile) */}
                <div className="h-8" />
            </div>
        </>
    );
}
