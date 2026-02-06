'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
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

const FAB_OPTIONS = [
    { id: 'educator', label: 'Chat with Educator', icon: 'school', href: '/chat/new' },
    { id: 'support', label: 'Support Ticket', icon: 'support_agent', href: '/chat/support/new' },
];

export default function ChatPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const [activeFilter, setActiveFilter] = useState('all');
    const [showFabMenu, setShowFabMenu] = useState(false);

    // Filter threads
    const filteredThreads = MOCK_CHAT_THREADS.filter((thread) => {
        switch (activeFilter) {
            case 'unread': return thread.unreadCount > 0;
            case 'urgent': return thread.urgent;
            case 'staff': return thread.type === 'dm';
            case 'support': return thread.type === 'support';
            default: return true;
        }
    });

    const hasUrgentAnnouncement = MOCK_CHAT_ANNOUNCEMENTS.some(
        (a) => a.badges.includes('urgent') && a.requiresAck && !a.acknowledged
    );

    const totalUnread = MOCK_CHAT_THREADS.reduce((sum, t) => sum + t.unreadCount, 0);
    const openTickets = MOCK_SUPPORT_TICKETS.filter((t) => t.status !== 'closed').length;

    return (
        <SubPageWrapper>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Chat</h1>
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    aria-label="Search"
                >
                    <span className="material-symbols-outlined text-[22px] text-muted-foreground">search</span>
                </button>
            </div>

            {/* Filter Chips */}
            <FilterChips
                filters={FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* Urgent Banner */}
            {hasUrgentAnnouncement && (
                <div className="mt-4">
                    <UrgentBanner
                        icon="campaign"
                        title="Urgent: Acknowledgement required"
                        href={`/tenant/${tenantSlug}/parent/announcements`}
                    />
                </div>
            )}

            {/* Lanes */}
            <div className="mt-4 space-y-2">
                {/* Announcements Lane */}
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

                {/* Messages Lane */}
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

                {/* Support Lane */}
                <ChatLane
                    title="Support"
                    badge={openTickets > 0 ? `${openTickets} Open` : undefined}
                    viewAllHref={`/tenant/${tenantSlug}/parent/chat/support`}
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

            {/* FAB Menu Overlay */}
            {showFabMenu && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                    onClick={() => setShowFabMenu(false)}
                />
            )}

            {/* FAB Menu Options */}
            {showFabMenu && (
                <div className="fixed bottom-32 right-4 sm:right-8 z-50 flex flex-col items-end gap-2 animate-in slide-in-from-bottom-4 fade-in duration-200">
                    {FAB_OPTIONS.map((option) => (
                        <Link
                            key={option.id}
                            href={`/tenant/${tenantSlug}/parent${option.href}`}
                            className="flex items-center gap-3 pl-4 pr-5 py-3 bg-card rounded-full shadow-lg border border-border hover:bg-secondary transition-colors"
                            onClick={() => setShowFabMenu(false)}
                        >
                            <span className="material-symbols-outlined text-primary">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                        </Link>
                    ))}
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setShowFabMenu(!showFabMenu)}
                className={`fixed bottom-20 right-4 sm:right-8 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${showFabMenu
                        ? 'bg-card border border-border rotate-45'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                style={showFabMenu ? {} : { color: '#fff' }}
                aria-label={showFabMenu ? 'Close menu' : 'New chat'}
            >
                {showFabMenu ? (
                    <X size={24} className="text-foreground" />
                ) : (
                    <Plus size={24} />
                )}
            </button>
        </SubPageWrapper>
    );
}
