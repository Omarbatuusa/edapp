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

// ============================================================
// CALLS GATEWAY - WebSocket namespace for WebRTC signaling
// ============================================================

interface AuthenticatedSocket extends Socket {
    user_id?: string;
    tenant_id?: string;
}

@WebSocketGateway({
    namespace: '/calls',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Track connected users: user_id -> socket_id
    private userSockets: Map<string, string> = new Map();

    async handleConnection(client: AuthenticatedSocket) {
        const user_id = client.handshake.query.user_id as string;
        const tenant_id = client.handshake.query.tenant_id as string;

        if (!user_id || !tenant_id) {
            client.disconnect();
            return;
        }

        client.user_id = user_id;
        client.tenant_id = tenant_id;
        this.userSockets.set(user_id, client.id);
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.user_id) {
            this.userSockets.delete(client.user_id);
        }
    }

    // ============================================
    // START CALL
    // ============================================
    @SubscribeMessage('call:start')
    handleCallStart(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { call_id: string; target_user_id: string; offer: any },
    ) {
        const targetSocketId = this.userSockets.get(data.target_user_id);
        if (!targetSocketId) {
            return { success: false, error: 'User offline' };
        }

        this.server.to(targetSocketId).emit('call:incoming', {
            call_id: data.call_id,
            caller_id: client.user_id,
            caller_name: client.user_id, // Could fetch from user service
        });

        this.server.to(targetSocketId).emit('call:offer', {
            offer: data.offer,
        });

        return { success: true };
    }

    // ============================================
    // ACCEPT CALL
    // ============================================
    @SubscribeMessage('call:accept')
    handleCallAccept(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { call_id: string; caller_id: string; answer: any },
    ) {
        const callerSocketId = this.userSockets.get(data.caller_id);
        if (callerSocketId) {
            this.server.to(callerSocketId).emit('call:accepted', {
                answer: data.answer,
            });
        }

        return { success: true };
    }

    // ============================================
    // REJECT CALL
    // ============================================
    @SubscribeMessage('call:reject')
    handleCallReject(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { call_id: string; caller_id: string },
    ) {
        const callerSocketId = this.userSockets.get(data.caller_id);
        if (callerSocketId) {
            this.server.to(callerSocketId).emit('call:rejected');
        }

        return { success: true };
    }

    // ============================================
    // END CALL
    // ============================================
    @SubscribeMessage('call:end')
    handleCallEnd(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { call_id: string; target_user_id: string },
    ) {
        const targetSocketId = this.userSockets.get(data.target_user_id);
        if (targetSocketId) {
            this.server.to(targetSocketId).emit('call:ended');
        }

        return { success: true };
    }

    // ============================================
    // ICE CANDIDATE
    // ============================================
    @SubscribeMessage('call:ice-candidate')
    handleIceCandidate(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { target_user_id: string; candidate: any },
    ) {
        const targetSocketId = this.userSockets.get(data.target_user_id);
        if (targetSocketId) {
            this.server.to(targetSocketId).emit('call:ice-candidate', {
                candidate: data.candidate,
            });
        }

        return { success: true };
    }
}
