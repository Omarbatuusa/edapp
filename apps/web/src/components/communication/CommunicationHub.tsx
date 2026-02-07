'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================================
// TYPES & MOCK DATA
// ============================================================

type FeedItemType = 'urgent' | 'action' | 'announcement' | 'message' | 'support';
type AnnouncementCategory = 'ACADEMIC' | 'EVENT' | 'EMERGENCY' | 'FEES';
type SupportStatus = 'OPEN' | 'PENDING' | 'RESOLVED';

interface FeedItem {
    id: string;
    type: FeedItemType;
    timestamp: string; // ISO string or relative time for mock
    isUnread?: boolean;
    // Common fields
    title?: string;
    subtitle?: string;
    // Announcement specific
    category?: AnnouncementCategory;
    image?: string;
    source?: string;
    hasDownload?: boolean;
    // Message specific
    senderAvatar?: string;
    messagePreview?: string;
    // Support specific
    ticketId?: string;
    status?: SupportStatus;
}

const MOCK_FEED: FeedItem[] = [
    {
        id: 'act-1',
        type: 'action',
        title: 'Permission Slip: Zoo Trip',
        subtitle: 'Please sign by tomorrow',
        timestamp: '1 hour ago',
        isUnread: true,
    },
    {
        id: 'ann-1',
        type: 'urgent',
        category: 'EMERGENCY',
        title: 'School Closed on Monday',
        subtitle: 'Due to severe weather conditions',
        source: "Principal's Office",
        timestamp: '2 hours ago',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
    },
    {
        id: 'msg-1',
        type: 'message',
        title: 'Mrs. Anderson',
        subtitle: 'Regarding John\'s math progress...',
        messagePreview: 'Hi! I wanted to share some great news about John\'s recent test scores. He showed remarkable improvement in...',
        timestamp: '10 min ago',
        isUnread: true,
        senderAvatar: 'https://i.pravatar.cc/150?u=mrs_anderson',
    },
    {
        id: 'ann-2',
        type: 'announcement',
        category: 'EVENT',
        title: 'Annual Sports Day',
        subtitle: 'Registration is now open for all grades',
        source: 'Coach Sithole',
        timestamp: 'Yesterday',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    },
    {
        id: 'sup-1',
        type: 'support',
        ticketId: '#4209',
        title: 'Bus Route Change Request',
        status: 'PENDING',
        timestamp: '2 days ago',
    },
    {
        id: 'ann-3',
        type: 'announcement',
        category: 'ACADEMIC',
        title: 'Term 2 Report Cards',
        subtitle: 'Available for download',
        source: 'Admin',
        timestamp: '3 days ago',
        hasDownload: true,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
    },
];

// ============================================================
// COMMUNICATION HUB COMPONENT
// ============================================================

interface CommunicationHubProps {
    officeHours?: string;
}

