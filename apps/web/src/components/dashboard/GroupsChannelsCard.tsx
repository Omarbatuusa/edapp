'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    members: number;
    lastActive: string; // ISO date for sorting
    created: string;    // ISO date for sorting
}

interface GroupsChannelsCardProps {
    basePath: string;
    groups?: Group[];
}

const DEFAULT_GROUPS: Group[] = [
    { id: '1', name: 'School Announcements', icon: 'campaign', iconBg: 'hsl(var(--admin-primary)/0.1)', iconColor: 'hsl(var(--admin-primary))', members: 45, lastActive: '2026-03-14T10:00:00Z', created: '2026-01-05T00:00:00Z' },
    { id: '2', name: 'Grade 10 Teachers', icon: 'school', iconBg: 'hsl(142 71% 45% / 0.1)', iconColor: 'hsl(142 71% 45%)', members: 12, lastActive: '2026-03-14T08:30:00Z', created: '2026-02-10T00:00:00Z' },
    { id: '3', name: 'Sports Committee', icon: 'sports_soccer', iconBg: 'hsl(45 100% 51% / 0.1)', iconColor: 'hsl(45 100% 51%)', members: 8, lastActive: '2026-03-13T15:00:00Z', created: '2026-03-01T00:00:00Z' },
    { id: '4', name: 'Class of 2026', icon: 'emoji_events', iconBg: 'hsl(262 83% 58% / 0.1)', iconColor: 'hsl(262 83% 58%)', members: 23, lastActive: '2026-03-12T12:00:00Z', created: '2026-01-15T00:00:00Z' },
];

type Tab = 'newest' | 'active' | 'popular';

export function GroupsChannelsCard({ basePath, groups = DEFAULT_GROUPS }: GroupsChannelsCardProps) {
    const [tab, setTab] = useState<Tab>('active');

    const sorted = [...groups].sort((a, b) => {
        if (tab === 'newest') return new Date(b.created).getTime() - new Date(a.created).getTime();
        if (tab === 'active') return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        return b.members - a.members; // popular
    });

    const tabs: { key: Tab; label: string }[] = [
        { key: 'newest', label: 'Newest' },
        { key: 'active', label: 'Active' },
        { key: 'popular', label: 'Popular' },
    ];

    return (
        <div className="ios-card">
            <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">groups</span>
                Groups &amp; Channels
            </h3>

            {/* Tab Pills */}
            <div className="flex gap-1.5 mb-3">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`px-3 py-1 rounded-full type-metadata font-semibold transition-colors ${
                            tab === t.key
                                ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]'
                                : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))]'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Group List */}
            <div className="space-y-1.5">
                {sorted.map((group) => (
                    <div
                        key={group.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer"
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: group.iconBg, color: group.iconColor }}
                        >
                            <span className="material-symbols-outlined text-[16px]">{group.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="type-muted font-semibold text-[hsl(var(--admin-text-main))] truncate">{group.name}</p>
                        </div>
                        <span className="type-metadata text-[hsl(var(--admin-text-muted))] flex-shrink-0">
                            {group.members}
                        </span>
                    </div>
                ))}
            </div>

            {/* View All */}
            <Link
                href={`${basePath}/channels`}
                className="mt-3 flex items-center justify-center gap-1 py-1.5 type-muted font-semibold text-[hsl(var(--admin-primary))] hover:text-[hsl(var(--admin-primary)/0.8)] transition-colors"
            >
                View All
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
        </div>
    );
}
