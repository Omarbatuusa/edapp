import { FeedItem } from './types';

export const MOCK_CHILDREN = [
    { id: 'all', name: 'All Children' },
    { id: 'lisa', name: 'Lisa Simpson', grade: 'Grade 6', avatar: 'https://ui-avatars.com/api/?name=Lisa+Simpson&background=random' },
    { id: 'bart', name: 'Bart Simpson', grade: 'Grade 4', avatar: 'https://ui-avatars.com/api/?name=Bart+Simpson&background=random' },
];

export const TRANSLATIONS: Record<string, string> = {
    'Permission Slip: Zoo Trip': 'Sardon: Leeto la Zoo',
    'School Closed on Monday': 'Sekolo se Koetswe ka Mantaha',
    'Term 2 Report Cards': 'Dikarata tsa Tlaleho tsa Kotara ya 2',
    'Annual Sports Day': 'Letsatsi la Dipapadi',
    'Bus Route Change Request': 'Kopo ya Phetoho ya Tsela ya Bese',
    'Mrs. Anderson': 'Mofumahadi Anderson',
};

export const MOCK_FEED: FeedItem[] = [
    {
        id: 'act-1',
        type: 'action',
        title: 'Permission Slip: Zoo Trip',
        subtitle: 'Please sign by tomorrow',
        timestamp: '1 hour ago',
        time: '1 hour ago',
        unread: true,
        priority: 'HIGH',
        childName: 'Lisa Simpson',
        childGrade: 'Grade 6',
        source: 'Principal\'s Office',
        hasDownload: true,
        isUnread: true
    },
    {
        id: 'urg-1',
        type: 'urgent',
        title: 'School Closed on Monday',
        subtitle: 'Due to severe weather warning',
        timestamp: '2 hours ago',
        time: '2 hours ago',
        unread: false,
        source: 'Principal\'s Office',
        isUnread: false
    },
    {
        id: 'msg-1',
        type: 'message',
        title: 'Mrs. Anderson',
        subtitle: 'Lisa is doing great in math class!',
        messagePreview: 'Lisa is doing great in math class! She really understood the new concepts today.',
        timestamp: 'Yesterday',
        time: 'Yesterday',
        unread: true,
        childName: 'Lisa Simpson',
        childGrade: 'Grade 6',
        role: 'Class Teacher',
        isUnread: true
    },
    {
        id: 'ann-1',
        type: 'announcement',
        title: 'Annual Sports Day',
        subtitle: 'Join us for a day of fun and games',
        timestamp: '2 days ago',
        time: '2 days ago',
        unread: false,
        category: 'Events',
        source: 'Sports Dept',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        isUnread: false
    },
    {
        id: 'sup-1',
        type: 'support',
        title: 'Bus Route Change Request',
        subtitle: 'Ticket #TR-2024-001 • In Progress',
        timestamp: '3 days ago',
        time: '3 days ago',
        unread: false,
        status: 'PENDING',
        ticketId: 'TR-2024-001',
        slaDue: 'Response in 24h',
        isUnread: false
    },
    {
        id: 'msg-2',
        type: 'message',
        title: 'Mr. Skinner',
        subtitle: 'Regarding Bart\'s detention',
        messagePreview: 'Please refrain from bringing a skateboard to school.',
        timestamp: 'Last Week',
        time: 'Last Week',
        unread: false,
        childName: 'Bart Simpson',
        childGrade: 'Grade 4',
        role: 'Principal',
        isUnread: false
    }
];

export const MOCK_ACTIONS = [
    {
        id: 'ack-1',
        type: 'acknowledgement',
        title: 'New COVID-19 Safety Policy',
        subtitle: 'Please read and acknowledge by Friday',
        due: 'Friday',
        status: 'PENDING',
        priority: 'HIGH'
    },
    {
        id: 'app-1',
        type: 'approval',
        title: 'Grade 6 Zoo Trip Permission',
        subtitle: 'Lisa Simpson • R 150.00',
        due: 'Tomorrow',
        status: 'PENDING',
        priority: 'MEDIUM'
    },
    {
        id: 'pay-1',
        type: 'payment',
        title: 'Term 1 School Fees',
        subtitle: 'Outstanding Balance: R 4,500.00',
        due: '25 Feb',
        status: 'OVERDUE',
        priority: 'HIGH'
    },
    {
        id: 'rev-1',
        type: 'review',
        title: 'Verify Contact Information',
        subtitle: 'Annual data check',
        due: 'Next Week',
        status: 'PENDING',
        priority: 'LOW'
    },
    {
        id: 'upl-1',
        type: 'upload',
        title: 'Upload Vaccination Record',
        subtitle: 'Bart Simpson',
        due: 'ASAP',
        status: 'PENDING',
        priority: 'MEDIUM'
    }
];
