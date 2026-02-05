// Notification types and mock data for EdApp

export type NotificationType = 'announcement' | 'urgent' | 'task' | 'message' | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    preview: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
    sender?: {
        name: string;
        avatar?: string;
    };
}

// Mock notifications for demo
export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'urgent',
        title: 'Emergency Drill Tomorrow',
        preview: 'All students and staff are required to participate in the fire drill at 10:00 AM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        read: false,
    },
    {
        id: '2',
        type: 'task',
        title: 'Submit Homework: Math Assignment',
        preview: 'Chapter 5 exercises due by Friday, February 7th.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        actionUrl: '/assignments/math-ch5',
    },
    {
        id: '3',
        type: 'message',
        title: 'New message from Mrs. Johnson',
        preview: 'Hi! I wanted to discuss your child\'s progress in English class...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: true,
        sender: { name: 'Mrs. Johnson' },
        actionUrl: '/messages/123',
    },
    {
        id: '4',
        type: 'announcement',
        title: 'School Closed Monday',
        preview: 'Due to the public holiday, the school will be closed on Monday, February 10th.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
    },
    {
        id: '5',
        type: 'task',
        title: 'Permission Slip Required',
        preview: 'Please sign and return the field trip permission slip by Wednesday.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
        read: false,
        actionUrl: '/forms/field-trip',
    },
    {
        id: '6',
        type: 'system',
        title: 'Password Updated',
        preview: 'Your account password was successfully changed.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
    },
    {
        id: '7',
        type: 'announcement',
        title: 'Sports Day Registration Open',
        preview: 'Register your child for the annual sports day events by February 15th.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        read: true,
        actionUrl: '/events/sports-day',
    },
];

// Get icon name for notification type
export function getNotificationIcon(type: NotificationType): string {
    switch (type) {
        case 'urgent':
            return 'warning';
        case 'task':
            return 'task_alt';
        case 'message':
            return 'chat';
        case 'announcement':
            return 'campaign';
        case 'system':
            return 'settings';
        default:
            return 'notifications';
    }
}

// Get color class for notification type
export function getNotificationColor(type: NotificationType): string {
    switch (type) {
        case 'urgent':
            return 'bg-red-500';
        case 'task':
            return 'bg-amber-500';
        case 'message':
            return 'bg-blue-500';
        case 'announcement':
            return 'bg-purple-500';
        case 'system':
            return 'bg-slate-500';
        default:
            return 'bg-primary';
    }
}

// Format relative time
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Filter notifications by tab
export function filterNotifications(
    notifications: Notification[],
    tab: 'all' | 'urgent' | 'tasks'
): Notification[] {
    switch (tab) {
        case 'urgent':
            return notifications.filter(n => n.type === 'urgent');
        case 'tasks':
            return notifications.filter(n => n.type === 'task');
        default:
            return notifications;
    }
}

// Count unread notifications
export function countUnread(notifications: Notification[]): number {
    return notifications.filter(n => !n.read).length;
}
