import { create } from 'zustand';
import chatApi, { MessageDto } from './chat-api';
import { offlineQueue } from './offline-queue';

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
    status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read';
    createdAtMs?: number; // unix ms — used for clustering precision
    is_edited?: boolean;
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
    typing: Record<string, unknown[]>;
    presence: Record<string, unknown>;

    // UI State
    activeFilter: 'all' | 'unread' | 'groups' | 'staff' | 'grades' | 'support' | 'announcements';
    setFilter: (filter: 'all' | 'unread' | 'groups' | 'staff' | 'grades' | 'support' | 'announcements') => void;

    // Actions
    setThreads: (threads: Thread[]) => void;
    setActiveThread: (threadId: string | null) => void;
    markThreadRead: (threadId: string) => void;

    // Async Actions
    fetchMessages: (threadId: string, userId: string) => Promise<void>;
    sendMessage: (threadId: string, content: string, userId: string) => Promise<void>;
    sendMessageWithAttachment: (threadId: string, file: File, userId: string, type?: 'image' | 'document' | 'voice') => Promise<void>;
    deleteMessage: (threadId: string, messageId: string) => Promise<void>;
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
        date: date.toLocaleDateString(),
        createdAtMs: date.getTime(),
        status: 'read',
        is_edited: dto.is_edited ?? false,
        attachments: dto.attachments,
        actionData: dto.action_data as Message['actionData'],
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
    markThreadRead: (threadId) => set(state => ({
        threads: state.threads.map(t =>
            t.id === threadId ? { ...t, unreadCount: 0 } : t
        )
    })),

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
        const nowMs = Date.now();
        const tempId = nowMs.toString();
        const optimisticMsg: Message = {
            id: tempId,
            threadId,
            contentType: 'text',
            content,
            senderId: userId,
            isMe: true,
            time: new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(nowMs).toLocaleDateString(),
            createdAtMs: nowMs,
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
            console.error('Send failed, queueing offline:', error);
            // Mark as queued
            set(state => ({
                messagesByThread: {
                    ...state.messagesByThread,
                    [threadId]: state.messagesByThread[threadId].map(m =>
                        m.id === tempId ? { ...m, status: 'queued' as const } : m
                    ),
                },
            }));
            // Queue for retry
            offlineQueue.enqueue({
                id: tempId,
                thread_id: threadId,
                content,
                created_at: new Date().toISOString(),
            }).catch(() => { });
        }
    },

    sendMessageWithAttachment: async (threadId, file, userId, type) => {
        const attachType = type || (file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'voice' : 'document');
        const now = Date.now();
        const tempId = now.toString();
        const localBlobUrl = URL.createObjectURL(file); // local preview while uploading
        const optimisticMsg: Message = {
            id: tempId,
            threadId,
            contentType: attachType === 'voice' ? 'voice' : attachType === 'image' ? 'image' : 'document',
            content: file.name,
            senderId: userId,
            isMe: true,
            time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(now).toLocaleDateString(),
            createdAtMs: now,
            status: 'sending',
            attachments: [{ type: attachType, url: localBlobUrl, name: file.name }],
        };

        set(state => ({
            messagesByThread: {
                ...state.messagesByThread,
                [threadId]: [...(state.messagesByThread[threadId] || []), optimisticMsg]
            }
        }));

        try {
            const { url } = await chatApi.uploadAttachment(file);
            const dto = await chatApi.sendMessage({
                thread_id: threadId,
                content: attachType === 'voice' ? '' : file.name,
                attachments: [{
                    type: attachType,
                    url,
                    name: file.name,
                    size_bytes: file.size,
                    mime_type: file.type,
                }],
            });
            URL.revokeObjectURL(localBlobUrl); // free memory once real URL arrives
            const realMsg = mapDtoToMessage(dto, userId);
            set(state => ({
                messagesByThread: {
                    ...state.messagesByThread,
                    [threadId]: state.messagesByThread[threadId].map(m => m.id === tempId ? realMsg : m)
                }
            }));
        } catch (error) {
            console.error('Attachment upload failed:', error);
            set(state => ({
                messagesByThread: {
                    ...state.messagesByThread,
                    [threadId]: state.messagesByThread[threadId].map(m =>
                        m.id === tempId ? { ...m, status: 'queued' as const } : m
                    ),
                },
            }));
        }
    },

    deleteMessage: async (threadId, messageId) => {
        // Optimistic remove
        set(state => ({
            messagesByThread: {
                ...state.messagesByThread,
                [threadId]: (state.messagesByThread[threadId] || []).filter(m => m.id !== messageId),
            },
        }));
        try {
            await chatApi.deleteMessage(messageId);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    },

    drainOfflineQueue: async (userId: string) => {
        try {
            const pending = await offlineQueue.getAll();
            for (const msg of pending) {
                try {
                    const dto = await chatApi.sendMessage({ thread_id: msg.thread_id, content: msg.content });
                    const realMsg = mapDtoToMessage(dto, userId);

                    set(state => ({
                        messagesByThread: {
                            ...state.messagesByThread,
                            [msg.thread_id]: (state.messagesByThread[msg.thread_id] || []).map(m =>
                                m.id === msg.id ? realMsg : m
                            ),
                        },
                    }));

                    await offlineQueue.dequeue(msg.id);
                } catch {
                    await offlineQueue.incrementRetry(msg.id);
                }
            }
        } catch {
            // IndexedDB not available
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
            await chatApi.updateActionStatus(messageId, action);
        } catch (error) {
            console.error(error);
            // Revert?
        }
    }
}));
