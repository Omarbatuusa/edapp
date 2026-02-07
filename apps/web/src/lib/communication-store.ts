import { create } from 'zustand';

// ============================================================
// COMMUNICATION STORE - Unified feed state management
// ============================================================

// Feed item types
export type FeedItemType = 'announcement' | 'message' | 'support';
export type FeedItemUrgency = 'normal' | 'urgent';
export type AckStatus = 'pending' | 'acknowledged' | null;
export type TicketStatus = 'open' | 'pending' | 'resolved';
export type AttachmentType = 'pdf' | 'image' | 'link' | 'document';

export interface FeedItemSource {
    name: string;
    role?: string;
    department?: string;
    avatar?: string;
}

export interface LearnerContext {
    name: string;
    grade: string;
}

export interface Attachment {
    type: AttachmentType;
    name: string;
    url: string;
}

export interface FeedItem {
    id: string;
    type: FeedItemType;
    title: string;
    preview: string;
    timestamp: string;
    urgency: FeedItemUrgency;
    unread: boolean;
    requiresAck: boolean;
    ackStatus: AckStatus;
    source: FeedItemSource;
    learnerContext?: LearnerContext[];
    attachments?: Attachment[];
    status?: TicketStatus;
    threadId?: string;
    unreadCount?: number;
}

// Filter types
export type FilterType = 'all' | 'unread' | 'urgent' | 'announcement' | 'message' | 'support';
export type SortType = 'newest' | 'unread' | 'urgent';
export type DensityType = 'comfortable' | 'compact';

interface CommunicationState {
    // Feed items
    items: FeedItem[];

    // UI state
    filter: FilterType;
    sort: SortType;
    density: DensityType;
    searchQuery: string;

    // Actions
    setFilter: (filter: FilterType) => void;
    setSort: (sort: SortType) => void;
    setDensity: (density: DensityType) => void;
    setSearchQuery: (query: string) => void;
    acknowledgeItem: (id: string) => void;
    markAsRead: (id: string) => void;

    // Selectors
    getFilteredItems: () => FeedItem[];
    getActionRequiredItems: () => FeedItem[];
    getUnreadCount: () => number;
    getUrgentCount: () => number;
}

// ============================================================
// MOCK DATA
// ============================================================

