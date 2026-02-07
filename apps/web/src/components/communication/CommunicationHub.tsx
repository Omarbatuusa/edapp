'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// TYPES & MOCK DATA
// ============================================================

type FeedItemType = 'urgent' | 'action' | 'announcement' | 'message' | 'support';
type AnnouncementCategory = 'ACADEMIC' | 'EVENT' | 'EMERGENCY' | 'FEES';
type SupportStatus = 'OPEN' | 'PENDING' | 'RESOLVED';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface FeedItem {
    id: string;
    type: FeedItemType;
    timestamp: string;
    date: Date; // For sorting
    isUnread?: boolean;
    priority?: Priority;
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
    role?: string;
    // Support specific
    ticketId?: string;
    status?: SupportStatus;
    slaDue?: string;
    // Child context
    childName?: string;
    childGrade?: string;
}

const MOCK_FEED: FeedItem[] = [
    {
        id: 'act-1',
        type: 'action',
        title: 'Permission Slip: Zoo Trip',
        subtitle: 'Please sign by tomorrow',
        timestamp: '1 hour ago',
        date: new Date(Date.now() - 3600000),
        isUnread: true,
        priority: 'HIGH',
        childName: 'Lisa Simpson',
        childGrade: 'Grade 6',
    },
    {
        id: 'ann-1',
        type: 'urgent',
        category: 'EMERGENCY',
        title: 'School Closed on Monday',
        subtitle: 'Due to severe weather conditions',
        source: "Principal's Office",
        timestamp: '2 hours ago',
        date: new Date(Date.now() - 7200000),
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
        priority: 'HIGH',
    },
    {
        id: 'msg-1',
        type: 'message',
        title: 'Mrs. Anderson',
        subtitle: 'Regarding John\'s math progress...',
        messagePreview: 'Hi! I wanted to share some great news about John\'s recent test scores. He showed remarkable improvement in...',
        timestamp: '10 min ago',
        date: new Date(Date.now() - 600000),
        isUnread: true,
        senderAvatar: 'https://i.pravatar.cc/150?u=mrs_anderson',
        role: 'Teacher',
        childName: 'Bart Simpson',
        childGrade: 'Grade 4',
    },
    {
        id: 'ann-2',
        type: 'announcement',
        category: 'EVENT',
        title: 'Annual Sports Day',
        subtitle: 'Registration is now open for all grades',
        source: 'Coach Sithole',
        timestamp: 'Yesterday',
        date: new Date(Date.now() - 86400000),
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    },
    {
        id: 'sup-1',
        type: 'support',
        ticketId: '#4209',
        title: 'Bus Route Change Request',
        status: 'PENDING',
        timestamp: '2 days ago',
        date: new Date(Date.now() - 172800000),
        slaDue: 'Due in 2 days',
    },
    {
        id: 'ann-3',
        type: 'announcement',
        category: 'ACADEMIC',
        title: 'Term 2 Report Cards',
        subtitle: 'Available for download',
        source: 'Admin',
        timestamp: '3 days ago',
        date: new Date(Date.now() - 259200000),
        hasDownload: true,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
        childName: 'Lisa Simpson',
        childGrade: 'Grade 6',
    },
];

const MOCK_CHILDREN = [
    { id: 'all', name: 'All Children' },
    { id: 'lisa', name: 'Lisa Simpson', grade: 'Grade 6', avatar: 'https://ui-avatars.com/api/?name=Lisa+Simpson&background=random' },
    { id: 'bart', name: 'Bart Simpson', grade: 'Grade 4', avatar: 'https://ui-avatars.com/api/?name=Bart+Simpson&background=random' },
];

const TRANSLATIONS: Record<string, string> = {
    'Permission Slip: Zoo Trip': 'Sardon: Leeto la Zoo',
    'School Closed on Monday': 'Sekolo se Koetswe ka Mantaha',
    'Term 2 Report Cards': 'Dikarata tsa Tlaleho tsa Kotara ya 2',
    'Annual Sports Day': 'Letsatsi la Dipapadi',
    'Bus Route Change Request': 'Kopo ya Phetoho ya Tsela ya Bese',
    'Mrs. Anderson': 'Mofumahadi Anderson',
};

