/* ── Calendar Event types, helpers & mock data ─────────────────────────── */

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;            // YYYY-MM-DD
    startTime?: string;      // HH:mm
    endTime?: string;        // HH:mm
    type: EventType;
    color?: string;
    description?: string;
    location?: string;
}

export type EventType = 'meeting' | 'class' | 'exam' | 'reminder' | 'personal' | 'holiday' | 'assignment' | 'sport';

export const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
    meeting:    { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-500' },
    class:      { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
    exam:       { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
    reminder:   { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    personal:   { bg: 'bg-pink-100 dark:bg-pink-900/30',   text: 'text-pink-700 dark:text-pink-300',   dot: 'bg-pink-500' },
    holiday:    { bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-300',     dot: 'bg-red-500' },
    assignment: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    sport:      { bg: 'bg-teal-100 dark:bg-teal-900/30',   text: 'text-teal-700 dark:text-teal-300',   dot: 'bg-teal-500' },
};

/* ── Date helpers ─────────────────────────────────────────────────────── */

export function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return days;
}

export function formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekDates(refDate: Date = new Date()): Date[] {
    const day = refDate.getDay();
    const mon = new Date(refDate);
    mon.setDate(refDate.getDate() - ((day + 6) % 7)); // Monday
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) { const d = new Date(mon); d.setDate(mon.getDate() + i); week.push(d); }
    return week;
}

export const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const WEEKDAYS_FULL  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ── Mock events (demo data per role) ─────────────────────────────────── */

function d(offset: number): string {
    const t = new Date(); t.setDate(t.getDate() + offset);
    return formatDate(t);
}

export const MOCK_ADMIN_EVENTS: CalendarEvent[] = [
    { id: 'a1', title: 'SLT Meeting', date: d(0), startTime: '08:00', endTime: '09:00', type: 'meeting', location: 'Board Room' },
    { id: 'a2', title: 'Staff Assembly', date: d(1), startTime: '07:30', endTime: '08:00', type: 'meeting', location: 'Hall' },
    { id: 'a3', title: 'Mid-Year Exams Start', date: d(3), type: 'exam' },
    { id: 'a4', title: 'Parent Evening', date: d(5), startTime: '17:00', endTime: '19:00', type: 'meeting', location: 'Multi-Purpose Hall' },
    { id: 'a5', title: 'Public Holiday', date: d(7), type: 'holiday' },
    { id: 'a6', title: 'Budget Review', date: d(2), startTime: '10:00', endTime: '11:30', type: 'meeting', location: 'Admin Office' },
    { id: 'a7', title: 'Sports Day', date: d(4), startTime: '09:00', endTime: '14:00', type: 'sport', location: 'Sports Field' },
];

export const MOCK_STAFF_EVENTS: CalendarEvent[] = [
    { id: 's1', title: 'Grade 10 Math', date: d(0), startTime: '08:00', endTime: '08:45', type: 'class', location: 'Room 3B' },
    { id: 's2', title: 'Grade 11 Math', date: d(0), startTime: '09:00', endTime: '09:45', type: 'class', location: 'Room 3B' },
    { id: 's3', title: 'Department Meeting', date: d(1), startTime: '14:00', endTime: '15:00', type: 'meeting', location: 'Staff Room' },
    { id: 's4', title: 'Exam Moderation', date: d(3), startTime: '10:00', endTime: '12:00', type: 'exam' },
    { id: 's5', title: 'Grade 10 Science', date: d(0), startTime: '10:00', endTime: '10:45', type: 'class', location: 'Lab 1' },
    { id: 's6', title: 'Staff Training', date: d(2), startTime: '14:00', endTime: '16:00', type: 'meeting', location: 'Hall' },
    { id: 's7', title: 'Homework Due: Grade 11', date: d(4), type: 'assignment' },
];

export const MOCK_PARENT_EVENTS: CalendarEvent[] = [
    { id: 'p1', title: 'Parent Evening', date: d(5), startTime: '17:00', endTime: '19:00', type: 'meeting', location: 'Multi-Purpose Hall' },
    { id: 'p2', title: 'Mid-Year Exams', date: d(3), type: 'exam' },
    { id: 'p3', title: 'Sports Day', date: d(4), startTime: '09:00', endTime: '14:00', type: 'sport', location: 'Sports Field' },
    { id: 'p4', title: 'School Closed', date: d(7), type: 'holiday' },
    { id: 'p5', title: 'Fee Payment Due', date: d(6), type: 'reminder' },
];

export const MOCK_LEARNER_EVENTS: CalendarEvent[] = [
    { id: 'l1', title: 'Math Class', date: d(0), startTime: '08:00', endTime: '08:45', type: 'class', location: 'Room 3B' },
    { id: 'l2', title: 'Science Class', date: d(0), startTime: '09:00', endTime: '09:45', type: 'class', location: 'Lab 1' },
    { id: 'l3', title: 'History Essay Due', date: d(2), type: 'assignment' },
    { id: 'l4', title: 'Mid-Year Math Exam', date: d(3), startTime: '09:00', endTime: '11:00', type: 'exam', location: 'Exam Hall' },
    { id: 'l5', title: 'Sports Day', date: d(4), startTime: '09:00', endTime: '14:00', type: 'sport', location: 'Sports Field' },
    { id: 'l6', title: 'English Class', date: d(0), startTime: '10:00', endTime: '10:45', type: 'class', location: 'Room 2A' },
    { id: 'l7', title: 'Science Project Due', date: d(5), type: 'assignment' },
];
