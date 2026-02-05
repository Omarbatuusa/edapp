'use client';

// ============================================================
// PARENT DASHBOARD TYPES & MOCK DATA
// ============================================================

// Child Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'off-campus' | 'unknown';

export interface Child {
    id: string;
    name: string;
    avatar?: string;
    grade: string;
    class: string;
    branch?: string;
    status: AttendanceStatus;
    lastSeen?: {
        location: string;
        time: string;
    };
    needsVerification?: boolean;
}

// Homework Types
export interface Homework {
    id: string;
    title: string;
    subject: string;
    childId: string;
    childName: string;
    dueDate: string;
    dueBadge: 'today' | 'tomorrow' | 'this-week' | 'overdue';
    icon: string;
    status: 'pending' | 'submitted' | 'graded';
}

// Announcement Types
export interface Announcement {
    id: string;
    title: string;
    preview: string;
    postedAt: string;
    requiresAcknowledge: boolean;
    acknowledged?: boolean;
    priority: 'normal' | 'high' | 'urgent';
    attachments?: number;
}

// School Life Post Types
export interface SchoolPost {
    id: string;
    author: {
        name: string;
        avatar?: string;
        department?: string;
    };
    content: string;
    image?: string;
    postedAt: string;
    likes: number;
    comments: number;
    liked?: boolean;
}

// Quick Action Types
export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    href: string;
    primary?: boolean;
    badge?: number;
}

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_CHILDREN: Child[] = [
    {
        id: 'child-1',
        name: 'Zola M.',
        avatar: 'https://ui-avatars.com/api/?name=Zola+M&background=6366f1&color=fff&size=128',
        grade: 'Grade 5',
        class: 'St. Marks',
        status: 'present',
        lastSeen: {
            location: 'Gate 2',
            time: '07:45 AM',
        },
    },
    {
        id: 'child-2',
        name: 'Lefu K.',
        avatar: 'https://ui-avatars.com/api/?name=Lefu+K&background=ec4899&color=fff&size=128',
        grade: 'Grade 8',
        class: 'St. Johns',
        status: 'absent',
        needsVerification: true,
    },
    {
        id: 'child-3',
        name: 'Thandi M.',
        avatar: 'https://ui-avatars.com/api/?name=Thandi+M&background=14b8a6&color=fff&size=128',
        grade: 'Grade 3',
        class: 'St. Marks',
        status: 'present',
        lastSeen: {
            location: 'Classroom 3B',
            time: '08:15 AM',
        },
    },
];

export const MOCK_HOMEWORK: Homework[] = [
    {
        id: 'hw-1',
        title: 'Maths Worksheet',
        subject: 'Ch 4. Algebra',
        childId: 'child-1',
        childName: 'Zola M.',
        dueDate: '2026-02-06',
        dueBadge: 'tomorrow',
        icon: 'calculate',
        status: 'pending',
    },
    {
        id: 'hw-2',
        title: 'History Essay',
        subject: 'The Cold War',
        childId: 'child-2',
        childName: 'Lefu K.',
        dueDate: '2026-02-07',
        dueBadge: 'this-week',
        icon: 'history_edu',
        status: 'pending',
    },
    {
        id: 'hw-3',
        title: 'Science Project',
        subject: 'Solar System Model',
        childId: 'child-3',
        childName: 'Thandi M.',
        dueDate: '2026-02-05',
        dueBadge: 'today',
        icon: 'science',
        status: 'pending',
    },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'ann-1',
        title: 'Early Closure on Friday',
        preview: 'School closes at 12:00 PM for Staff Development. Please arrange transport.',
        postedAt: '2 hours ago',
        requiresAcknowledge: true,
        acknowledged: false,
        priority: 'high',
    },
    {
        id: 'ann-2',
        title: 'Term 1 Fee Reminder',
        preview: 'Outstanding fees must be settled by 10 February to avoid late payment charges.',
        postedAt: '1 day ago',
        requiresAcknowledge: false,
        priority: 'normal',
    },
    {
        id: 'ann-3',
        title: 'Sports Day Registration',
        preview: 'Register your child for Sports Day events by Friday. Forms available at reception.',
        postedAt: '2 days ago',
        requiresAcknowledge: false,
        priority: 'normal',
        attachments: 1,
    },
];

export const MOCK_SCHOOL_POSTS: SchoolPost[] = [
    {
        id: 'post-1',
        author: {
            name: 'St. Marks High',
            avatar: 'https://ui-avatars.com/api/?name=SM&background=0ea5e9&color=fff',
            department: 'Sports Dept',
        },
        content: 'First Team Rugby wins the regional derby! 🏆 What a match against our rivals. Proud of the boys for bringing the trophy home! #StMarksPride #Rugby',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
        postedAt: '4h ago',
        likes: 124,
        comments: 8,
        liked: false,
    },
    {
        id: 'post-2',
        author: {
            name: 'Music Department',
            avatar: 'https://ui-avatars.com/api/?name=MD&background=8b5cf6&color=fff',
            department: 'Arts',
        },
        content: 'Our choir performed beautifully at the Regional Music Festival. Special congratulations to the soloists! 🎵',
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop',
        postedAt: '1d ago',
        likes: 89,
        comments: 12,
        liked: true,
    },
];

export const PARENT_QUICK_ACTIONS: QuickAction[] = [
    { id: 'pay', label: 'Pay Fees', icon: 'payments', href: '/pay', primary: true },
    { id: 'message', label: 'Message', icon: 'chat', href: '/chat' },
    { id: 'absence', label: 'Report Absence', icon: 'event_busy', href: '/report-absence' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month', href: '/calendar' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getStatusColor(status: AttendanceStatus): string {
    switch (status) {
        case 'present': return 'bg-emerald-500';
        case 'absent': return 'bg-red-500';
        case 'late': return 'bg-amber-500';
        case 'off-campus': return 'bg-blue-500';
        default: return 'bg-gray-400';
    }
}

export function getStatusLabel(status: AttendanceStatus): string {
    switch (status) {
        case 'present': return 'Present';
        case 'absent': return 'Absent';
        case 'late': return 'Late';
        case 'off-campus': return 'Off-campus';
        default: return 'Unknown';
    }
}

export function getDueBadgeStyle(badge: Homework['dueBadge']): { bg: string; text: string; label: string } {
    switch (badge) {
        case 'today': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'TODAY' };
        case 'tomorrow': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'TOMORROW' };
        case 'this-week': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'FRIDAY' };
        case 'overdue': return { bg: 'bg-red-500', text: 'text-white', label: 'OVERDUE' };
    }
}
