import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { ThreadsService } from './threads.service';

// ============================================================
// CHAT GATEWAY - WebSocket for real-time messaging
// ============================================================

interface AuthenticatedSocket extends Socket {
    user_id?: string;
    tenant_id?: string;
}

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: '*', // Configure properly in production
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Track online users: user_id -> socket_id[]
    private onlineUsers: Map<string, Set<string>> = new Map();

    // Track user -> threads for targeted broadcasting
    private userThreads: Map<string, Set<string>> = new Map();

    constructor(
        private messagesService: MessagesService,
        private threadsService: ThreadsService,
    ) { }

    // ============================================
    // CONNECTION HANDLING
    // ============================================

    async handleConnection(client: AuthenticatedSocket) {
        // In production, extract user_id from JWT token in handshake
        const user_id = client.handshake.query.user_id as string;
        const tenant_id = client.handshake.query.tenant_id as string;

        if (!user_id || !tenant_id) {
            client.disconnect();
            return;
        }

        client.user_id = user_id;
        client.tenant_id = tenant_id;

        // Track online status
        if (!this.onlineUsers.has(user_id)) {
            this.onlineUsers.set(user_id, new Set());
        }
        this.onlineUsers.get(user_id)!.add(client.id);

        // Join tenant room for broadcasts
        client.join(`tenant:${tenant_id}`);

        // Broadcast presence update
        this.server.to(`tenant:${tenant_id}`).emit('presence:update', {
            user_id,
            online: true,
        });

        console.log(`User ${user_id} connected to chat`);
    }

    handleDisconnect(client: AuthenticatedSocket) {
        const user_id = client.user_id;
        const tenant_id = client.tenant_id;

        if (user_id) {
            const userSockets = this.onlineUsers.get(user_id);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.onlineUsers.delete(user_id);
                    // Broadcast offline status
                    if (tenant_id) {
                        this.server.to(`tenant:${tenant_id}`).emit('presence:update', {
                            user_id,
                            online: false,
                            last_seen: new Date().toISOString(),
                        });
                    }
                }
            }
        }

        console.log(`User ${user_id} disconnected from chat`);
    }

    // ============================================
    // JOIN THREAD ROOM
    // ============================================

    @SubscribeMessage('thread:join')
    async handleJoinThread(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { thread_id: string },
    ) {
        const { thread_id } = data;
        const user_id = client.user_id;
        const tenant_id = client.tenant_id;

        if (!user_id || !tenant_id) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify membership
        try {
            await this.threadsService.getThread(thread_id, user_id, tenant_id);
            client.join(`thread:${thread_id}`);

            // Track user's threads
            if (!this.userThreads.has(user_id)) {
                this.userThreads.set(user_id, new Set());
            }
            this.userThreads.get(user_id)!.add(thread_id);

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Not authorized' };
        }
    }

    // ============================================
    // LEAVE THREAD ROOM
    // ============================================

    @SubscribeMessage('thread:leave')
    handleLeaveThread(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { thread_id: string },
    ) {
        client.leave(`thread:${data.thread_id}`);
        return { success: true };
    }

    // ============================================
    // SEND MESSAGE
    // ============================================

    @SubscribeMessage('message:send')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: {
            thread_id: string;
            content: string;
            attachments?: any[];
            reply_to_id?: string;
        },
    ) {
        const user_id = client.user_id;

        if (!user_id) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const message = await this.messagesService.sendMessage({
                thread_id: data.thread_id,
                sender_id: user_id,
                content: data.content,
                attachments: data.attachments,
                reply_to_id: data.reply_to_id,
            });

            // Broadcast to thread room
            this.server.to(`thread:${data.thread_id}`).emit('message:new', {
                ...message,
                sender_name: 'User', // TODO: Get from user service
            });

            // Update thread for all members' inboxes
            this.server.to(`thread:${data.thread_id}`).emit('thread:updated', {
                thread_id: data.thread_id,
                last_message_content: data.content?.substring(0, 100),
                last_message_at: new Date().toISOString(),
            });

            return { success: true, message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // TYPING INDICATOR
    // ============================================

    @SubscribeMessage('typing:start')
    handleTypingStart(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { thread_id: string },
    ) {
        const user_id = client.user_id;

        // Broadcast to others in thread
        client.to(`thread:${data.thread_id}`).emit('typing:update', {
            thread_id: data.thread_id,
            user_id,
            typing: true,
        });

        return { success: true };
    }

    @SubscribeMessage('typing:stop')
    handleTypingStop(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { thread_id: string },
    ) {
        const user_id = client.user_id;

        client.to(`thread:${data.thread_id}`).emit('typing:update', {
            thread_id: data.thread_id,
            user_id,
            typing: false,
        });

        return { success: true };
    }

    // ============================================
    // MARK AS READ (real-time receipts)
    // ============================================

    @SubscribeMessage('message:read')
    async handleMessageRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { thread_id: string; message_id: string },
    ) {
        const user_id = client.user_id;

        if (!user_id) {
            return { success: false, error: 'Not authenticated' };
        }

        await this.messagesService.markRead(data.message_id, user_id);

        // Broadcast read receipt
        this.server.to(`thread:${data.thread_id}`).emit('receipt:read', {
            thread_id: data.thread_id,
            message_id: data.message_id,
            user_id,
            read_at: new Date().toISOString(),
        });

        return { success: true };
    }

    // ============================================
    // HELPER: Broadcast to user's devices
    // ============================================

    broadcastToUser(user_id: string, event: string, data: any) {
        const sockets = this.onlineUsers.get(user_id);
        if (sockets) {
            sockets.forEach(socketId => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }

    // ============================================
    // HELPER: Check if user is online
    // ============================================

    isUserOnline(user_id: string): boolean {
        const sockets = this.onlineUsers.get(user_id);
        return !!sockets && sockets.size > 0;
    }
}