const MOCK_FEED_ITEMS: FeedItem[] = [
    {
        id: 'ann-1',
        type: 'announcement',
        title: 'School Closed Monday - Weather Alert',
        preview: 'Due to severe weather conditions expected on Monday, all classes will be suspended. Remote learning will continue as scheduled.',
        timestamp: '2 hours ago',
        urgency: 'urgent',
        unread: true,
        requiresAck: true,
        ackStatus: 'pending',
        source: { name: "Principal's Office", department: 'Administration' },
        attachments: [{ type: 'pdf', name: 'Weather Notice.pdf', url: '#' }],
    },
    {
        id: 'msg-1',
        type: 'message',
        title: 'Mrs Smith • Class Teacher',
        preview: 'Hi! Just wanted to let you know that Lisa did very well in today\'s math test. She scored 92%!',
        timestamp: '3 hours ago',
        urgency: 'normal',
        unread: true,
        requiresAck: false,
        ackStatus: null,
        source: { name: 'Mrs Smith', role: 'Class Teacher', avatar: 'S' },
        learnerContext: [{ name: 'Lisa Johnson', grade: 'Gr 6A' }],
        threadId: 'thread-1',
        unreadCount: 2,
    },
    {
        id: 'sup-1',
        type: 'support',
        title: 'Fee Statement Query',
        preview: 'Regarding the additional charges on the March statement, I would like clarification on the sports equipment fee.',
        timestamp: 'Yesterday',
        urgency: 'normal',
        unread: false,
        requiresAck: false,
        ackStatus: null,
        source: { name: 'Finance Office', department: 'Finance' },
        status: 'pending',
    },
    {
        id: 'ann-2',
        type: 'announcement',
        title: 'Annual Sports Day Registration',
        preview: 'Please register your child for the upcoming Annual Sports Day. Deadline: 15 March.',
        timestamp: 'Yesterday',
        urgency: 'normal',
        unread: false,
        requiresAck: true,
        ackStatus: 'acknowledged',
        source: { name: 'Coach Sithole', department: 'Sports' },
    },
    {
        id: 'msg-2',
        type: 'message',
        title: 'Mr Dlamini • HOD Science',
        preview: 'The science project materials list has been updated. Please see the attached document.',
        timestamp: '2 days ago',
        urgency: 'normal',
        unread: false,
        requiresAck: false,
        ackStatus: null,
        source: { name: 'Mr Dlamini', role: 'HOD Science', avatar: 'D' },
        learnerContext: [{ name: 'James Johnson', grade: 'Gr 9B' }],
        threadId: 'thread-2',
        attachments: [{ type: 'document', name: 'Materials List.docx', url: '#' }],
    },
    {
        id: 'sup-2',
        type: 'support',
        title: 'Transport Route Change Request',
        preview: 'Request to change pickup point from Main Street to Oak Avenue from next term.',
        timestamp: '3 days ago',
        urgency: 'normal',
        unread: false,
        requiresAck: false,
        ackStatus: null,
        source: { name: 'Transport Office', department: 'Operations' },
        status: 'resolved',
    },
    {
        id: 'ann-3',
        type: 'announcement',
        title: 'Term 2 Report Cards Available',
        preview: 'Report cards for Term 2 are now available for download in the Academics section.',
        timestamp: '3 days ago',
        urgency: 'normal',
        unread: false,
        requiresAck: false,
        ackStatus: null,
        source: { name: 'Admin Office', department: 'Administration' },
        attachments: [{ type: 'pdf', name: 'Report Card.pdf', url: '#' }],
    },
];

// ============================================================
// STORE
// ============================================================

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
    items: MOCK_FEED_ITEMS,
    filter: 'all',
    sort: 'newest',
    density: 'comfortable',
    searchQuery: '',

    setFilter: (filter) => set({ filter }),
    setSort: (sort) => set({ sort }),
    setDensity: (density) => set({ density }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    acknowledgeItem: (id) => set((state) => ({
        items: state.items.map((item) =>
            item.id === id ? { ...item, ackStatus: 'acknowledged' as AckStatus } : item
        ),
    })),

    markAsRead: (id) => set((state) => ({
        items: state.items.map((item) =>
            item.id === id ? { ...item, unread: false } : item
        ),
    })),

    getFilteredItems: () => {
        const { items, filter, sort, searchQuery } = get();

        // Filter
        let filtered = items.filter((item) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!item.title.toLowerCase().includes(query) &&
                    !item.preview.toLowerCase().includes(query)) {
                    return false;
                }
            }

            // Type filter
            switch (filter) {
                case 'unread': return item.unread;
                case 'urgent': return item.urgency === 'urgent';
                case 'announcement': return item.type === 'announcement';
                case 'message': return item.type === 'message';
                case 'support': return item.type === 'support';
                default: return true;
            }
        });

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sort) {
                case 'unread':
                    if (a.unread !== b.unread) return a.unread ? -1 : 1;
                    break;
                case 'urgent':
                    if (a.urgency !== b.urgency) return a.urgency === 'urgent' ? -1 : 1;
                    break;
            }
            // Default: newest first (assuming timestamp order)
            return 0;
        });

        return filtered;
    },

    getActionRequiredItems: () => {
        const { items } = get();
        return items.filter((item) =>
            (item.requiresAck && item.ackStatus === 'pending') ||
            (item.urgency === 'urgent' && item.unread)
        );
    },

    getUnreadCount: () => {
        const { items } = get();
        return items.filter((item) => item.unread).length;
    },

    getUrgentCount: () => {
        const { items } = get();
        return items.filter((item) => item.urgency === 'urgent').length;
    },
}));
