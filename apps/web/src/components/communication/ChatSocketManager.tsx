import { useEffect } from 'react';
import { useChatSocket, SocketMessage } from '../../hooks/useChatSocket';
import { useChatStore, Message } from '../../lib/chat-store';

interface ChatSocketManagerProps {
    tenantId: string;
    userId: string;
}

export function ChatSocketManager({ tenantId, userId }: ChatSocketManagerProps) {
    const receiveMessage = useChatStore(state => state.receiveMessage);
    const receiveActionUpdate = useChatStore(state => state.receiveActionUpdate);

    const {
        isConnected,
        setMessageHandlers,
        joinThread,
        leaveThread
    } = useChatSocket({
        tenant_id: tenantId,
        user_id: userId,
        onConnect: () => console.log('Connected to Chat Socket'),
        onError: (err) => console.error('Chat Socket Error:', err),
    });

    const activeThreadId = useChatStore(state => state.activeThreadId);

    // Sync active thread with socket room
    useEffect(() => {
        if (activeThreadId) {
            joinThread(activeThreadId);
        } else {
            // leaveThread?
        }
    }, [activeThreadId, joinThread]);

    // Register handlers
    useEffect(() => {
        setMessageHandlers({
            onNewMessage: (socketMsg: SocketMessage) => {
                // Map socket message to store message
                const message: Message = {
                    id: socketMsg.id,
                    threadId: socketMsg.thread_id,
                    content: socketMsg.content,
                    contentType: 'text', // TODO: Map type from socket if available
                    senderId: socketMsg.sender_id,
                    senderName: socketMsg.sender_name,
                    isMe: socketMsg.sender_id === userId,
                    time: new Date(socketMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(socketMsg.created_at).toLocaleDateString(),
                    status: 'sent', // Received messages are at least sent
                    attachments: socketMsg.attachments,
                    // TODO: Action data in socket message?
                };
                receiveMessage(message);
            },
            onActionUpdated: (update: { thread_id: string; message_id: string; status: 'approved' | 'rejected' | 'acknowledged' }) => {
                receiveActionUpdate(update.thread_id, update.message_id, update.status);
            }
        });
    }, [setMessageHandlers, receiveMessage, receiveActionUpdate, userId]);

    return null; // Logic only component
}
