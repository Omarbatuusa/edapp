'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Search } from 'lucide-react';
import { ThreadRow, FilterChips, DEFAULT_CHAT_FILTERS } from '@/components/chat';
import { useChatStore, selectFilteredThreads, selectUnreadCount, selectPinnedThreads, Thread } from '@/lib/chat-store';

// ============================================================
// MOCK DATA - Will be replaced with API calls
// ============================================================

const MOCK_THREADS: Thread[] = [
    {
        id: 'thread-1',
        type: 'dm',
        name: 'Mrs. Smith',
        avatar: 'MS',
        subtitle: 'Class Teacher • Grade 5',
        lastMessage: 'Keep up the great work! I\'ll send the progress report by Friday.',
        lastMessageTime: '10:30 AM',
        unreadCount: 2,
        online: true,
    },
    {
        id: 'thread-2',
        type: 'dm',
        name: 'Mr. Johnson',
        avatar: 'MJ',
        subtitle: 'Math Teacher • Grade 5',
        lastMessage: 'The homework assignment is due next Monday.',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
    },
    {
        id: 'thread-3',
        type: 'group',
        name: 'Grade 5 • 2026',
        subtitle: 'St Marks • 24 members',
        lastMessage: 'Sports day registration closes Friday!',
        lastMessageTime: 'Yesterday',
        unreadCount: 5,
    },
    {
        id: 'thread-4',
        type: 'announcement',
        name: 'Early Closure Friday',
        subtitle: 'From Principal Office',
        lastMessage: 'School closes at 12:00 PM for Staff Development.',
        lastMessageTime: '2h ago',
        unreadCount: 1,
        requiresAck: true,
        acknowledged: false,
    },
    {
        id: 'thread-5',
        type: 'ticket',
        name: 'Fee Statement Query',
        subtitle: 'Finance Department',
        lastMessage: 'Thank you for your query. Let me check...',
        lastMessageTime: '3d ago',
        unreadCount: 0,
        ticketStatus: 'pending',
        ticketCategory: 'fees',
    },
    {
        id: 'thread-6',
        type: 'ticket',
        name: 'Bus Route Change Request',
        subtitle: 'Transport Office',
        lastMessage: 'Your request has been approved.',
        lastMessageTime: '1w ago',
        unreadCount: 0,
        ticketStatus: 'closed',
        ticketCategory: 'transport',
    },
];

const FAB_OPTIONS = [
    { id: 'message', label: 'New Message', icon: 'chat', href: '/chat/new' },
    { id: 'support', label: 'Support Ticket', icon: 'support_agent', href: '/chat/support' },
];

// ============================================================
// CHAT INBOX COMPONENT
// ============================================================

export default function ChatInboxPage() {
    const params = useParams();
    const router = useRouter();
    const tenantSlug = params.slug as string;
    const role = params.role as string || 'parent';

    // State
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Store
    const { threads, setThreads, activeFilter, setFilter } = useChatStore();

    // Initialize with mock data
    useEffect(() => {
        if (threads.length === 0) {
            setThreads(MOCK_THREADS);
        }
    }, [threads.length, setThreads]);

    // Filter threads
    const filteredThreads = useMemo(() => {
        let result = threads;

        // Apply filter
        switch (activeFilter) {
            case 'unread':
                result = result.filter(t => t.unreadCount > 0);
                break;
            case 'groups':
                result = result.filter(t => t.type === 'group');
                break;
            case 'staff':
                result = result.filter(t => t.type === 'dm');
                break;
            case 'grades':
                result = result.filter(t => t.type === 'group' && t.name.includes('Grade'));
                break;
            case 'support':
                result = result.filter(t => t.type === 'ticket');
                break;
            case 'announcements':
                result = result.filter(t => t.type === 'announcement');
                break;
        }

        // Apply search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.lastMessage.toLowerCase().includes(q)
            );
        }

        return result;
    }, [threads, activeFilter, searchQuery]);

    // Pinned threads (ACK required, urgent)
    const pinnedThreads = useMemo(() =>
        threads.filter(t =>
            t.pinned ||
            (t.type === 'announcement' && t.requiresAck && !t.acknowledged)
        ),
        [threads]
    );

    // Unread count for chips
    const unreadCount = useMemo(() =>
        threads.reduce((sum, t) => sum + t.unreadCount, 0),
        [threads]
    );

    // Filter chips with counts
    const filtersWithCounts = useMemo(() =>
        DEFAULT_CHAT_FILTERS.map(f => ({
            ...f,
            count: f.id === 'unread' ? unreadCount : undefined
        })),
        [unreadCount]
    );

    const basePath = `/tenant/${tenantSlug}/${role}`;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-2xl font-bold">Messages</h1>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                        aria-label="Search"
                    >
                        <Search size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="mb-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-xl">
                            <Search size={18} className="text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search messages..."
                                className="flex-1 bg-transparent text-sm focus:outline-none"
                                autoFocus
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')}>
                                    <X size={16} className="text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Filter Chips */}
                <FilterChips
                    filters={filtersWithCounts}
                    activeFilter={activeFilter}
                    onFilterChange={setFilter}
                />
            </div>

            {/* Pinned Lane */}
            {pinnedThreads.length > 0 && activeFilter === 'all' && (
                <div className="px-4 py-2">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-amber-600 text-lg">priority_high</span>
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                Requires Attention
                            </span>
                        </div>
                        {pinnedThreads.slice(0, 2).map((thread) => (
                            <Link
                                key={thread.id}
                                href={`${basePath}/chat/thread/${thread.id}`}
                                className="flex items-center gap-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 -mx-2 px-2 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-amber-600">
                                    {thread.type === 'announcement' ? 'campaign' : 'warning'}
                                </span>
                                <span className="text-sm font-medium text-amber-800 dark:text-amber-200 truncate">
                                    {thread.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto px-2">
                {filteredThreads.length > 0 ? (
                    <div className="space-y-1 py-2">
                        {filteredThreads.map((thread) => (
                            <ThreadRow
                                key={thread.id}
                                id={thread.id}
                                type={thread.type}
                                avatar={thread.avatar}
                                name={thread.name}
                                subtitle={thread.subtitle}
                                lastMessage={thread.lastMessage}
                                time={thread.lastMessageTime}
                                unread={thread.unreadCount}
                                muted={thread.muted}
                                online={thread.online}
                                pinned={thread.pinned}
                                requiresAck={thread.requiresAck}
                                acknowledged={thread.acknowledged}
                                ticketStatus={thread.ticketStatus}
                                ticketCategory={thread.ticketCategory}
                                href={`${basePath}/chat/thread/${thread.id}`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                        <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-3">
                            {activeFilter === 'all' ? 'chat_bubble_outline' : 'filter_list_off'}
                        </span>
                        <p className="text-muted-foreground font-medium">
                            {searchQuery ? 'No results found' : 'No messages'}
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                            {searchQuery
                                ? 'Try a different search term'
                                : activeFilter !== 'all'
                                    ? 'Try changing your filter'
                                    : 'Start a new conversation'
                            }
                        </p>
                    </div>
                )}
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
                            href={`${basePath}${option.href}`}
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
        </div>
    );
}
