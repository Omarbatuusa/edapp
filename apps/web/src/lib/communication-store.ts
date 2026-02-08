import { create } from 'zustand';
import chatApi, { ThreadDto } from './chat-api';

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
    isLoading: boolean;
    error: string | null;

    // UI state
    filter: FilterType;
    sort: SortType;
    density: DensityType;
    searchQuery: string;

    // Actions
    fetchFeed: () => Promise<void>;
    setFilter: (filter: FilterType) => void;
    setSort: (sort: SortType) => void;
    setDensity: (density: DensityType) => void;
    setSearchQuery: (query: string) => void;
    acknowledgeItem: (id: string) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;

    // Selectors
    getFilteredItems: () => FeedItem[];
    getActionRequiredItems: () => FeedItem[];
    getUnreadCount: () => number;
    getUrgentCount: () => number;
}

// Helper to map API Thread to FeedItem
const mapThreadToFeedItem = (thread: ThreadDto): FeedItem => {
    let type: FeedItemType = 'message';
    if (thread.type === 'announcement') type = 'announcement';
    if (thread.type === 'ticket') type = 'support';

    let urgency: FeedItemUrgency = 'normal';
    if (thread.ticket_status === 'resolved') urgency = 'normal'; // Resolved isn't urgent
    // TODO: Map urgency from backend priority or status

    return {
        id: thread.id,
        type,
        title: thread.title || 'Untitled',
        preview: thread.last_message_content || 'No messages yet',
        timestamp: thread.last_message_at || '', // Needs formatting
        urgency,
        unread: !!thread.unread_count && thread.unread_count > 0,
        unreadCount: thread.unread_count,
        requiresAck: !!thread.requires_ack,
        ackStatus: thread.has_acknowledged ? 'acknowledged' : 'pending',
        source: {
            name: 'Unknown', // Need sender info in ThreadDto or fetch separately?
            // For now, use title or generic
        },
        threadId: thread.id,
        status: thread.ticket_status as TicketStatus,
        // learnerContext: thread.context ? ... : undefined,
    };
};

// ============================================================
// STORE
// ============================================================

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    filter: 'all',
    sort: 'newest',
    density: 'comfortable',
    searchQuery: '',

    fetchFeed: async () => {
        set({ isLoading: true, error: null });
        try {
            const threads = await chatApi.getThreads();
            const items = threads.map(mapThreadToFeedItem);
            set({ items, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    setFilter: (filter) => set({ filter }),
    setSort: (sort) => set({ sort }),
    setDensity: (density) => set({ density }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    acknowledgeItem: async (id) => {
        // Optimistic update
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, ackStatus: 'acknowledged' as AckStatus } : item
            ),
        }));
        try {
            await chatApi.acknowledgeThread(id);
        } catch (error) {
            // Revert on error?
        }
    },

    markAsRead: async (id) => {
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, unread: false, unreadCount: 0 } : item
            ),
        }));
        // API call to mark read? Usually done when opening thread
    },

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
            // Default: newest first (assuming timestamp order string comparison works for ISO)
            // Ideally convert to Date
            return (b.timestamp || '').localeCompare(a.timestamp || '');
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
