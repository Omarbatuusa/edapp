'use client';

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { useChatSocket, SocketMessage, TypingUpdate, PresenceUpdate, ReadReceipt } from '@/hooks/useChatSocket';

// ============================================================
// CHAT CONTEXT - Global chat state management
// ============================================================

interface Message {
    id: string;
    threadId: string;
    content: string;
    senderId: string;
    senderName?: string;
    isOwn: boolean;
    timestamp: string;
    date: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    attachments?: unknown[];
}

interface Thread {
    id: string;
    name: string;
    avatar?: string;
    subtitle?: string;
    type: 'dm' | 'group' | 'announcement' | 'ticket' | 'safeguarding';
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    online?: boolean;
}

interface ChatContextValue {
    // Connection state
    isConnected: boolean;

    // Current user
    currentUserId: string | null;

    // Threads
    threads: Thread[];
    currentThread: Thread | null;
    setCurrentThread: (thread: Thread | null) => void;

    // Messages
    messages: Message[];
    sendMessage: (content: string, attachments?: unknown[]) => Promise<void>;

    // Typing
    typingUsers: Map<string, string[]>; // thread_id -> user_ids
    startTyping: () => void;
    stopTyping: () => void;

    // Presence
    onlineUsers: Set<string>;

    // Read state
    markThreadAsRead: () => void;

    // Actions
    joinThread: (threadId: string) => Promise<boolean>;
    leaveThread: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
    tenantId: string;
    userId: string;
    children: ReactNode;
}

