'use client';

import { useState } from 'react';

interface FeedItem {
    id: string;
    icon: string;
    iconColor: string;
    title: string;
    source: string;
    time: string;
    category: string;
}

interface ActivityFeedProps {
    role: 'admin' | 'staff' | 'parent' | 'learner';
}

const ROLE_TABS: Record<string, string[]> = {
    admin: ['All', 'Staff', 'Students', 'System', 'Finance'],
    staff: ['All', 'Notifications', 'Classes', 'Admin'],
    parent: ['All', 'Notifications', 'School Life', 'Updates'],
    learner: ['All', 'Notifications', 'School Life', 'Achievements'],
};

const ROLE_FEED: Record<string, FeedItem[]> = {
    admin: [
        { id: 'a1', icon: 'person_add', iconColor: 'hsl(var(--admin-primary))', title: 'New enrollment application submitted', source: 'System', time: '15m ago', category: 'Students' },
        { id: 'a2', icon: 'payments', iconColor: 'hsl(142 71% 45%)', title: 'Fee payment received — R12,400', source: 'Finance', time: '1h ago', category: 'Finance' },
        { id: 'a3', icon: 'warning', iconColor: 'hsl(var(--admin-danger, 0 84% 60%))', title: 'Incident report filed — Grade 11B', source: 'Mr. Bergstrom', time: '2h ago', category: 'Students' },
        { id: 'a4', icon: 'event_busy', iconColor: 'hsl(45 100% 51%)', title: 'Leave request pending — Mrs. Patel', source: 'HR', time: '3h ago', category: 'Staff' },
        { id: 'a5', icon: 'update', iconColor: 'hsl(var(--admin-primary))', title: 'Term 1 report cards generated', source: 'System', time: '4h ago', category: 'System' },
        { id: 'a6', icon: 'group_add', iconColor: 'hsl(262 83% 58%)', title: '3 new staff onboarded this week', source: 'HR', time: 'Yesterday', category: 'Staff' },
        { id: 'a7', icon: 'account_balance', iconColor: 'hsl(142 71% 45%)', title: 'Monthly revenue report ready', source: 'Finance', time: 'Yesterday', category: 'Finance' },
        { id: 'a8', icon: 'security', iconColor: 'hsl(var(--admin-danger, 0 84% 60%))', title: 'Failed login attempt detected', source: 'System', time: 'Yesterday', category: 'System' },
    ],
    staff: [
        { id: 's1', icon: 'assignment_turned_in', iconColor: 'hsl(142 71% 45%)', title: 'Grade 11 homework submitted — 28/32', source: 'Class 11A', time: '30m ago', category: 'Classes' },
        { id: 's2', icon: 'campaign', iconColor: 'hsl(var(--admin-primary))', title: 'Staff meeting moved to 14:00', source: 'Admin', time: '1h ago', category: 'Admin' },
        { id: 's3', icon: 'notification_important', iconColor: 'hsl(45 100% 51%)', title: 'Term reports due in 5 days', source: 'System', time: '2h ago', category: 'Notifications' },
        { id: 's4', icon: 'event', iconColor: 'hsl(var(--admin-primary))', title: 'Parent evening scheduled for Friday', source: 'Admin', time: '3h ago', category: 'Admin' },
        { id: 's5', icon: 'quiz', iconColor: 'hsl(262 83% 58%)', title: 'Grade 10 test results available', source: 'Class 10B', time: '4h ago', category: 'Classes' },
        { id: 's6', icon: 'chat', iconColor: 'hsl(var(--admin-primary))', title: 'New parent message — Mrs. Simpson', source: 'Messages', time: 'Yesterday', category: 'Notifications' },
    ],
    parent: [
        { id: 'p1', icon: 'school', iconColor: 'hsl(var(--admin-primary))', title: 'Report cards available for download', source: 'School', time: '1h ago', category: 'Notifications' },
        { id: 'p2', icon: 'payments', iconColor: 'hsl(142 71% 45%)', title: 'Fee payment confirmed — R4,200', source: 'Finance', time: '2h ago', category: 'Updates' },
        { id: 'p3', icon: 'sports_soccer', iconColor: 'hsl(45 100% 51%)', title: 'Sports Day details announced', source: 'School', time: '5h ago', category: 'School Life' },
        { id: 'p4', icon: 'assignment', iconColor: 'hsl(262 83% 58%)', title: 'New homework: Chapter 7 exercises', source: 'Mr. Bergstrom', time: '6h ago', category: 'Notifications' },
        { id: 'p5', icon: 'celebration', iconColor: 'hsl(var(--admin-primary))', title: 'Cultural Day celebrations next week', source: 'School', time: 'Yesterday', category: 'School Life' },
        { id: 'p6', icon: 'update', iconColor: 'hsl(var(--admin-primary))', title: 'School calendar updated for Term 2', source: 'Admin', time: 'Yesterday', category: 'Updates' },
    ],
    learner: [
        { id: 'l1', icon: 'assignment', iconColor: 'hsl(var(--admin-primary))', title: 'New homework assigned — Math Ch.7', source: 'Mr. Bergstrom', time: '2h ago', category: 'Notifications' },
        { id: 'l2', icon: 'emoji_events', iconColor: 'hsl(45 100% 51%)', title: 'Badge earned: Perfect Attendance', source: 'System', time: '4h ago', category: 'Achievements' },
        { id: 'l3', icon: 'campaign', iconColor: 'hsl(var(--admin-primary))', title: 'Sports Day schedule posted', source: 'Admin', time: '5h ago', category: 'School Life' },
        { id: 'l4', icon: 'grading', iconColor: 'hsl(142 71% 45%)', title: 'Science test graded — 82%', source: 'Mrs. Patel', time: '6h ago', category: 'Notifications' },
        { id: 'l5', icon: 'star', iconColor: 'hsl(45 100% 51%)', title: 'Math Whiz badge unlocked!', source: 'System', time: 'Yesterday', category: 'Achievements' },
        { id: 'l6', icon: 'celebration', iconColor: 'hsl(262 83% 58%)', title: 'Cultural Day sign-up open', source: 'School', time: 'Yesterday', category: 'School Life' },
        { id: 'l7', icon: 'check_circle', iconColor: 'hsl(142 71% 45%)', title: 'History essay submitted successfully', source: 'System', time: 'Yesterday', category: 'Notifications' },
    ],
};