// ============================================================
// COMMUNICATION HUB COMPONENT (CONTROLLER)
// ============================================================

interface CommunicationHubProps {
    officeHours?: string;
}

export function CommunicationHub({ officeHours = "Mon-Fri, 8 AM - 3 PM" }: CommunicationHubProps) {
    // Internal Navigation State
    const [activeView, setActiveView] = useState<'feed' | 'thread' | 'ticket' | 'announcement' | 'new-chat'>('feed');
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);

    // Global Hub State (Lifted)
    const [selectedChildId, setSelectedChildId] = useState<string>('all');
    const [isTranslated, setIsTranslated] = useState(false);

    // Navigation Handlers
    const handleOpenItem = (item: FeedItem) => {
        setSelectedItem(item);
        if (item.type === 'message') setActiveView('thread');
        else if (item.type === 'support') setActiveView('ticket');
        else if (item.type === 'announcement' || item.type === 'urgent') setActiveView('announcement');
    };

    const handleBack = () => {
        setActiveView('feed');
        setTimeout(() => setSelectedItem(null), 300);
    };

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-background md:max-w-4xl md:mx-auto md:border-x md:border-border/50 md:shadow-sm text-foreground">
            <AnimatePresence mode="popLayout">
                {activeView === 'feed' ? (
                    <FeedView
                        key="feed"
                        onItemClick={handleOpenItem}
                        officeHours={officeHours}
                        selectedChildId={selectedChildId}
                        setSelectedChildId={setSelectedChildId}
                        isTranslated={isTranslated}
                        setIsTranslated={setIsTranslated}
                        onNewChat={() => setActiveView('new-chat')}
                    />
                ) : (
                    <DetailViewWrapper
                        key="detail"
                        onBack={handleBack}
                        title={activeView === 'new-chat' ? 'New Message' : undefined}
                    >
                        {activeView === 'thread' && <MessageThreadView item={selectedItem} isTranslated={isTranslated} />}
                        {activeView === 'ticket' && <TicketDetailView item={selectedItem} isTranslated={isTranslated} />}
                        {activeView === 'announcement' && <AnnouncementDetailView item={selectedItem} isTranslated={isTranslated} />}
                        {activeView === 'new-chat' && <NewChatView onStart={() => setActiveView('feed')} />}
                    </DetailViewWrapper>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================
// VIEW COMPONENTS
// ============================================================

interface FeedViewProps {
    onItemClick: (item: FeedItem) => void;
    officeHours: string;
    selectedChildId: string;
    setSelectedChildId: (id: string) => void;
    isTranslated: boolean;
    setIsTranslated: (val: boolean) => void;
    onNewChat: () => void;
}

function FeedView({ onItemClick, officeHours, selectedChildId, setSelectedChildId, isTranslated, setIsTranslated, onNewChat }: FeedViewProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'announcements' | 'messages' | 'support'>('all');
    const [sort, setSort] = useState<'newest' | 'priority' | 'oldest'>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOfficeHours, setShowOfficeHours] = useState(true);
    const [showChildSelector, setShowChildSelector] = useState(false);

    // Filter Logic
    const filteredFeed = useMemo(() => {
        let items = [...MOCK_FEED];

        // 0. Child Filter
        if (selectedChildId !== 'all') {
            const childName = MOCK_CHILDREN.find(c => c.id === selectedChildId)?.name;
            items = items.filter(i => !i.childName || i.childName === childName);
        }

        // 1. Type Filter
        if (filter === 'unread') items = items.filter(i => i.isUnread);
        if (filter === 'urgent') items = items.filter(i => i.type === 'urgent');
        if (filter === 'announcements') items = items.filter(i => i.type === 'announcement' || i.type === 'urgent');
        if (filter === 'messages') items = items.filter(i => i.type === 'message');
        if (filter === 'support') items = items.filter(i => i.type === 'support');

        // 2. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(i =>
                i.title?.toLowerCase().includes(q) ||
                i.subtitle?.toLowerCase().includes(q) ||
                i.source?.toLowerCase().includes(q) ||
                i.childName?.toLowerCase().includes(q)
            );
        }

        // 3. Sort
        items.sort((a, b) => {
            if (sort === 'newest') return b.date.getTime() - a.date.getTime();
            if (sort === 'oldest') return a.date.getTime() - b.date.getTime();
            if (sort === 'priority') return (b.priority === 'HIGH' ? 1 : 0) - (a.priority === 'HIGH' ? 1 : 0);
            return 0;
        });

        return items;
    }, [filter, searchQuery, sort, selectedChildId]);

    const activeActions = filteredFeed.filter(i => i.type === 'action');
    const displayFeed = filteredFeed.filter(i => i.type !== 'action');

    const selectedChild = MOCK_CHILDREN.find(c => c.id === selectedChildId);

    return (
        <ScreenStackBase>
            {/* 1. Header (Sticky) */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-200">

                {/* Office Hours Banner */}
                {showOfficeHours && (
                    <div className="bg-muted/50 px-4 py-1.5 flex justify-between items-center border-b border-border/50">
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Office Hours: {officeHours}
                        </span>
                        <button onClick={() => setShowOfficeHours(false)} className="text-muted-foreground hover:text-foreground">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    </div>
                )}

                <div className="flex items-center px-4 h-14 gap-3 relative">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-foreground">chevron_left</span>
                    </button>

                    {/* Title / Child Selector */}
                    <div className="flex-1 flex justify-center">
                        <button
                            onClick={() => setShowChildSelector(!showChildSelector)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                        >
                            {selectedChild?.id !== 'all' && selectedChild?.avatar && (
                                <img src={selectedChild.avatar} className="w-5 h-5 rounded-full" alt="" />
                            )}
                            <span className="text-sm font-bold">{selectedChild?.name}</span>
                            <span className={`material-symbols-outlined text-[16px] transition-transform ${showChildSelector ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                    </div>

                    {/* Child Selector Dropdown */}
                    <AnimatePresence>
                        {showChildSelector && (
                            <>
                                <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowChildSelector(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-14 left-0 right-0 mx-4 mt-2 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col p-1"
                                >
                                    {MOCK_CHILDREN.map(child => (
                                        <button
                                            key={child.id}
                                            onClick={() => { setSelectedChildId(child.id); setShowChildSelector(false); }}
                                            className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors ${selectedChildId === child.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                                {child.avatar ? <img src={child.avatar} alt="" /> : <span className="material-symbols-outlined text-muted-foreground text-sm">group</span>}
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="text-sm font-bold leading-none">{child.name}</p>
                                                {child.grade && <p className="text-[10px] text-muted-foreground mt-0.5">{child.grade}</p>}
                                            </div>
                                            {selectedChildId === child.id && <span className="material-symbols-outlined text-primary text-sm">check</span>}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* New Message (Replaces Translate/Add in header for clarity or add next to it) */}
                    {/* Keeping Translate, adding New Message FAB in body instead or here? Let's put New Message in body as FAB to match requirement, and keep Translate here */}
                    <button
                        onClick={() => setIsTranslated(!isTranslated)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isTranslated ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">translate</span>
                    </button>
                </div>
            </header>

            {/* 2. Controls Row */}
            <div className="sticky top-[calc(3.5rem)] z-40 bg-background py-2 px-4 shadow-sm space-y-3 border-b border-border/30">
                {/* Search & Sort */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search updates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 text-sm transition-all text-foreground"
                        />
                    </div>
                    <button
                        onClick={() => setSort(s => s === 'newest' ? 'priority' : s === 'priority' ? 'oldest' : 'newest')}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors relative"
                    >
                        <span className="material-symbols-outlined text-muted-foreground">sort</span>
                        {sort !== 'newest' && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>}
                    </button>
                    {/* New Chat Button (Header Action) */}
                    <button
                        onClick={onNewChat}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined">edit_square</span>
                    </button>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 mask-fade-right">
                    <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                    <FilterChip label="Unread" active={filter === 'unread'} count={MOCK_FEED.filter(i => i.isUnread).length} onClick={() => setFilter('unread')} />
                    <FilterChip label="Urgent" active={filter === 'urgent'} onClick={() => setFilter('urgent')} />
                    <FilterChip label="Announcements" active={filter === 'announcements'} onClick={() => setFilter('announcements')} />
                    <FilterChip label="Messages" active={filter === 'messages'} onClick={() => setFilter('messages')} />
                    <FilterChip label="Support" active={filter === 'support'} onClick={() => setFilter('support')} />
                </div>
            </div>

            {/* 3. Feed Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">

                {/* Action Required */}
                {activeActions.length > 0 && filter === 'all' && (
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Action Required ({activeActions.length})</h3>
                        </div>
                        {activeActions.map(item => (
                            <ActionRequiredCard key={item.id} item={item} isTranslated={isTranslated} />
                        ))}
                    </div>
                )}

                {/* Main Feed */}
                <div className="space-y-3 pb-24">
                    {displayFeed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in duration-500">
                            <span className="material-symbols-outlined text-5xl mb-3 opacity-20">inbox</span>
                            <p className="text-sm font-medium">No items found for {selectedChild?.name}</p>
                            <button onClick={() => setFilter('all')} className="mt-4 text-primary text-xs font-bold hover:underline">Clear Filters</button>
                        </div>
                    ) : (
                        displayFeed.map(item => (
                            <div key={item.id} onClick={() => onItemClick(item)}>
                                <FeedItemRow item={item} isTranslated={isTranslated} />
                            </div>
                        ))
                    )}

                    {displayFeed.length > 0 && (
                        <div className="flex flex-col items-center justify-center py-8 opacity-60">
                            <span className="material-symbols-outlined text-4xl text-muted-foreground/30 mb-2">check_circle</span>
                            <p className="text-muted-foreground/60 text-sm">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </ScreenStackBase>
    );
}

// Wrapper for detail screens
function DetailViewWrapper({ children, onBack, title }: { children: React.ReactNode, onBack: () => void, title?: string }) {
    return (
        <ScreenStackDetail onBack={onBack} title={title}>
            {children}
        </ScreenStackDetail>
    );
}


// ============================================================
// ANIMATION COMPONENTS (Screen Stack)
// ============================================================

const SCREEN_TRANSITION = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1,
} as const;

function ScreenStackBase({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: '-20%', scale: 0.95 }}
            transition={SCREEN_TRANSITION}
            className="absolute inset-0 flex flex-col bg-background z-0"
        >
            {children}
        </motion.div>
    );
}

interface ScreenStackDetailProps {
    children: React.ReactNode;
    onBack: () => void;
    title?: string;
}

function ScreenStackDetail({ children, onBack, title = "Details" }: ScreenStackDetailProps) {
    // Lock body scroll when detail view is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <motion.div
            initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0.1)' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', zIndex: 100 }}
            transition={SCREEN_TRANSITION}
            className="absolute inset-0 flex flex-col bg-background z-50 h-[100dvh]"
        >
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 h-14 flex items-center px-4 shrink-0 justify-between">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-foreground">
                            {title === "New Message" ? "close" : "chevron_left"}
                        </span>
                    </button>
                    <div className="font-bold text-lg truncate">
                        {title}
                    </div>
                    <div className="w-8"></div> {/* Spacer for balance */}
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-24">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================
// DETAIL VIEW COMPONENTS
// ============================================================

interface DetailViewProps {
    item: FeedItem | null;
    isTranslated?: boolean;
}

function MessageThreadView({ item, isTranslated }: DetailViewProps) {
    if (!item) return null;
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl">
                <img src={item.senderAvatar} alt="" className="w-12 h-12 rounded-full" />
                <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
            </div>

            {/* Mock Chat Bubbles */}
            <div className="space-y-4 pt-4">
                <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                        Hello Mrs. Anderson, how is John doing?
                    </div>
                </div>
                <div className="flex justify-start">
                    <div className="bg-secondary px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
                        {item.messagePreview}
                    </div>
                </div>
            </div>

            {/* Composer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 md:absolute">
                <div className="flex gap-2">
                    <input type="text" placeholder="Type a message..." className="flex-1 h-10 px-4 rounded-full bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20" />
                    <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm">
                        <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function TicketDetailView({ item, isTranslated }: DetailViewProps) {
    if (!item) return null;
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-mono text-muted-foreground">{item.ticketId}</span>
                    <h2 className="text-xl font-bold mt-1">{title}</h2>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                    item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>{item.status}</span>
            </div>

            <div className="p-4 border border-border rounded-xl bg-card">
                <h4 className="text-sm font-bold mb-2">Ticket History</h4>
                <div className="space-y-4">
                    {/* Timeline Mock */}
                    <div className="flex gap-3 relative">
                        <div className="w-8 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-xs">person</span>
                            </div>
                            <div className="w-0.5 flex-1 bg-border my-1"></div>
                        </div>
                        <div className="pb-4">
                            <p className="text-sm font-bold">Ticket Created</p>
                            <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl flex gap-3 text-sm">
                <span className="material-symbols-outlined text-amber-600">timer</span>
                <div>
                    <span className="font-bold text-amber-800 dark:text-amber-200">SLA Target</span>
                    <p className="text-amber-700 dark:text-amber-300/80">{item.slaDue || 'Response expected soon'}</p>
                </div>
            </div>
        </div>
    );
}

function AnnouncementDetailView({ item, isTranslated }: DetailViewProps) {
    if (!item) return null;
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;

    return (
        <div className="space-y-6">
            {item.image && (
                <div className="w-full h-48 rounded-xl overflow-hidden bg-secondary">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
            )}

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-secondary rounded text-[10px] font-bold tracking-wider">{item.category}</span>
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
                <h1 className="text-2xl font-bold leading-tight">{title}</h1>
                <p className="text-lg text-muted-foreground mt-2">{item.subtitle}</p>
            </div>

            <div className="prose dark:prose-invert text-sm">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>

            {item.hasDownload && (
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined">download</span>
                    Download Attachment
                </button>
            )}

            <div className="pt-8 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">Reactions</h4>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                        <span className="material-symbols-outlined text-lg">thumb_up</span>
                        <span className="text-xs font-medium">Like</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                        <span className="material-symbols-outlined text-lg">bookmark</span>
                        <span className="text-xs font-medium">Save</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// NEW CHAT VIEW COMPONENT
// ============================================================

function NewChatView({ onStart }: { onStart: () => void }) {
    const [selectedChildId, setSelectedChildId] = useState<string>(MOCK_CHILDREN[1]?.id || 'lisa');
    const [selectedTopic, setSelectedTopic] = useState<string>('Academics');

    const TOPICS = [
        { id: 'Academics', icon: 'school' },
        { id: 'Fees', icon: 'payments' },
        { id: 'Transport', icon: 'directions_bus' },
        { id: 'IT Support', icon: 'dns' },
        { id: 'Health', icon: 'favorite' },
        { id: 'Other', icon: 'more_horiz' },
    ];

    const RECOMMENDATIONS: Record<string, { type: 'message' | 'post', title: string, subtitle: string, icon: string, color: string }> = {
        'Academics': {
            type: 'message',
            title: 'Message Teacher',
            subtitle: 'Direct message Mrs. Krabappel regarding homework, grades, or classroom behavior.',
            icon: 'person_outline',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
        },
        'Fees': {
            type: 'message',
            title: 'Contact Finance',
            subtitle: 'Inquire about outstanding balances or payment plans.',
            icon: 'receipt_long',
            color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
        },
        'Transport': {
            type: 'post',
            title: 'Bus Route Query',
            subtitle: 'Post a query to the transport department.',
            icon: 'directions_bus',
            color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
        },
        // Default fallback
    };

    const rec = RECOMMENDATIONS[selectedTopic] || RECOMMENDATIONS['Academics'];

    return (
        <div className="flex flex-col h-full animate-fade-in space-y-8">
            {/* Step 1: Child Selector */}
            <div className="flex flex-col pt-2">
                <h3 className="tracking-light text-xl font-bold leading-tight px-1 text-left pb-3">Who is this regarding?</h3>
                <div className="flex gap-3 px-1 overflow-x-auto pb-2 no-scrollbar mask-fade-right">
                    {MOCK_CHILDREN.filter(c => c.id !== 'all').map(child => {
                        const isActive = selectedChildId === child.id;
                        return (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(child.id)}
                                className={`
                                    group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full pl-2 pr-4 transition-all active:scale-95
                                    ${isActive
                                        ? 'bg-primary shadow-md shadow-primary/25'
                                        : 'bg-card border border-border hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                                `}
                            >
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'}`}>
                                    <span className="material-symbols-outlined text-[18px]">face_3</span>
                                </div>
                                <p className={`text-sm font-semibold leading-normal ${isActive ? 'text-white' : 'text-foreground'}`}>{child.name}</p>
                                {isActive && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Topic Selection */}
            <div className="flex flex-col">
                <h3 className="tracking-light text-xl font-bold leading-tight px-1 text-left pb-3">What do you need help with?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-1">
                    {TOPICS.map(topic => {
                        const isActive = selectedTopic === topic.id;
                        return (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic.id)}
                                className={`
                                    relative flex flex-col items-start gap-3 rounded-xl p-4 transition-all shadow-sm
                                    ${isActive
                                        ? 'border-2 border-primary bg-primary/5'
                                        : 'border border-border bg-card hover:border-primary/50 hover:shadow-md active:scale-[0.98]'
                                    }
                                `}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    <span className="material-symbols-outlined">{topic.icon}</span>
                                </div>
                                <h2 className="text-foreground text-base font-bold leading-tight">{topic.id}</h2>
                                {isActive && (
                                    <div className="absolute top-3 right-3 text-primary">
                                        <span className="material-symbols-outlined text-[20px] fill-1">check_circle</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 3: Destination Suggestion */}
            <div className="flex flex-col">
                <h3 className="tracking-light text-xl font-bold leading-tight px-1 text-left pb-3">Recommended Action</h3>
                <div className="flex flex-col gap-3 px-1">
                    {/* Primary Recommendation */}
                    <div className="relative overflow-hidden rounded-xl border-2 border-primary bg-card p-4 shadow-sm transition-all">
                        <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1 text-xs font-bold text-white">Suggested</div>
                        <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${rec.color}`}>
                                <span className="material-symbols-outlined text-[24px]">{rec.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-foreground">{rec.title}</h4>
                                <p className="mt-1 text-sm text-muted-foreground leading-normal">{rec.subtitle}</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span> Usually replies in 2h
                                    </span>
                                </div>
                            </div>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                                <div className="h-3 w-3 rounded-full bg-primary"></div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Option (Static Mock) */}
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all active:bg-secondary/50 opacity-60 grayscale-[0.5]">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                <span className="material-symbols-outlined text-[24px]">forum</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-foreground">Post to Class Channel</h4>
                                <p className="mt-1 text-sm text-muted-foreground leading-normal">Ask a general question visible to all parents.</p>
                            </div>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Utility */}
            <div className="px-1 mt-6">
                <button className="flex items-center gap-2 text-primary font-medium text-sm hover:underline">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Use a template for absent note
                </button>
            </div>

            {/* Floating Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-md border-t border-border p-4 pb-8 z-40 transition-colors md:absolute md:rounded-b-2xl">
                <button
                    onClick={onStart}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-4 text-center font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                    Start Conversation
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-[14px] text-muted-foreground">security</span>
                    <p className="text-xs font-medium text-muted-foreground">Chats are monitored for school safety</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// ITEM COMPONENTS (Feed Rows)
// ============================================================

function FilterChip({ label, active, count, onClick }: { label: string, active: boolean, count?: number, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5
                ${active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }
            `}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span className={`
                    flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px]
                    ${active ? 'bg-white/20' : 'bg-primary/10 text-primary'}
                `}>{count}</span>
            )}
        </button>
    );
}


function ActionRequiredCard({ item, isTranslated }: { item: FeedItem, isTranslated?: boolean }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                <span className="material-symbols-outlined">priority_high</span>
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm leading-tight">{title}</h4>
                    {item.childName && (
                        <span className="text-[10px] bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-300">{item.childName}</span>
                    )}
                </div>
                <p className="text-amber-700 dark:text-amber-400/80 text-xs mt-0.5">{item.subtitle}</p>
                <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm">
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

function FeedItemRow({ item, isTranslated }: { item: FeedItem, isTranslated?: boolean }) {
    if (item.type === 'urgent') return <UrgentCard item={item} isTranslated={isTranslated} />;
    if (item.type === 'message') return <MessageRow item={item} isTranslated={isTranslated} />;
    if (item.type === 'support') return <SupportRow item={item} isTranslated={isTranslated} />;
    return <StandardAnnouncementRow item={item} isTranslated={isTranslated} />;
}


function UrgentCard({ item, isTranslated }: { item: FeedItem, isTranslated?: boolean }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    return (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex gap-4 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-red-500">warning</span>
            </div>

            <div className="flex flex-col gap-1 z-10 w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">URGENT</span>
                        <span className="text-xs text-red-600 dark:text-red-300 font-medium">{item.timestamp}</span>
                    </div>
                </div>
                <h3 className="font-bold text-red-900 dark:text-red-100 text-lg leading-tight mt-1">{title}</h3>
                <p className="text-red-800 dark:text-red-200/80 text-sm">{item.subtitle}</p>
                <div className="flex items-center gap-2 mt-3 text-red-700 dark:text-red-300 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">school</span>
                    <span>{item.source}</span>
                </div>
            </div>
        </div>
    );
}

function StandardAnnouncementRow({ item, isTranslated }: { item: FeedItem, isTranslated?: boolean }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    return (
        <div className="bg-card dark:bg-slate-900 border border-border rounded-2xl p-3 flex gap-3 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] duration-200">
            {/* Image/Icon */}
            <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden shrink-0 relative">
                {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                        <span className="material-symbols-outlined">campaign</span>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 pt-4">
                    <p className="text-[9px] font-bold text-white text-center uppercase tracking-wider">{item.category}</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">{title}</h3>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.subtitle}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[10px]">person</span>
                        </div>
                        <span className="truncate max-w-[80px]">{item.source}</span>
                        {item.childName && (
                            <>
                                <span className="w-0.5 h-3 bg-border"></span>
                                <span className="truncate max-w-[80px] text-primary">{item.childName}</span>
                            </>
                        )}
                    </div>

                    {item.hasDownload ? (
                        <button className="flex items-center gap-1 text-primary text-[10px] font-bold bg-primary/10 px-2 py-1 rounded-md shrink-0">
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            PDF
                        </button>
                    ) : (
                        <div className="flex gap-2 shrink-0">
                            <button className="text-muted-foreground hover:text-primary"><span className="material-symbols-outlined text-[16px]">thumb_up</span></button>
                            <button className="text-muted-foreground hover:text-primary"><span className="material-symbols-outlined text-[16px]">bookmark</span></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MessageRow({ item, isTranslated }: { item: FeedItem, isTranslated?: boolean }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    return (
        <div className={`
            p-3 rounded-2xl flex gap-3 cursor-pointer transition-colors active:scale-[0.99] duration-200
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
                        {title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{item.timestamp}</span>
                </div>
                {item.childName && (
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] bg-secondary px-1.5 rounded text-muted-foreground">{item.childName}</span>
                    </div>
                )}
                <p className={`text-xs truncate ${item.isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.messagePreview}
                </p>
            </div>
        </div>
    );
}

function SupportRow({ item, isTranslated }: { item: FeedItem, isTranslated?: boolean }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    const statusColor = {
        'OPEN': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'PENDING': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'RESOLVED': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    }[item.status || 'OPEN'];

    return (
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm active:scale-[0.99] duration-200">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30 shrink-0">
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusColor}`}>{item.status}</span>
                    <span className="text-xs text-muted-foreground">{item.ticketId}</span>
                </div>
                <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Last updated {item.timestamp}</p>
            </div>
            <span className="material-symbols-outlined text-muted-foreground/50 text-xl">chevron_right</span>
        </div>
    );
}

export default CommunicationHub;
