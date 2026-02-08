import { create } from 'zustand';
import chatApi, { MessageDto } from './chat-api';

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
    contentType: 'text' | 'image' | 'document' | 'voice' | 'system' | 'action_card';
    content: string; // Text or fallback
    senderId: string;
    senderName?: string;
    isMe: boolean;
    time: string;
    date: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    attachments?: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        duration?: number;
    }[];
    actionType?: 'approval' | 'acknowledgement';
    actionData?: {
        title: string;
        subtitle: string;
        status: 'pending' | 'approved' | 'rejected' | 'acknowledged';
    };
}

interface ChatState {
    // Threads
    threads: Thread[];
    activeThreadId: string | null;
    activeThread: Thread | null;

    // Messages (by thread)
    messagesByThread: { [threadId: string]: Message[] };
    isLoadingMessages: boolean;

    // Realtime state
    typing: Record<string, any[]>;
    presence: Record<string, any>;

    // UI State
    activeFilter: 'all' | 'unread' | 'groups' | 'staff' | 'grades' | 'support' | 'announcements';
    setFilter: (filter: 'all' | 'unread' | 'groups' | 'staff' | 'grades' | 'support' | 'announcements') => void;

    // Actions
    setThreads: (threads: Thread[]) => void;
    setActiveThread: (threadId: string | null) => void;

    // Async Actions
    fetchMessages: (threadId: string, userId: string) => Promise<void>;
    sendMessage: (threadId: string, content: string, userId: string) => Promise<void>;
    handleAction: (threadId: string, messageId: string, action: 'approved' | 'rejected' | 'acknowledged', userId: string) => Promise<void>;

    // Socket Actions
    receiveMessage: (message: Message) => void;
    receiveActionUpdate: (threadId: string, messageId: string, status: 'approved' | 'rejected' | 'acknowledged') => void;
}

// Mapper helper
const mapDtoToMessage = (dto: MessageDto, currentUserId: string): Message => {
    const date = new Date(dto.created_at);
    return {
        id: dto.id,
        threadId: dto.thread_id,
        contentType: dto.type,
        content: dto.content,
        senderId: dto.sender_id,
        senderName: dto.sender_name,
        isMe: dto.sender_id === currentUserId,
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString(), // simplified
        status: 'read', // simplified
        attachments: dto.attachments,
        actionType: dto.action_data?.type,
        actionData: dto.action_data,
    };
};

export const useChatStore = create<ChatState>((set, get) => ({
    threads: [],
    activeThreadId: null,
    activeThread: null,
    messagesByThread: {},
    isLoadingMessages: false,
    typing: {},
    presence: {},

    activeFilter: 'all',
    setFilter: (filter) => set({ activeFilter: filter }),

    setThreads: (threads) => set({ threads }),
    setActiveThread: (threadId) => set({ activeThreadId: threadId }),

    fetchMessages: async (threadId, userId) => {
        set({ isLoadingMessages: true });
        try {
            const dtos = await chatApi.getMessages(threadId);
            const messages = dtos.map(dto => mapDtoToMessage(dto, userId)).reverse(); // Reverse for chat order?

            set(state => ({
                messagesByThread: {
                    ...state.messagesByThread,
                    [threadId]: messages
                },
                isLoadingMessages: false
            }));
        } catch (error) {
            console.error(error);
            set({ isLoadingMessages: false });
        }
    },

    sendMessage: async (threadId, content, userId) => {
        // Optimistic add
        const tempId = Date.now().toString();
        const optimisticMsg: Message = {
            id: tempId,
            threadId,
            contentType: 'text',
            content,
            senderId: userId,
            isMe: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today',
            status: 'sending'
        };

        set(state => ({
            messagesByThread: {
                ...state.messagesByThread,
                [threadId]: [...(state.messagesByThread[threadId] || []), optimisticMsg]
            }
        }));

        try {
            const dto = await chatApi.sendMessage({ thread_id: threadId, content });
            const realMsg = mapDtoToMessage(dto, userId);

            set(state => ({
                messagesByThread: {
                    ...state.messagesByThread,
                    [threadId]: state.messagesByThread[threadId].map(m => m.id === tempId ? realMsg : m)
                }
            }));
        } catch (error) {
            console.error(error);
            // Remove optimistic message or mark error?
        }
    },

    // Socket Event Actions
    receiveMessage: (message: Message) => set((state) => {
        const threadMessages = state.messagesByThread[message.threadId] || [];
        // Dedup check
        if (threadMessages.some(m => m.id === message.id)) return {};

        return {
            messagesByThread: {
                ...state.messagesByThread,
                [message.threadId]: [...threadMessages, message]
            },
            threads: state.threads.map(t =>
                t.id === message.threadId
                    ? {
                        ...t,
                        lastMessage: message.content,
                        lastMessageTime: message.time, // or timestamp
                        unreadCount: t.id === state.activeThreadId ? t.unreadCount : t.unreadCount + 1
                    }
                    : t
            )
        };
    }),

    receiveActionUpdate: (threadId, messageId, status) => set((state) => ({
        messagesByThread: {
            ...state.messagesByThread,
            [threadId]: state.messagesByThread[threadId]?.map(m =>
                m.id === messageId && m.actionData
                    ? { ...m, actionData: { ...m.actionData, status } }
                    : m
            ) || []
        }
    })),

    handleAction: async (threadId, messageId, action, userId) => {
        // Optimistic update
        set(state => ({
            messagesByThread: {
                ...state.messagesByThread,
                [threadId]: state.messagesByThread[threadId]?.map(m => {
                    if (m.id === messageId && m.actionData) {
                        return {
                            ...m,
                            actionData: { ...m.actionData, status: action }
                        };
                    }
                    return m;
                }) || []
            }
        }));

        try {
            await chatApi.updateActionStatus(messageId, action, userId);
        } catch (error) {
            console.error(error);
            // Revert?
        }
    }
}));
