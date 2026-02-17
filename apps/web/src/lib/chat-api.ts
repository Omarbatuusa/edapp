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
    ticket_category?: 'fees' | 'admissions' | 'transport' | 'it' | 'health' | 'academics' | 'general';
    ticket_status?: 'open' | 'pending' | 'resolved' | 'closed';
    requires_ack?: boolean;
    has_acknowledged?: boolean;
    context?: {
        grade_id?: string;
        class_id?: string;
        student_id?: string;
    };
}

export interface MessageDto {
    id: string;
    thread_id: string;
    sender_id: string;
    sender_name?: string;
    sender_avatar?: string;
    type: 'text' | 'image' | 'document' | 'voice' | 'system' | 'action_card';
    content: string;
    attachments?: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        size_bytes?: number;
    }[];
    action_data?: {
        type: 'approval' | 'acknowledgement';
        title: string;
        subtitle: string;
        status: 'pending' | 'approved' | 'rejected' | 'acknowledged';
        metadata?: any;
    };
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
    ticket_category?: 'fees' | 'admissions' | 'transport' | 'it' | 'health' | 'academics' | 'general';
    context?: {
        grade_id?: string;
        class_id?: string;
        student_id?: string;
    };
    requires_ack?: boolean;
    ack_deadline?: string;
}

export interface SendMessageRequest {
    thread_id: string;
    content: string;
    attachments?: any[];
    action_data?: {
        type: 'approval' | 'acknowledgement';
        title: string;
        subtitle: string;
        status: 'pending' | 'approved' | 'rejected' | 'acknowledged';
        metadata?: any;
    };
    reply_to_id?: string;
}

// API Functions
export const chatApi = {
    // ============================================
    // THREADS
    // ============================================

    async getThreads(params?: {
        type?: string;
        ticket_category?: string;
        student_id?: string;
        unread_only?: boolean;
        search?: string;
    }): Promise<ThreadDto[]> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.ticket_category) queryParams.append('ticket_category', params.ticket_category);
        if (params?.student_id) queryParams.append('student_id', params.student_id);
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
        // Map frontend member_ids to backend members format
        const payload = {
            ...data,
            members: (data.member_ids || []).map(id => ({ user_id: id })),
        };
        const response = await apiClient.post('/threads', payload);
        return response.data;
    },

    async findThreadByContext(data: {
        student_id?: string;
        ticket_category?: string;
        type?: string;
    }): Promise<{ thread: ThreadDto | null }> {
        const response = await apiClient.post('/threads/find-context', data);
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

    async updateActionStatus(messageId: string, status: 'approved' | 'rejected' | 'acknowledged'): Promise<MessageDto> {
        const response = await apiClient.put(`/messages/${messageId}/action`, { status });
        return response.data;
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

    // ============================================
    // FEED (Unified, cursor-paginated)
    // ============================================

    async getFeed(params?: {
        type?: string;
        student_id?: string;
        cursor?: string;
        limit?: number;
    }): Promise<{ threads: ThreadDto[]; next_cursor: string | null }> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.student_id) queryParams.append('student_id', params.student_id);
        if (params?.cursor) queryParams.append('cursor', params.cursor);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/threads/feed?${queryParams.toString()}`);
        return response.data;
    },

    // ============================================
    // ACTION REQUIRED (Aggregation)
    // ============================================

    async getActionRequired(): Promise<{
        unacked_announcements: ThreadDto[];
        pending_ticket_actions: any[];
    }> {
        const response = await apiClient.get('/threads/action-required');
        return response.data;
    },

    // ============================================
    // SEARCH
    // ============================================

    async searchAll(query: string): Promise<ThreadDto[]> {
        const response = await apiClient.get(`/threads/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    // ============================================
    // ANNOUNCEMENTS
    // ============================================

    async markAnnouncementRead(threadId: string): Promise<void> {
        await apiClient.post(`/announcements/${threadId}/read`);
    },

    async addAnnouncementReaction(threadId: string, emoji: string): Promise<void> {
        await apiClient.post(`/announcements/${threadId}/react/${encodeURIComponent(emoji)}`);
    },

    async removeAnnouncementReaction(threadId: string, emoji: string): Promise<void> {
        await apiClient.delete(`/announcements/${threadId}/react/${encodeURIComponent(emoji)}`);
    },

    async getAnnouncementStats(threadId: string): Promise<{
        total_members: number;
        read_count: number;
        ack_count: number;
        reactions: { emoji: string; count: number }[];
    }> {
        const response = await apiClient.get(`/announcements/${threadId}/stats`);
        return response.data;
    },

    // ============================================
    // TICKET ACTIONS
    // ============================================

    async getTicketActions(threadId: string): Promise<any[]> {
        const response = await apiClient.get(`/ticket-actions/thread/${threadId}`);
        return response.data;
    },

    async completeTicketAction(actionId: string): Promise<any> {
        const response = await apiClient.patch(`/ticket-actions/${actionId}/complete`);
        return response.data;
    },

    async getPendingActions(): Promise<any[]> {
        const response = await apiClient.get('/ticket-actions/pending');
        return response.data;
    },

    // ============================================
    // MESSAGE REPORTS
    // ============================================

    async reportMessage(messageId: string, reason: string, details?: string): Promise<any> {
        const response = await apiClient.post('/message-reports', { message_id: messageId, reason, details });
        return response.data;
    },

    // ============================================
    // PARENT-CHILD
    // ============================================

    async getMyChildren(): Promise<any[]> {
        const response = await apiClient.get('/parent-children/my-children');
        return response.data;
    },

    // ============================================
    // TICKET ASSIGNMENT
    // ============================================

    async assignTicket(threadId: string, staffUserId: string): Promise<any> {
        const response = await apiClient.post(`/threads/${threadId}/assign`, { staff_user_id: staffUserId });
        return response.data;
    },

    // ============================================
    // DM (Find or create)
    // ============================================

    async findOrCreateDM(user2Id: string): Promise<ThreadDto> {
        const response = await apiClient.post('/threads/dm', { user2_id: user2Id });
        return response.data;
    },

    // ============================================
    // MARK THREAD READ
    // ============================================

    async markThreadRead(threadId: string, messageId?: string): Promise<void> {
        await apiClient.post(`/threads/${threadId}/read`, { message_id: messageId });
    },

    async markAllMessagesRead(threadId: string): Promise<void> {
        await apiClient.post(`/messages/thread/${threadId}/read-all`);
    },

    async getMessageUnreadCount(): Promise<number> {
        const response = await apiClient.get('/messages/unread-count');
        return response.data.unread_count;
    },

    // ============================================
    // STORAGE (GCS Attachments)
    // ============================================

    async getUploadUrl(category: string, filename: string, contentType?: string): Promise<{ uploadUrl: string; objectKey: string }> {
        const response = await apiClient.post('/storage/upload-url', { category, filename, contentType });
        return response.data;
    },

    async getReadUrl(key: string): Promise<{ readUrl: string }> {
        const response = await apiClient.get(`/storage/read-url?key=${encodeURIComponent(key)}`);
        return response.data;
    },

    // Upload file to GCS via signed URL, then return the object key
    async uploadAttachment(file: File): Promise<{ objectKey: string; url: string }> {
        const { uploadUrl, objectKey } = await chatApi.getUploadUrl('attachments', file.name, file.type);
        await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
        });
        const { readUrl } = await chatApi.getReadUrl(objectKey);
        return { objectKey, url: readUrl };
    },
};

export default chatApi;
