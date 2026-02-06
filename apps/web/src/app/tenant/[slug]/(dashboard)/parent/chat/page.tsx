'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SubPageWrapper } from '@/components/parent/SubPageHeader';
import {
    ChatLane,
    ThreadRowCard,
    AnnouncementCompactCard,
    TicketRowCard,
    FilterChips,
    UrgentBanner,
    EmptyState,
} from '@/components/parent/ChatComponents';
import {
    MOCK_CHAT_THREADS,
    MOCK_CHAT_ANNOUNCEMENTS,
    MOCK_SUPPORT_TICKETS,
} from '@/lib/parent';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: 3 },
    { id: 'urgent', label: 'Urgent', count: 1 },
    { id: 'staff', label: 'Staff' },
    { id: 'support', label: 'Support' },
];

export default function ChatPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const [activeFilter, setActiveFilter] = useState('all');

    // Filter threads based on active filter
    const filteredThreads = MOCK_CHAT_THREADS.filter((thread) => {
        switch (activeFilter) {
            case 'unread':
                return thread.unreadCount > 0;
            case 'urgent':
                return thread.urgent;
            case 'staff':
                return thread.type === 'dm';
            case 'support':
                return thread.type === 'support';
            default:
                return true;
        }
    });

    // Check for urgent items
    const hasUrgentAnnouncement = MOCK_CHAT_ANNOUNCEMENTS.some(
        (a) => a.badges.includes('urgent') && a.requiresAck && !a.acknowledged
    );

    // Calculate totals
    const totalUnread = MOCK_CHAT_THREADS.reduce((sum, t) => sum + t.unreadCount, 0);
    const openTickets = MOCK_SUPPORT_TICKETS.filter((t) => t.status !== 'closed').length;

    return (
        <SubPageWrapper>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Chat</h1>
                <div className="flex items-center gap-1">
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                        aria-label="New message"
                    >
                        <span className="material-symbols-outlined text-[22px] text-muted-foreground">edit_square</span>
                    </button>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined text-[22px] text-muted-foreground">search</span>
                    </button>
                </div>
            </div>

            {/* Filter Chips */}
            <FilterChips
                filters={FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* Urgent Banner (conditional) */}
            {hasUrgentAnnouncement && (
                <div className="mt-4">
                    <UrgentBanner
                        icon="campaign"
                        title="Urgent: Acknowledgement required"
                        href={`/tenant/${tenantSlug}/parent/announcements`}
                    />
                </div>
            )}

            {/* Main Content - Lanes */}
            <div className="mt-4 space-y-2">
                {/* Lane 1: Announcements */}
                <ChatLane
                    title="Announcements"
                    badge={MOCK_CHAT_ANNOUNCEMENTS.filter((a) => !a.acknowledged && a.requiresAck).length || undefined}
                    viewAllHref={`/tenant/${tenantSlug}/parent/announcements`}
                >
                    {MOCK_CHAT_ANNOUNCEMENTS.slice(0, 2).map((announcement) => (
                        <AnnouncementCompactCard
                            key={announcement.id}
                            title={announcement.title}
                            preview={announcement.preview}
                            time={announcement.time}
                            badges={announcement.badges}
                            requiresAck={announcement.requiresAck}
                            acknowledged={announcement.acknowledged}
                            onAcknowledge={() => console.log('Acknowledge:', announcement.id)}
                            href={`/tenant/${tenantSlug}/parent/announcements/${announcement.id}`}
                        />
                    ))}
                </ChatLane>

                {/* Lane 2: Messages (DMs) */}
                <ChatLane
                    title="Messages"
                    badge={totalUnread > 0 ? totalUnread : undefined}
                    viewAllHref={`/tenant/${tenantSlug}/parent/chat/messages`}
                >
                    {filteredThreads.length > 0 ? (
                        filteredThreads.slice(0, 4).map((thread) => (
                            <ThreadRowCard
                                key={thread.id}
                                avatar={thread.avatar || thread.name.charAt(0)}
                                name={thread.name}
                                context={thread.context}
                                lastMessage={thread.lastMessage}
                                time={thread.lastMessageTime}
                                unread={thread.unreadCount}
                                urgent={thread.urgent}
                                online={thread.id === 'thread-1'}
                                href={`/tenant/${tenantSlug}/parent/chat/${thread.id}`}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="chat"
                            title="No messages found"
                            description={activeFilter !== 'all' ? 'Try changing your filter' : undefined}
                        />
                    )}
                </ChatLane>

                {/* Lane 3: Support Tickets */}
                <ChatLane
                    title="Support"
                    badge={openTickets > 0 ? `${openTickets} Open` : undefined}
                    rightAction={
                        <Link
                            href={`/tenant/${tenantSlug}/parent/chat/support/new`}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            New
                        </Link>
                    }
                >
                    {MOCK_SUPPORT_TICKETS.length > 0 ? (
                        MOCK_SUPPORT_TICKETS.slice(0, 3).map((ticket) => (
                            <TicketRowCard
                                key={ticket.id}
                                category={ticket.category || 'general'}
                                title={ticket.name}
                                status={ticket.status || 'open'}
                                statusText={ticket.lastMessage}
                                time={ticket.lastMessageTime}
                                href={`/tenant/${tenantSlug}/parent/chat/${ticket.id}`}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="support_agent"
                            title="No support tickets"
                            description="Need help with fees, transport, or admissions?"
                            action={{
                                label: 'Create a ticket',
                                href: `/tenant/${tenantSlug}/parent/chat/support/new`,
                            }}
                        />
                    )}
                </ChatLane>
            </div>
        </SubPageWrapper>
    );
}
