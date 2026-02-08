export interface FeedItemSource {
    name: string;
    role?: string;
    department?: string;
    avatar?: string;
}

export interface FeedItem {
    id: string;
    type: 'message' | 'announcement' | 'urgent' | 'assignment' | 'support' | 'action';
    title: string;
    subtitle: string;
    time: string;
    unread: boolean;
    isUnread?: boolean;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    childName?: string;
    childGrade?: string;
    source?: FeedItemSource | string;
    messagePreview?: string;
    avatar?: string;
    senderAvatar?: string;
    isTyping?: boolean;
    childId?: string;
    status?: string;
    ticketId?: string;
    slaDue?: string;
    image?: string;
    category?: string;
    hasDownload?: boolean;
    role?: string;
    timestamp?: string;
    threadId?: string;
}

export interface DetailViewProps {
    item: FeedItem | null;
    isTranslated?: boolean;
}
