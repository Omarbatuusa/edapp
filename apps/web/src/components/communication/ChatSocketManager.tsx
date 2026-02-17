'use client';

import { useEffect, useState } from 'react';
import { useChatStore, Message } from '../../lib/chat-store';
import { useCommunicationStore } from '../../lib/communication-store';

interface ChatSocketManagerProps {
    tenantId: string;
    userId: string;
}

// This component manages WebSocket connections for chat
// It is designed to be resilient - socket failures should NOT crash the UI
export function ChatSocketManager({ tenantId, userId }: ChatSocketManagerProps) {
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const receiveMessage = useChatStore(state => state.receiveMessage);
    const receiveActionUpdate = useChatStore(state => state.receiveActionUpdate);
    const activeThreadId = useChatStore(state => state.activeThreadId);

    useEffect(() => {
        // Don't try to connect if we don't have required params
        if (!tenantId || !userId) {
            console.log('[ChatSocket] Skipping - no tenant/user ID');
            return;
        }

        // Don't run on server
        if (typeof window === 'undefined') {
            return;
        }

        let socket: any = null;
        let mounted = true;

        const connectSocket = async () => {
            try {
                setIsConnecting(true);
                setConnectionError(null);

                // Dynamically import socket.io-client to prevent SSR issues
                const { io } = await import('socket.io-client');

                if (!mounted) return;

                const backendUrl = window.location.origin;

                socket = io(`${backendUrl}/chat`, {
                    query: { tenant_id: tenantId, user_id: userId },
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 3, // Reduced from 5
                    reconnectionDelay: 2000,
                    timeout: 15000, // Increased timeout
                    autoConnect: true,
                });

                socket.on('connect', () => {
                    console.log('[ChatSocket] Connected successfully');
                    if (mounted) {
                        setConnectionError(null);
                        setIsConnecting(false);
                        // Drain offline queue on reconnect
                        const store = useChatStore.getState() as any;
                        if (store.drainOfflineQueue) {
                            store.drainOfflineQueue(userId);
                        }
                    }
                });

                socket.on('disconnect', (reason: string) => {
                    console.log('[ChatSocket] Disconnected:', reason);
                });

                socket.on('connect_error', (error: Error) => {
                    console.warn('[ChatSocket] Connection error (non-fatal):', error.message);
                    if (mounted) {
                        setConnectionError(error.message);
                        setIsConnecting(false);
                    }
                    // Don't throw - let the UI continue without realtime
                });

                // Message handlers
                socket.on('message:new', (socketMsg: any) => {
                    if (!mounted) return;
                    try {
                        const message: Message = {
                            id: socketMsg.id,
                            threadId: socketMsg.thread_id,
                            content: socketMsg.content,
                            contentType: 'text',
                            senderId: socketMsg.sender_id,
                            senderName: socketMsg.sender_name,
                            isMe: socketMsg.sender_id === userId,
                            time: new Date(socketMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            date: new Date(socketMsg.created_at).toLocaleDateString(),
                            status: 'sent',
                            attachments: socketMsg.attachments,
                        };
                        receiveMessage(message);
                    } catch (e) {
                        console.warn('[ChatSocket] Error processing message:', e);
                    }
                });

                socket.on('action:updated', (update: { thread_id: string; message_id: string; status: 'approved' | 'rejected' | 'acknowledged' }) => {
                    if (!mounted) return;
                    try {
                        receiveActionUpdate(update.thread_id, update.message_id, update.status);
                    } catch (e) {
                        console.warn('[ChatSocket] Error processing action:', e);
                    }
                });

                // Typing indicator
                socket.on('typing:start', (data: { thread_id: string; user_id: string; display_name: string }) => {
                    if (!mounted || data.user_id === userId) return;
                    const store = useChatStore.getState();
                    const current = store.typing[data.thread_id] || [];
                    if (!current.some((t: any) => t.user_id === data.user_id)) {
                        useChatStore.setState({
                            typing: { ...store.typing, [data.thread_id]: [...current, { user_id: data.user_id, display_name: data.display_name }] },
                        });
                    }
                });

                socket.on('typing:stop', (data: { thread_id: string; user_id: string }) => {
                    if (!mounted || data.user_id === userId) return;
                    const store = useChatStore.getState();
                    const current = store.typing[data.thread_id] || [];
                    useChatStore.setState({
                        typing: { ...store.typing, [data.thread_id]: current.filter((t: any) => t.user_id !== data.user_id) },
                    });
                });

                // New event listeners for broadcast events
                socket.on('announcement:published', () => {
                    if (!mounted) return;
                    useCommunicationStore.getState().fetchFeed();
                });

                socket.on('ticket:status_changed', () => {
                    if (!mounted) return;
                    useCommunicationStore.getState().fetchFeed();
                });

                socket.on('ticket:assigned', () => {
                    if (!mounted) return;
                    useCommunicationStore.getState().fetchFeed();
                });

                socket.on('action:created', () => {
                    if (!mounted) return;
                    useCommunicationStore.getState().fetchFeed();
                });

                socket.on('feed:refresh', () => {
                    if (!mounted) return;
                    useCommunicationStore.getState().fetchFeed();
                });

                // Join active thread if any
                if (activeThreadId && socket.connected) {
                    socket.emit('thread:join', { thread_id: activeThreadId });
                }

            } catch (error) {
                console.warn('[ChatSocket] Failed to initialize (non-fatal):', error);
                if (mounted) {
                    setConnectionError(error instanceof Error ? error.message : 'Connection failed');
                    setIsConnecting(false);
                }
                // Don't throw - let the UI continue without realtime
            }
        };

        connectSocket();

        return () => {
            mounted = false;
            if (socket) {
                try {
                    socket.disconnect();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, [tenantId, userId, activeThreadId, receiveMessage, receiveActionUpdate]);

    // This component renders nothing - it's just for managing the socket
    // If there's an error, we could optionally show a small indicator
    // but we should NOT crash the app
    return null;
}