export function ActivityFeed({ role }: ActivityFeedProps) {
    const tabs = ROLE_TABS[role] || ROLE_TABS.learner;
    const allItems = ROLE_FEED[role] || ROLE_FEED.learner;
    const [activeTab, setActiveTab] = useState('All');
    const [showAll, setShowAll] = useState(false);

    const filtered = activeTab === 'All' ? allItems : allItems.filter(item => item.category === activeTab);
    const visible = showAll ? filtered : filtered.slice(0, 5);

    return (
        <div className="ios-card">
            <h2 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))]">dynamic_feed</span>
                Activity Feed
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto hide-scrollbar pb-0.5">
                {tabs.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => { setActiveTab(t); setShowAll(false); }}
                        className={`px-3 py-1 rounded-full type-metadata font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeTab === t
                                ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]'
                                : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))]'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Feed Items */}
            <div className="space-y-0">
                {visible.length === 0 && (
                    <p className="type-muted text-[hsl(var(--admin-text-muted))] text-center py-6">No activity in this category.</p>
                )}
                {visible.map((item, idx) => (
                    <div key={item.id}>
                        <div className="flex items-start gap-3 py-3 cursor-pointer hover:bg-[hsl(var(--admin-surface-alt)/0.5)] -mx-2 px-2 rounded-xl transition-colors">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: `${item.iconColor}15`, color: item.iconColor }}
                            >
                                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="type-muted font-semibold text-[hsl(var(--admin-text-main))] leading-snug">{item.title}</p>
                                <p className="type-metadata text-[hsl(var(--admin-text-muted))] mt-0.5">
                                    {item.source} · {item.time}
                                </p>
                            </div>
                        </div>
                        {idx < visible.length - 1 && (
                            <div className="h-px bg-[hsl(var(--admin-border)/0.5)] mx-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Load More */}
            {filtered.length > 5 && !showAll && (
                <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="mt-3 w-full py-2 rounded-xl bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-surface-alt)/0.8)] transition-colors type-muted font-semibold text-[hsl(var(--admin-text-muted))]"
                >
                    Load More
                </button>
            )}
        </div>
    );
}
