'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// ============================================================
// CHAT SOCKET HOOK - WebSocket connection for real-time chat
// ============================================================

export interface ChatSocketOptions {
    tenant_id: string;
    user_id: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

export interface SocketMessage {
    id: string;
    thread_id: string;
    sender_id: string;
    sender_name?: string;
    content: string;
    attachments?: any[];
    created_at: string;
}

export interface TypingUpdate {
    thread_id: string;
    user_id: string;
    typing: boolean;
}

export interface PresenceUpdate {
    user_id: string;
    online: boolean;
    last_seen?: string;
}

export interface ReadReceipt {
    thread_id: string;
    message_id: string;
    user_id: string;
    read_at: string;
}

export function useChatSocket(options: ChatSocketOptions) {
    const { tenant_id, user_id, onConnect, onDisconnect, onError } = options;
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

    // Message handlers
    const messageHandlersRef = useRef<{
        onNewMessage?: (message: SocketMessage) => void;
        onTypingUpdate?: (update: TypingUpdate) => void;
        onPresenceUpdate?: (update: PresenceUpdate) => void;
        onReadReceipt?: (receipt: ReadReceipt) => void;
        onThreadUpdated?: (update: { thread_id: string; last_message_content: string; last_message_at: string }) => void;
    }>({});

    // Initialize socket connection
    useEffect(() => {
        if (!tenant_id || !user_id) return;

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const socket = io(`${backendUrl}/chat`, {
            query: { tenant_id, user_id },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[ChatSocket] Connected');
            setIsConnected(true);
            onConnect?.();
        });

        socket.on('disconnect', (reason) => {
            console.log('[ChatSocket] Disconnected:', reason);
            setIsConnected(false);
            onDisconnect?.();
        });

        socket.on('connect_error', (error) => {
            console.error('[ChatSocket] Connection error:', error);
            onError?.(error);
        });

        // Message events
        socket.on('message:new', (message: SocketMessage) => {
            console.log('[ChatSocket] New message:', message);
            messageHandlersRef.current.onNewMessage?.(message);
        });

        socket.on('typing:update', (update: TypingUpdate) => {
            messageHandlersRef.current.onTypingUpdate?.(update);
        });

        socket.on('presence:update', (update: PresenceUpdate) => {
            messageHandlersRef.current.onPresenceUpdate?.(update);
        });

        socket.on('receipt:read', (receipt: ReadReceipt) => {
            messageHandlersRef.current.onReadReceipt?.(receipt);
        });

        socket.on('thread:updated', (update) => {
            messageHandlersRef.current.onThreadUpdated?.(update);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [tenant_id, user_id, onConnect, onDisconnect, onError]);

    // Join a thread room
    const joinThread = useCallback(async (thread_id: string) => {
        if (!socketRef.current?.connected) {
            console.warn('[ChatSocket] Not connected, cannot join thread');
            return false;
        }

        return new Promise<boolean>((resolve) => {
            socketRef.current!.emit('thread:join', { thread_id }, (response: { success: boolean }) => {
                if (response.success) {
                    setCurrentThreadId(thread_id);
                }
                resolve(response.success);
            });
        });
    }, []);

    // Leave a thread room
    const leaveThread = useCallback((thread_id: string) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('thread:leave', { thread_id });
        if (currentThreadId === thread_id) {
            setCurrentThreadId(null);
        }
    }, [currentThreadId]);

    // Send a message
    const sendMessage = useCallback(async (
        thread_id: string,
        content: string,
        attachments?: any[],
        reply_to_id?: string
    ) => {
        if (!socketRef.current?.connected) {
            throw new Error('Not connected to chat server');
        }

        return new Promise<{ success: boolean; message?: SocketMessage; error?: string }>((resolve) => {
            socketRef.current!.emit(
                'message:send',
                { thread_id, content, attachments, reply_to_id },
                resolve
            );
        });
    }, []);

    // Typing indicators
    const startTyping = useCallback((thread_id: string) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('typing:start', { thread_id });
    }, []);

    const stopTyping = useCallback((thread_id: string) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('typing:stop', { thread_id });
    }, []);

    // Mark message as read
    const markAsRead = useCallback((thread_id: string, message_id: string) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('message:read', { thread_id, message_id });
    }, []);

    // Register event handlers
    const setMessageHandlers = useCallback((handlers: typeof messageHandlersRef.current) => {
        messageHandlersRef.current = { ...messageHandlersRef.current, ...handlers };
    }, []);

    return {
        isConnected,
        currentThreadId,
        joinThread,
        leaveThread,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        setMessageHandlers,
    };
}