export function ChatProvider({ tenantId, userId, children }: ChatProviderProps) {
    // Local state
    const [threads, setThreads] = useState<Thread[]>([]);
    const [currentThread, setCurrentThread] = useState<Thread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    // Socket connection
    const {
        isConnected,
        currentThreadId,
        joinThread: socketJoinThread,
        leaveThread: socketLeaveThread,
        sendMessage: socketSendMessage,
        startTyping: socketStartTyping,
        stopTyping: socketStopTyping,
        markAsRead: socketMarkAsRead,
        setMessageHandlers,
    } = useChatSocket({
        tenant_id: tenantId,
        user_id: userId,
    });

    // Format date for display
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Format time for display
    const formatTime = (dateStr: string): string => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Register socket event handlers
    useEffect(() => {
        setMessageHandlers({
            onNewMessage: (msg: SocketMessage) => {
                const newMessage: Message = {
                    id: msg.id,
                    threadId: msg.thread_id,
                    content: msg.content,
                    senderId: msg.sender_id,
                    senderName: msg.sender_name,
                    isOwn: msg.sender_id === userId,
                    timestamp: formatTime(msg.created_at),
                    date: formatDate(msg.created_at),
                    status: msg.sender_id === userId ? 'sent' : undefined,
                    attachments: msg.attachments,
                };

                // Add to messages if in the thread
                if (currentThreadId === msg.thread_id) {
                    setMessages((prev) => [...prev, newMessage]);
                }

                // Update thread last message
                setThreads((prev) =>
                    prev.map((t) =>
                        t.id === msg.thread_id
                            ? {
                                ...t,
                                lastMessage: msg.content,
                                lastMessageAt: msg.created_at,
                                unreadCount: currentThreadId === msg.thread_id ? t.unreadCount : t.unreadCount + 1,
                            }
                            : t
                    )
                );
            },

            onTypingUpdate: (update: TypingUpdate) => {
                if (update.user_id === userId) return; // Ignore own typing

                setTypingUsers((prev) => {
                    const newMap = new Map(prev);
                    const users = newMap.get(update.thread_id) || [];

                    if (update.typing) {
                        if (!users.includes(update.user_id)) {
                            newMap.set(update.thread_id, [...users, update.user_id]);
                        }
                    } else {
                        newMap.set(update.thread_id, users.filter((id) => id !== update.user_id));
                    }

                    return newMap;
                });
            },

            onPresenceUpdate: (update: PresenceUpdate) => {
                setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    if (update.online) {
                        newSet.add(update.user_id);
                    } else {
                        newSet.delete(update.user_id);
                    }
                    return newSet;
                });

                // Update thread online status for DMs
                setThreads((prev) =>
                    prev.map((t) =>
                        t.type === 'dm' ? { ...t, online: update.online } : t
                    )
                );
            },

            onReadReceipt: (receipt: ReadReceipt) => {
                // Update message status to read
                if (receipt.thread_id === currentThreadId) {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === receipt.message_id && m.isOwn
                                ? { ...m, status: 'read' }
                                : m
                        )
                    );
                }
            },

            onThreadUpdated: (update) => {
                setThreads((prev) =>
                    prev.map((t) =>
                        t.id === update.thread_id
                            ? {
                                ...t,
                                lastMessage: update.last_message_content,
                                lastMessageAt: update.last_message_at,
                            }
                            : t
                    )
                );
            },
        });
    }, [setMessageHandlers, userId, currentThreadId]);

    // Join thread
    const joinThread = useCallback(async (threadId: string) => {
        const success = await socketJoinThread(threadId);
        if (success) {
            // Find and set current thread
            const thread = threads.find((t) => t.id === threadId);
            if (thread) {
                setCurrentThread(thread);
            }
            // TODO: Fetch messages from API
        }
        return success;
    }, [socketJoinThread, threads]);

    // Leave thread
    const leaveThread = useCallback(() => {
        if (currentThreadId) {
            socketLeaveThread(currentThreadId);
            setCurrentThread(null);
            setMessages([]);
        }
    }, [currentThreadId, socketLeaveThread]);

    // Send message
    const sendMessage = useCallback(async (content: string, attachments?: unknown[]) => {
        if (!currentThreadId) {
            throw new Error('No thread selected');
        }

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            threadId: currentThreadId,
            content,
            senderId: userId,
            isOwn: true,
            timestamp: formatTime(new Date().toISOString()),
            date: 'Today',
            status: 'sending',
            attachments,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const response = await socketSendMessage(currentThreadId, content, attachments);

            if (response.success && response.message) {
                // Replace temp message with real one
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === tempId
                            ? {
                                ...m,
                                id: response.message!.id,
                                status: 'sent',
                            }
                            : m
                    )
                );
            } else {
                // Remove failed message
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                throw new Error(response.error || 'Failed to send message');
            }
        } catch (error) {
            // Remove failed message
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            throw error;
        }
    }, [currentThreadId, userId, socketSendMessage]);

    // Typing indicators
    const startTyping = useCallback(() => {
        if (currentThreadId) {
            socketStartTyping(currentThreadId);
        }
    }, [currentThreadId, socketStartTyping]);

    const stopTyping = useCallback(() => {
        if (currentThreadId) {
            socketStopTyping(currentThreadId);
        }
    }, [currentThreadId, socketStopTyping]);

    // Mark thread as read
    const markThreadAsRead = useCallback(() => {
        if (currentThreadId && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            socketMarkAsRead(currentThreadId, lastMessage.id);

            // Update local unread count
            setThreads((prev) =>
                prev.map((t) =>
                    t.id === currentThreadId ? { ...t, unreadCount: 0 } : t
                )
            );
        }
    }, [currentThreadId, messages, socketMarkAsRead]);

    const value: ChatContextValue = {
        isConnected,
        currentUserId: userId,
        threads,
        currentThread,
        setCurrentThread,
        messages,
        sendMessage,
        typingUsers,
        startTyping,
        stopTyping,
        onlineUsers,
        markThreadAsRead,
        joinThread,
        leaveThread,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}

// Helper hook to check if a user is typing in a thread
export function useTypingIndicator(threadId: string) {
    const { typingUsers } = useChatContext();
    return typingUsers.get(threadId) || [];
}

// Helper hook to check if a user is online
export function useOnlineStatus(userId: string) {
    const { onlineUsers } = useChatContext();
    return onlineUsers.has(userId);
}
