import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedItem } from './types';
import { MOCK_FEED, MOCK_CHILDREN, TRANSLATIONS } from './mockData';
import { ScreenStackBase } from './ScreenStack';

interface FeedViewProps {
    onItemClick: (item: FeedItem) => void;
    officeHours: string;
    selectedChildId: string;
    setSelectedChildId: (id: string) => void;
    isTranslated: boolean;
    setIsTranslated: (val: boolean) => void;
    onNewChat: () => void;
    onOpenActionCenter: () => void;
    onOpenLanguage: () => void;
}

export function FeedView({ onItemClick, officeHours, selectedChildId, setSelectedChildId, isTranslated, setIsTranslated, onNewChat, onOpenActionCenter, onOpenLanguage }: FeedViewProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'announcements' | 'messages' | 'support' | 'action'>('all');
    const [sort, setSort] = useState<'newest' | 'priority' | 'oldest'>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOfficeHours, setShowOfficeHours] = useState(true);
    const [showChildSelector, setShowChildSelector] = useState(false);

    const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

    // Filter Logic
    const filteredFeed = useMemo(() => {
        let items = [...MOCK_FEED];

        // 0. Child Filter
        if (selectedChildId !== 'all') {
            const childName = MOCK_CHILDREN.find(c => c.id === selectedChildId)?.name;
            items = items.filter(i => !i.childName || i.childName === childName);
        }

        // 1. Type Filter
        if (filter === 'unread') items = items.filter(i => i.unread || i.isUnread);
        if (filter === 'urgent') items = items.filter(i => i.type === 'urgent');
        if (filter === 'action') items = items.filter(i => i.type === 'action'); // Added Action filter
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

                    {/* View Toggle */}
                    <button
                        onClick={() => setViewMode(prev => prev === 'list' ? 'compact' : 'list')}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    >
                        <span className="material-symbols-outlined text-[20px]">{viewMode === 'list' ? 'view_list' : 'view_agenda'}</span>
                    </button>

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
                    <button
                        onClick={onOpenLanguage}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground shadow-sm hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined">translate</span>
                    </button>
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
                    <FilterChip label="Action Required" active={filter === 'action'} count={MOCK_FEED.filter(i => i.type === 'action').length} onClick={() => setFilter('action')} />
                    {filter === 'action' && (
                        <button
                            onClick={onOpenActionCenter}
                            className="h-7 px-3 flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-bold animate-in fade-in zoom-in"
                        >
                            <span>Open Center</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </button>
                    )}
                    <FilterChip label="Unread" active={filter === 'unread'} count={MOCK_FEED.filter(i => i.unread || i.isUnread).length} onClick={() => setFilter('unread')} />
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
                                <FeedItemRow item={item} isTranslated={isTranslated} viewMode={viewMode} />
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
                        <span>{item.source}</span>
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
