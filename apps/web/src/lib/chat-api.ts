import { apiClient } from './api-client';

// ============================================================
// CHAT API - REST endpoints for threads and messages
// ============================================================

// Types
export interface ThreadDto {
    id: string;
    tenant_id: string;
    type: 'dm' | 'group' | 'announcement' | 'ticket' | 'safeguarding';
    title?: string;
    description?: string;
    participant_count: number;
    last_message_content?: string;
    last_message_at?: string;
    unread_count?: number;
    is_pinned?: boolean;
    is_muted?: boolean;
    ticket_status?: 'open' | 'pending' | 'resolved' | 'escalated';
    requires_ack?: boolean;
    has_acknowledged?: boolean;
    context?: {
        grade_id?: string;
        class_id?: string;
    };
}

export interface MessageDto {
    id: string;
    thread_id: string;
    sender_id: string;
    sender_name?: string;
    sender_avatar?: string;
    type: 'text' | 'image' | 'document' | 'voice' | 'system';
    content: string;
    attachments?: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        size_bytes?: number;
    }[];
    reply_to?: {
        id: string;
        sender_name: string;
        content_preview: string;
    };
    is_edited?: boolean;
    is_deleted?: boolean;
    reactions?: Record<string, string[]>;
    created_at: string;
}

export interface CreateThreadRequest {
    type: 'dm' | 'group' | 'announcement' | 'ticket' | 'safeguarding';
    title?: string;
    description?: string;
    member_ids: string[];
    ticket_category?: 'general' | 'academic' | 'medical' | 'behavioral' | 'safeguarding';
    requires_ack?: boolean;
    ack_deadline?: string;
}

export interface SendMessageRequest {
    thread_id: string;
    content: string;
    attachments?: any[];
    reply_to_id?: string;
}

// API Functions
export const chatApi = {
    // ============================================
    // THREADS
    // ============================================

    async getThreads(params?: {
        type?: string;
        unread_only?: boolean;
        search?: string;
    }): Promise<ThreadDto[]> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.unread_only) queryParams.append('unread_only', 'true');
        if (params?.search) queryParams.append('search', params.search);

        const response = await apiClient.get(`/threads?${queryParams.toString()}`);
        return response.data;
    },

    async getThread(threadId: string): Promise<ThreadDto> {
        const response = await apiClient.get(`/threads/${threadId}`);
        return response.data;
    },

    async createThread(data: CreateThreadRequest): Promise<ThreadDto> {
        const response = await apiClient.post('/threads', data);
        return response.data;
    },

    async getThreadMembers(threadId: string): Promise<any[]> {
        const response = await apiClient.get(`/threads/${threadId}/members`);
        return response.data;
    },

    async acknowledgeThread(threadId: string): Promise<void> {
        await apiClient.post(`/threads/${threadId}/acknowledge`);
    },

    async pinThread(threadId: string, pinned: boolean): Promise<void> {
        await apiClient.patch(`/threads/${threadId}/pin`, { is_pinned: pinned });
    },

    async muteThread(threadId: string, muted: boolean): Promise<void> {
        await apiClient.patch(`/threads/${threadId}/mute`, { is_muted: muted });
    },

    async archiveThread(threadId: string): Promise<void> {
        await apiClient.patch(`/threads/${threadId}/archive`);
    },

    // ============================================
    // MESSAGES
    // ============================================

    async getMessages(threadId: string, params?: {
        before?: string;
        after?: string;
        limit?: number;
    }): Promise<MessageDto[]> {
        const queryParams = new URLSearchParams();
        if (params?.before) queryParams.append('before', params.before);
        if (params?.after) queryParams.append('after', params.after);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/messages/thread/${threadId}?${queryParams.toString()}`);
        return response.data;
    },

    async sendMessage(data: SendMessageRequest): Promise<MessageDto> {
        const response = await apiClient.post('/messages', data);
        return response.data;
    },

    async editMessage(messageId: string, content: string): Promise<MessageDto> {
        const response = await apiClient.put(`/messages/${messageId}`, { content });
        return response.data;
    },

    async deleteMessage(messageId: string): Promise<void> {
        await apiClient.delete(`/messages/${messageId}`);
    },

    async addReaction(messageId: string, emoji: string): Promise<void> {
        await apiClient.post(`/messages/${messageId}/reactions`, { emoji });
    },

    async removeReaction(messageId: string, emoji: string): Promise<void> {
        await apiClient.delete(`/messages/${messageId}/reactions/${emoji}`);
    },

    // ============================================
    // DIRECTORY / CONTACTS
    // ============================================

    async searchContacts(query: string): Promise<any[]> {
        const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    async getContactsByRole(role: string): Promise<any[]> {
        const response = await apiClient.get(`/users/by-role/${role}`);
        return response.data;
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================

    async getNotifications(params?: {
        unread_only?: boolean;
        limit?: number;
    }): Promise<any[]> {
        const queryParams = new URLSearchParams();
        if (params?.unread_only) queryParams.append('unread_only', 'true');
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data.count;
    },

    async markNotificationRead(notificationId: string): Promise<void> {
        await apiClient.patch(`/notifications/${notificationId}/read`);
    },

    async markAllNotificationsRead(): Promise<void> {
        await apiClient.post('/notifications/read-all');
    },
};

export default chatApi;
