import { create } from 'zustand';

// ============================================================
// CHAT STORE - Zustand store for chat state management
// ============================================================

export interface Thread {
    id: string;
    type: 'dm' | 'group' | 'announcement' | 'ticket' | 'safeguarding';
    name: string;
    avatar?: string;
    subtitle?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    muted?: boolean;
    pinned?: boolean;
    online?: boolean;
    // ACK for announcements
    requiresAck?: boolean;
    acknowledged?: boolean;
    // Ticket specific
    ticketStatus?: 'open' | 'pending' | 'closed';
    ticketCategory?: 'fees' | 'admissions' | 'transport' | 'it' | 'general';
}

export interface Message {
    id: string;
    threadId: string;
    content: string;
    senderId: string;
    senderName?: string;
    isOwn: boolean;
    timestamp: string;
    date: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    attachments?: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        duration?: number;
    }[];
}

interface TypingState {
    [threadId: string]: {
        userId: string;
        userName: string;
        timestamp: number;
    }[];
}

interface PresenceState {
    [userId: string]: {
        online: boolean;
        lastSeen?: string;
    };
}

interface ChatState {
    // Threads
    threads: Thread[];
    activeThreadId: string | null;
    activeThread: Thread | null;

    // Messages (by thread)
    messagesByThread: { [threadId: string]: Message[] };

    // Realtime state
    typing: TypingState;
    presence: PresenceState;

    // Filter
    activeFilter: string;

    // Actions
    setThreads: (threads: Thread[]) => void;
    setActiveThread: (threadId: string | null) => void;
    addMessage: (message: Message) => void;
    updateMessage: (messageId: string, updates: Partial<Message>) => void;
    setMessages: (threadId: string, messages: Message[]) => void;
    markThreadRead: (threadId: string) => void;
    setTyping: (threadId: string, users: TypingState[string]) => void;
    setPresence: (userId: string, presence: PresenceState[string]) => void;
    setFilter: (filter: string) => void;
    toggleMute: (threadId: string) => void;
    togglePin: (threadId: string) => void;
    acknowledgeAnnouncement: (threadId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    threads: [],
    activeThreadId: null,
    activeThread: null,
    messagesByThread: {},
    typing: {},
    presence: {},
    activeFilter: 'all',

    // Actions
    setThreads: (threads) => set({ threads }),

    setActiveThread: (threadId) => set((state) => ({
        activeThreadId: threadId,
        activeThread: threadId ? state.threads.find(t => t.id === threadId) || null : null
    })),

    addMessage: (message) => set((state) => {
        const threadMessages = state.messagesByThread[message.threadId] || [];
        return {
            messagesByThread: {
                ...state.messagesByThread,
                [message.threadId]: [...threadMessages, message]
            },
            // Update thread's last message
            threads: state.threads.map(t =>
                t.id === message.threadId
                    ? { ...t, lastMessage: message.content, lastMessageTime: message.timestamp }
                    : t
            )
        };
    }),

    updateMessage: (messageId, updates) => set((state) => {
        const newMessagesByThread = { ...state.messagesByThread };
        for (const threadId in newMessagesByThread) {
            newMessagesByThread[threadId] = newMessagesByThread[threadId].map(m =>
                m.id === messageId ? { ...m, ...updates } : m
            );
        }
        return { messagesByThread: newMessagesByThread };
    }),

    setMessages: (threadId, messages) => set((state) => ({
        messagesByThread: {
            ...state.messagesByThread,
            [threadId]: messages
        }
    })),

    markThreadRead: (threadId) => set((state) => ({
        threads: state.threads.map(t =>
            t.id === threadId ? { ...t, unreadCount: 0 } : t
        )
    })),

    setTyping: (threadId, users) => set((state) => ({
        typing: {
            ...state.typing,
            [threadId]: users
        }
    })),

    setPresence: (userId, presence) => set((state) => ({
        presence: {
            ...state.presence,
            [userId]: presence
        }
    })),

    setFilter: (filter) => set({ activeFilter: filter }),

    toggleMute: (threadId) => set((state) => ({
        threads: state.threads.map(t =>
            t.id === threadId ? { ...t, muted: !t.muted } : t
        )
    })),

    togglePin: (threadId) => set((state) => ({
        threads: state.threads.map(t =>
            t.id === threadId ? { ...t, pinned: !t.pinned } : t
        )
    })),

    acknowledgeAnnouncement: (threadId) => set((state) => ({
        threads: state.threads.map(t =>
            t.id === threadId ? { ...t, acknowledged: true } : t
        )
    }))
}));

// ============================================================
// SELECTORS - For derived state
// ============================================================

export const selectFilteredThreads = (state: ChatState) => {
    const { threads, activeFilter } = state;

    switch (activeFilter) {
        case 'unread':
            return threads.filter(t => t.unreadCount > 0);
        case 'groups':
            return threads.filter(t => t.type === 'group');
        case 'staff':
            return threads.filter(t => t.type === 'dm');
        case 'grades':
            return threads.filter(t => t.type === 'group' && t.name.includes('Grade'));
        case 'support':
            return threads.filter(t => t.type === 'ticket');
        case 'announcements':
            return threads.filter(t => t.type === 'announcement');
        default:
            return threads;
    }
};

export const selectUnreadCount = (state: ChatState) =>
    state.threads.reduce((sum, t) => sum + t.unreadCount, 0);

export const selectPinnedThreads = (state: ChatState) =>
    state.threads.filter(t => t.pinned || (t.type === 'announcement' && t.requiresAck && !t.acknowledged));
