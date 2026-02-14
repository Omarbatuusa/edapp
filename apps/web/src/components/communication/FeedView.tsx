import { useCommunicationStore } from '../../lib/communication-store';
import { MOCK_CHILDREN, TRANSLATIONS, MOCK_FEED } from './mockData';
import React, { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// ScreenStackBase removed - using simple flex container instead
import { FeedItem } from './types';

// ===========================================
// PROPS INTERFACE
// ===========================================

export interface FeedViewProps {
    onItemClick: (item: any) => void;
    officeHours: string;
    selectedChildId: string;
    setSelectedChildId: (id: string) => void;
    isTranslated: boolean;
    setIsTranslated: (value: boolean) => void;
    onNewChat: () => void;
    onOpenActionCenter: () => void;
    onOpenLanguage: () => void;
}

export function FeedView({ onItemClick, officeHours, selectedChildId, setSelectedChildId, isTranslated, setIsTranslated, onNewChat, onOpenActionCenter, onOpenLanguage }: FeedViewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<'all' | 'announcements' | 'classes' | 'direct' | 'support'>('all');
    const [isOffline, setIsOffline] = useState(false); // Mock offline state
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState<'newest' | 'priority' | 'oldest'>('newest');
    const [showOfficeHours, setShowOfficeHours] = useState(true);
    const [showChildSelector, setShowChildSelector] = useState(false);
    const [childSearchQuery, setChildSearchQuery] = useState('');

    // Filter children for selector
    const filteredChildren = MOCK_CHILDREN.filter(child =>
        child.name.toLowerCase().includes(childSearchQuery.toLowerCase())
    );

    // Close handler - navigate to parent dashboard
    const handleClose = () => {
        if (pathname) {
            // Replace /chat with empty to go back to role dashboard
            const dashboardPath = pathname.replace('/chat', '');
            router.push(dashboardPath);
        } else {
            router.back();
        }
    };

    // Store hooks
    const storeItems = useCommunicationStore(state => state.items);
    const fetchFeed = useCommunicationStore(state => state.fetchFeed);
    const isLoading = useCommunicationStore(state => state.isLoading);
    const error = useCommunicationStore(state => state.error);

    React.useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    // Use mock data as fallback when store is empty (API failure or loading)
    const feedItems = storeItems.length > 0 ? storeItems : MOCK_FEED;

    // Filter Logic
    const filteredFeed = useMemo(() => {
        let items = [...feedItems] as FeedItem[];

        // 0. Child Filter (TODO: Backend filtering)
        if (selectedChildId !== 'all') {
            const childName = MOCK_CHILDREN.find(c => c.id === selectedChildId)?.name;
            // items = items.filter(i => !i.childName || i.childName === childName);
            // Need child info in FeedItem from API
        }

        // 1. Tab Filter
        if (activeTab === 'announcements') items = items.filter(i => i.type === 'announcement' || i.urgency === 'urgent');
        if (activeTab === 'classes') items = items.filter(i => i.type === 'message'); // TODO: Class distinction
        if (activeTab === 'direct') items = items.filter(i => i.type === 'message');
        if (activeTab === 'support') items = items.filter(i => i.type === 'support');

        // 2. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(i =>
                i.title?.toLowerCase().includes(q) ||
                i.preview?.toLowerCase().includes(q)
            );
        }

        // 3. Sort
        items.sort((a, b) => {
            // Urgent always on top
            if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
            if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;

            if (sort === 'newest') return (b.timestamp || '').localeCompare(a.timestamp || '');
            return 0;
        });

        return items;
    }, [activeTab, searchQuery, sort, selectedChildId, feedItems]);

    const activeActions = useMemo(() => feedItems.filter((i: any) => i.requiresAck && i.ackStatus === 'pending'), [feedItems]);
    const displayFeed = filteredFeed;
    const selectedChild = MOCK_CHILDREN.find(c => c.id === selectedChildId);

    // Tab badge counts
    const tabBadges = useMemo(() => {
        const all = feedItems.filter((i: FeedItem) => i.unread || i.isUnread).length;
        const announcements = feedItems.filter((i: FeedItem) => (i.type === 'announcement' || i.urgency === 'urgent') && (i.unread || i.isUnread)).length;
        const classes = feedItems.filter((i: FeedItem) => i.type === 'message' && (i.unread || i.isUnread)).length;
        const direct = feedItems.filter((i: FeedItem) => i.type === 'message' && (i.unread || i.isUnread)).length;
        const support = feedItems.filter((i: FeedItem) => i.type === 'support' && (i.unread || i.isUnread)).length;
        return { all, announcements, classes, direct, support };
    }, [feedItems]);

    // Mock Offline Toggle for Demo
    // useEffect(() => {
    //     const timer = setTimeout(() => setIsOffline(true), 5000);
    //     return () => clearTimeout(timer);
    // }, []);


    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-slate-50 dark:bg-[#0B1120]">

            {/* ============================================ */}
            {/* FULL SCREEN CHILD SELECTOR OVERLAY */}
            {/* ============================================ */}
            {showChildSelector && (
                <>
                    {/* Backdrop for desktop */}
                    <div className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm hidden md:block" onClick={() => { setShowChildSelector(false); setChildSearchQuery(''); }} />
                    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0B1120] flex flex-col h-[100dvh] animate-in fade-in duration-200 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-[95%] md:max-h-[80vh] md:h-auto md:rounded-2xl md:shadow-2xl md:border md:border-border/50 overflow-hidden">
                        {/* Selector Header */}
                        <div className="shrink-0 px-5 pt-5 pb-4">
                            <div className="flex items-center justify-between mb-5">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight">Select Child</h1>
                                <button
                                    onClick={() => { setShowChildSelector(false); setChildSearchQuery(''); }}
                                    aria-label="Close"
                                    className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <span className="material-symbols-outlined text-2xl">close</span>
                                </button>
                            </div>

                            {/* Selected Children Chips */}
                            {selectedChildId !== 'all' && selectedChild && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full pl-1 pr-2 py-1">
                                        <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden shrink-0 ring-1 ring-white">
                                            {selectedChild.avatar ? <img src={selectedChild.avatar} alt="" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-muted-foreground text-xs flex items-center justify-center w-full h-full">person</span>}
                                        </div>
                                        <span className="text-xs font-semibold text-primary">{selectedChild.name}</span>
                                        <button
                                            onClick={() => setSelectedChildId('all')}
                                            className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors"
                                        >
                                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Search Bar */}
                            <div className="relative rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/40">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-muted-foreground">search</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search child..."
                                    value={childSearchQuery}
                                    onChange={(e) => setChildSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3.5 border-none bg-slate-100 dark:bg-slate-800 text-foreground rounded-xl placeholder-muted-foreground focus:ring-0 text-base"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Select All Control */}
                        <div className="shrink-0 px-5 py-3 flex items-center justify-between border-b border-border/50 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-sm">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Children</span>
                            <button
                                onClick={() => setSelectedChildId('all')}
                                className="flex items-center gap-2 group"
                            >
                                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Select All</span>
                                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${selectedChildId === 'all' ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${selectedChildId === 'all' ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                                </div>
                            </button>
                        </div>

                        {/* Children List */}
                        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 space-y-1.5 overscroll-contain">
                            {filteredChildren.filter(c => c.id !== 'all').map(child => {
                                const isSelected = selectedChildId === child.id || selectedChildId === 'all';
                                return (
                                    <button
                                        key={child.id}
                                        onClick={() => setSelectedChildId(child.id)}
                                        className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group border border-transparent hover:border-border/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-full bg-secondary overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm transition-all ${isSelected ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                                                    {child.avatar ? (
                                                        <img src={child.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                            <span className="material-symbols-outlined text-primary">person</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-800 bg-green-400" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">{child.name}</h3>
                                                {child.grade && <p className="text-sm text-muted-foreground font-medium">{child.grade}</p>}
                                            </div>
                                        </div>
                                        {/* Circular checkbox */}
                                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-primary'}`}>
                                            {isSelected && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredChildren.filter(c => c.id !== 'all').length === 0 && (
                                <div className="flex flex-col items-center py-12 text-muted-foreground">
                                    <span className="material-symbols-outlined text-5xl opacity-20 mb-2">search_off</span>
                                    <p className="text-sm font-medium">No children found</p>
                                </div>
                            )}
                        </div>

                        {/* Sticky Apply Button */}
                        <div className="shrink-0 p-4 bg-white dark:bg-[#0B1120] shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)] border-t border-border/50 md:rounded-b-2xl">
                            <button
                                onClick={() => { setShowChildSelector(false); setChildSearchQuery(''); }}
                                className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                            >
                                <span>Apply Selection</span>
                                <span className="bg-white/20 text-white text-xs py-0.5 px-2 rounded-full font-bold">
                                    {selectedChildId === 'all' ? MOCK_CHILDREN.filter(c => c.id !== 'all').length : 1}
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* 1. Header */}
            <header className="shrink-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 transition-all duration-200 shadow-sm">

                {/* Offline Indicator */}
                {isOffline && (
                    <div className="bg-zinc-800 text-zinc-300 px-4 py-1 text-xs font-medium text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="material-symbols-outlined text-[14px] animate-pulse">wifi_off</span>
                        <span>Offline — messages will send when connected</span>
                    </div>
                )}

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

                <div className="flex items-center px-4 h-14 gap-3">
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-foreground">close</span>
                    </button>

                    {/* Title / Child Selector Trigger */}
                    <div className="flex-1 flex justify-center">
                        <button
                            onClick={() => setShowChildSelector(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                        >
                            {selectedChild?.id !== 'all' && selectedChild?.avatar && (
                                <img src={selectedChild.avatar} className="w-5 h-5 rounded-full" alt="" />
                            )}
                            <span className="text-sm font-bold">{selectedChild?.name || 'All Children'}</span>
                            {selectedChildId !== 'all' ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedChildId('all'); }}
                                    className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/40 transition-colors"
                                >
                                    <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            ) : (
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={onOpenLanguage}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isTranslated ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">translate</span>
                        </button>
                        <button
                            onClick={onNewChat}
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit_square</span>
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex px-2 overflow-x-auto no-scrollbar border-t border-border/50">
                    <TabButton label="All" active={activeTab === 'all'} onClick={() => setActiveTab('all')} badge={tabBadges.all} />
                    <TabButton label="Announcements" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} badge={tabBadges.announcements} />
                    <TabButton label="Classes" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} badge={tabBadges.classes} />
                    <TabButton label="Direct" active={activeTab === 'direct'} onClick={() => setActiveTab('direct')} badge={tabBadges.direct} />
                    <TabButton label="Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} badge={tabBadges.support} />
                </div>
            </header>

            {/* 2. Controls - Search */}
            <div className="shrink-0 bg-background py-2 px-4 shadow-sm border-b border-border/30">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-10 pr-4 rounded-lg bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 text-sm transition-all text-foreground"
                    />
                </div>
            </div>

            {/* 3. Feed Content - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>

                {/* Action Required */}
                {activeActions.length > 0 && activeTab === 'all' && (
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
                            <span className="material-symbols-outlined text-5xl mb-3 opacity-20">
                                {activeTab === 'announcements' ? 'campaign' : activeTab === 'classes' ? 'school' : activeTab === 'direct' ? 'chat' : activeTab === 'support' ? 'support_agent' : 'inbox'}
                            </span>
                            <p className="text-sm font-semibold">
                                {activeTab === 'announcements' ? 'No announcements' : activeTab === 'classes' ? 'No class messages' : activeTab === 'direct' ? 'No direct messages' : activeTab === 'support' ? 'No support tickets' : `No items found`}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                {activeTab === 'announcements' ? 'School announcements will appear here' : activeTab === 'classes' ? 'Messages from teachers will appear here' : activeTab === 'direct' ? 'Start a conversation with the new chat button' : activeTab === 'support' ? 'Create a support ticket if you need help' : 'Your messages and updates will appear here'}
                            </p>
                            {activeTab !== 'all' && <button onClick={() => setActiveTab('all')} className="mt-4 text-primary text-xs font-bold hover:underline">View All</button>}
                        </div>
                    ) : (
                        displayFeed.map(item => (
                            <div key={item.id} onClick={() => onItemClick(item)} className="cursor-pointer touch-pan-y">
                                <FeedItemRow item={item} isTranslated={isTranslated} viewMode={'list'} />
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
        </div>
    );
}

// Tab Button Component
function TabButton({ label, active, onClick, badge = 0 }: { label: string, active: boolean, onClick: () => void, badge?: number }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap outline-none flex items-center gap-1.5
                ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
            `}
        >
            {label}
            {badge > 0 && (
                <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 flex items-center justify-center leading-none ${active ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-300" />
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

function FeedItemRow({ item, isTranslated, viewMode }: { item: FeedItem, isTranslated?: boolean, viewMode: 'list' | 'compact' }) {
    if (item.type === 'urgent') return <UrgentCard item={item} isTranslated={isTranslated} viewMode={viewMode} />;
    if (item.type === 'message') return <MessageRow item={item} isTranslated={isTranslated} viewMode={viewMode} />;
    if (item.type === 'support') return <SupportRow item={item} isTranslated={isTranslated} viewMode={viewMode} />;
    return <StandardAnnouncementRow item={item} isTranslated={isTranslated} viewMode={viewMode} />;
}

function UrgentCard({ item, isTranslated, viewMode }: { item: FeedItem, isTranslated?: boolean, viewMode: 'list' | 'compact' }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    return (
        <div className={`
             bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-2xl flex gap-4 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all
             ${viewMode === 'compact' ? 'p-3 items-center' : 'p-4'}
        `}>
            {viewMode !== 'compact' && (
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-8xl text-red-500">warning</span>
                </div>
            )}

            <div className="flex flex-col gap-1 z-10 w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">URGENT</span>
                        <span className="text-xs text-red-600 dark:text-red-300 font-medium">{item.timestamp || item.time}</span>
                    </div>
                </div>
                <h3 className={`font-bold text-red-900 dark:text-red-100 leading-tight mt-1 ${viewMode === 'compact' ? 'text-sm' : 'text-lg'}`}>{title}</h3>
                {viewMode !== 'compact' && <p className="text-red-800 dark:text-red-200/80 text-sm">{item.subtitle}</p>}
                {viewMode !== 'compact' && (
                    <div className="flex items-center gap-2 mt-3 text-red-700 dark:text-red-300 text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">school</span>
                        <span>{typeof item.source === 'string' ? item.source : item.source?.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function StandardAnnouncementRow({ item, isTranslated, viewMode }: { item: FeedItem, isTranslated?: boolean, viewMode: 'list' | 'compact' }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    return (
        <div className={`
            bg-card dark:bg-slate-900 border border-border rounded-2xl flex hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] duration-200
            ${viewMode === 'compact' ? 'p-2 gap-2 items-center' : 'p-3 gap-3'}
        `}>
            {/* Image/Icon */}
            <div className={`rounded-xl bg-secondary overflow-hidden shrink-0 relative ${viewMode === 'compact' ? 'w-10 h-10' : 'w-20 h-20'}`}>
                {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                        <span className={`material-symbols-outlined ${viewMode === 'compact' ? 'text-[20px]' : ''}`}>campaign</span>
                    </div>
                )}
                {viewMode !== 'compact' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 pt-4">
                        <p className="text-[9px] font-bold text-white text-center uppercase tracking-wider">{item.category}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">{title}</h3>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2 shrink-0">{item.timestamp || item.time}</span>
                    </div>
                    {viewMode !== 'compact' && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.subtitle}</p>}
                </div>

                {viewMode !== 'compact' && (
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[10px]">person</span>
                            </div>
                            <span className="truncate max-w-[80px]">{typeof item.source === 'string' ? item.source : item.source?.name}</span>
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
                )}
            </div>
        </div>
    );
}

function MessageRow({ item, isTranslated, viewMode }: { item: FeedItem, isTranslated?: boolean, viewMode: 'list' | 'compact' }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    const isUnread = item.unread || item.isUnread;
    return (
        <div className={`
            rounded-2xl flex gap-3 cursor-pointer transition-colors active:scale-[0.99] duration-200
            ${isUnread ? 'bg-primary/5 border border-primary/20' : 'bg-card border border-border hover:bg-secondary/30'}
            ${viewMode === 'compact' ? 'p-2 items-center' : 'p-3'}
        `}>
            {/* ... same image logic can be compacted ... */}
            <div className={`relative shrink-0 ${viewMode === 'compact' ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <img src={item.senderAvatar || `https://ui-avatars.com/api/?name=${item.title}`} alt="" className="w-full h-full rounded-full object-cover" />
                {isUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <h4 className={`text-sm truncate ${isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                        {title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{item.timestamp || item.time}</span>
                </div>
                {item.childName && viewMode !== 'compact' && (
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] bg-secondary px-1.5 rounded text-muted-foreground">{item.childName}</span>
                    </div>
                )}
                <p className={`text-xs truncate ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.messagePreview || item.subtitle}
                </p>
            </div>
        </div>
    );
}

function SupportRow({ item, isTranslated, viewMode }: { item: FeedItem, isTranslated?: boolean, viewMode: 'list' | 'compact' }) {
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;
    const statusColor = ({
        'OPEN': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'PENDING': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'RESOLVED': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    } as any)[item.status || 'OPEN'];

    return (
        <div className={`
            bg-card border border-border rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-sm active:scale-[0.99] duration-200
            ${viewMode === 'compact' ? 'p-2' : 'p-3'}
        `}>
            <div className={`rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30 shrink-0 ${viewMode === 'compact' ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <span className={`material-symbols-outlined ${viewMode === 'compact' ? 'text-[16px]' : 'text-[20px]'}`}>confirmation_number</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusColor}`}>{item.status}</span>
                    <span className="text-xs text-muted-foreground">{item.ticketId}</span>
                </div>
                <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
                {viewMode !== 'compact' && <p className="text-[10px] text-muted-foreground mt-0.5">Last updated {item.timestamp || item.time}</p>}
            </div>
            <span className="material-symbols-outlined text-muted-foreground/50 text-xl">chevron_right</span>
        </div>
    );
}