export function CommunicationHub({ officeHours }: CommunicationHubProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'announcements' | 'messages' | 'support'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Logic
    const filteredFeed = useMemo(() => {
        let items = MOCK_FEED;

        if (filter === 'unread') items = items.filter(i => i.isUnread);
        if (filter === 'urgent') items = items.filter(i => i.type === 'urgent');
        if (filter === 'announcements') items = items.filter(i => i.type === 'announcement' || i.type === 'urgent');
        if (filter === 'messages') items = items.filter(i => i.type === 'message');
        if (filter === 'support') items = items.filter(i => i.type === 'support');

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(i =>
                i.title?.toLowerCase().includes(q) ||
                i.subtitle?.toLowerCase().includes(q) ||
                i.source?.toLowerCase().includes(q)
            );
        }

        return items;
    }, [filter, searchQuery]);

    const activeActions = MOCK_FEED.filter(i => i.type === 'action');

    return (
        <div className="flex flex-col h-[100dvh] bg-background md:max-w-4xl md:mx-auto md:border-x md:border-border/50 md:shadow-sm">
            {/* 1. Header (Sticky) */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center px-4 h-14 gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-foreground">chevron_left</span>
                    </button>
                    <h1 className="text-lg font-bold flex-1 text-center pr-8">Inbox</h1>

                    {/* Multi-child selector placeholder */}
                    <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">group</span>
                    </button>
                </div>
            </header>

            {/* 2. Controls Row (Sticky) */}
            <div className="sticky top-14 z-40 bg-background py-2 px-4 shadow-sm space-y-3">
                {/* Search & Sort */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                        <span className="material-symbols-outlined text-muted-foreground">sort</span>
                    </button>
                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 mask-fade-right">
                    <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                    <FilterChip label="Unread" active={filter === 'unread'} onClick={() => setFilter('unread')} />
                    <FilterChip label="Urgent" active={filter === 'urgent'} onClick={() => setFilter('urgent')} />
                    <FilterChip label="Announcements" active={filter === 'announcements'} onClick={() => setFilter('announcements')} />
                    <FilterChip label="Messages" active={filter === 'messages'} onClick={() => setFilter('messages')} />
                    <FilterChip label="Support" active={filter === 'support'} onClick={() => setFilter('support')} />
                </div>
            </div>

            {/* 3. Feed Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Action Required Module (Pinned) */}
                {activeActions.length > 0 && filter === 'all' && (
                    <div className="space-y-2 mb-6">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Action Required</h3>
                        {activeActions.map(item => (
                            <ActionRequiredCard key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {/* Main Feed */}
                <div className="space-y-3 pb-24">
                    {filteredFeed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                            <p className="text-sm">No items found</p>
                        </div>
                    ) : (
                        filteredFeed.filter(i => i.type !== 'action').map(item => (
                            <FeedItemRow key={item.id} item={item} />
                        ))
                    )}

                    <div className="flex flex-col items-center justify-center py-8 opacity-60">
                        <span className="material-symbols-outlined text-4xl text-muted-foreground/30 mb-2">check_circle</span>
                        <p className="text-muted-foreground/60 text-sm">You're all caught up!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all
                ${active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }
            `}
        >
            {label}
        </button>
    );
}


function ActionRequiredCard({ item }: { item: FeedItem }) {
    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                <span className="material-symbols-outlined">priority_high</span>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm leading-tight">{item.title}</h4>
                <p className="text-amber-700 dark:text-amber-400/80 text-xs mt-0.5">{item.subtitle}</p>
                <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                        Review & Sign
                    </button>
                    <button className="px-3 text-amber-700 dark:text-amber-300 text-xs font-medium hover:underline">
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}

function FeedItemRow({ item }: { item: FeedItem }) {
    if (item.type === 'urgent') {
        return <UrgentCard item={item} />;
    }
    if (item.type === 'message') {
        return <MessageRow item={item} />;
    }
    if (item.type === 'support') {
        return <SupportRow item={item} />;
    }
    return <StandardAnnouncementRow item={item} />;
}


function UrgentCard({ item }: { item: FeedItem }) {
    return (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-red-500">warning</span>
            </div>

            <div className="flex flex-col gap-1 z-10">
                <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">URGENT</span>
                    <span className="text-xs text-red-600 dark:text-red-300 font-medium">{item.timestamp}</span>
                </div>
                <h3 className="font-bold text-red-900 dark:text-red-100 text-lg leading-tight mt-1">{item.title}</h3>
                <p className="text-red-800 dark:text-red-200/80 text-sm">{item.subtitle}</p>
                <div className="flex items-center gap-2 mt-3 text-red-700 dark:text-red-300 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">school</span>
                    <span>{item.source}</span>
                </div>
            </div>
        </div>
    );
}

function StandardAnnouncementRow({ item }: { item: FeedItem }) {
    return (
        <div className="bg-card dark:bg-slate-900 border border-border rounded-2xl p-3 flex gap-3 hover:shadow-md transition-shadow cursor-pointer">
            {/* Image/Icon */}
            <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden shrink-0 relative">
                {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                        <span className="material-symbols-outlined">campaign</span>
                    </div>
                )}
                {/* Category Badge Over Image */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 pt-4">
                    <p className="text-[9px] font-bold text-white text-center uppercase tracking-wider">{item.category}</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">{item.title}</h3>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.subtitle}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[10px]">person</span>
                        </div>
                        <span className="truncate max-w-[80px]">{item.source}</span>
                    </div>

                    {item.hasDownload ? (
                        <button className="flex items-center gap-1 text-primary text-[10px] font-bold bg-primary/10 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            PDF
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button className="text-muted-foreground hover:text-primary"><span className="material-symbols-outlined text-[16px]">thumb_up</span></button>
                            <button className="text-muted-foreground hover:text-primary"><span className="material-symbols-outlined text-[16px]">bookmark</span></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MessageRow({ item }: { item: FeedItem }) {
    return (
        <div className={`
            p-3 rounded-2xl flex gap-3 cursor-pointer transition-colors
            ${item.isUnread ? 'bg-primary/5 border border-primary/20' : 'bg-card border border-border hover:bg-secondary/30'}
        `}>
            <div className="relative w-10 h-10 shrink-0">
                <img src={item.senderAvatar || `https://ui-avatars.com/api/?name=${item.title}`} alt="" className="w-full h-full rounded-full object-cover" />
                {item.isUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <h4 className={`text-sm truncate ${item.isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                        {item.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                </div>
                <p className={`text-xs truncate ${item.isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.messagePreview}
                </p>
            </div>
        </div>
    );
}

function SupportRow({ item }: { item: FeedItem }) {
    const statusColor = {
        'OPEN': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'PENDING': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'RESOLVED': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    }[item.status || 'OPEN'];

    return (
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30 shrink-0">
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusColor}`}>{item.status}</span>
                    <span className="text-[10px] text-muted-foreground">{item.ticketId}</span>
                </div>
                <h4 className="text-sm font-medium text-foreground truncate">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Last updated {item.timestamp}</p>
            </div>
            <span className="material-symbols-outlined text-muted-foreground/50 text-xl">chevron_right</span>
        </div>
    );
}

export default CommunicationHub;
