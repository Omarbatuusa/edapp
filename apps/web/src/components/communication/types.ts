export interface FeedItem {
    id: string;
    type: 'message' | 'announcement' | 'urgent' | 'assignment' | 'support' | 'action'; // Added 'action'
    title: string;
    subtitle: string;
    time: string;
    unread: boolean;
    isUnread?: boolean; // Compatibility
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'; // Added priority
    childName?: string; // Added childName
    childGrade?: string; // Added childGrade
    source?: string;
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
    timestamp?: string; // For compatibility with different usage
}

export interface DetailViewProps {
    item: FeedItem | null;
    isTranslated?: boolean;
}
