'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, ChevronLeft } from 'lucide-react';
import { FeedCard } from './FeedCard';
import { FeedFilters } from './FeedFilters';
import { PriorityQueue } from './PriorityQueue';
import {
    useCommunicationStore,
    type FilterType,
} from '@/lib/communication-store';

// ============================================================
// COMMUNICATION HUB - Unified single-screen feed
// ============================================================

interface CommunicationHubProps {
    tenantName?: string;
    tenantLogo?: string;
    officeHours?: string;
    isAfterHours?: boolean;
}

const FAB_OPTIONS = [
    { id: 'message', label: 'New Message', icon: 'chat', href: '/chat/new' },
    { id: 'support', label: 'Support Ticket', icon: 'support_agent', href: '/chat/support/new' },
];

export function CommunicationHub({
    officeHours = 'Mon–Fri 08:00–15:00',
    isAfterHours = false,
}: CommunicationHubProps) {
    const params = useParams();
    const router = useRouter();
    const tenantSlug = params.slug as string;

    // Store state
    const {
        filter,
        sort,
        density,
        searchQuery,
        setFilter,
        setSort,
        setDensity,
        setSearchQuery,
        acknowledgeItem,
        markAsRead,
        getFilteredItems,
        getActionRequiredItems,
        getUnreadCount,
        getUrgentCount,
    } = useCommunicationStore();

    // UI state
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Computed values
    const filteredItems = getFilteredItems();
    const actionItems = getActionRequiredItems();
    const unreadCount = getUnreadCount();
    const urgentCount = getUrgentCount();

    // Filter chips config
    const filterChips = useMemo(() => [
        { id: 'all' as FilterType, label: 'All' },
        { id: 'unread' as FilterType, label: 'Unread', count: unreadCount },
        { id: 'urgent' as FilterType, label: 'Urgent', count: urgentCount },
        { id: 'announcement' as FilterType, label: 'Announcements' },
        { id: 'message' as FilterType, label: 'Messages' },
        { id: 'support' as FilterType, label: 'Support' },
    ], [unreadCount, urgentCount]);

    return (
        <div className="flex flex-col min-h-full bg-background">
            {/* ============================================ */}
            {/* STICKY CONTROLS - Below existing shell header */}
            {/* ============================================ */}
            <div className="sticky top-0 z-10 bg-background">
                {/* Title bar with back button */}
                <div className="border-b border-border">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="flex items-center h-12">
                            {/* Back button + Title */}
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-1 -ml-2 px-2 py-1 rounded-md hover:bg-secondary transition-colors"
                            >
                                <ChevronLeft size={20} className="text-muted-foreground" />
                                <h1 className="text-base font-semibold text-foreground">
                                    Communication Hub
                                </h1>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Office hours strip */}
                <div className="border-b border-border bg-muted/30">
                    <div className="max-w-3xl mx-auto px-4 py-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {isAfterHours && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}
                            <span>
                                {isAfterHours ? 'After-hours • ' : ''}Office Hours: {officeHours} • Responses may be delayed.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter controls - no horizontal scroll */}
                <div className="border-b border-border bg-background">
                    <div className="max-w-3xl mx-auto px-4">
                        <FeedFilters
                            filters={filterChips}
                            activeFilter={filter}
                            sort={sort}
                            density={density}
                            onFilterChange={setFilter}
                            onSortChange={setSort}
                            onDensityChange={setDensity}
                            showDensityToggle
                        />
                    </div>
                </div>

                {/* Search input (collapsible) */}
                {showSearch && (
                    <div className="border-b border-border bg-background">
                        <div className="max-w-3xl mx-auto px-4 py-3">
                            <input
                                type="text"
                                placeholder="Search messages, announcements, tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 px-4 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================ */}
            {/* MAIN CONTENT */}
            {/* ============================================ */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-24">
                {/* Priority Queue */}
                <div className="mt-4">
                    <PriorityQueue
                        items={actionItems}
                        tenantSlug={tenantSlug}
                        onAcknowledge={acknowledgeItem}
                    />
                </div>

                {/* Unified Feed */}
                <div className="space-y-3 mt-4">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <FeedCard
                                key={item.id}
                                item={item}
                                tenantSlug={tenantSlug}
                                density={density}
                                onAcknowledge={acknowledgeItem}
                                onMarkRead={markAsRead}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-3">
                                {filter === 'unread' ? 'mark_email_read' : filter === 'urgent' ? 'done_all' : 'forum'}
                            </span>
                            <h3 className="text-base font-medium text-foreground mb-1">
                                {filter === 'unread' ? "You're all caught up!" :
                                    filter === 'urgent' ? 'No urgent items' :
                                        'No items found'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {searchQuery ? 'Try a different search term' :
                                    filter !== 'all' ? 'Try changing your filter' :
                                        'New messages and announcements will appear here'}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* ============================================ */}
            {/* FAB MENU OVERLAY */}
            {/* ============================================ */}
            {showFabMenu && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setShowFabMenu(false)}
                />
            )}

            {/* FAB Options */}
            {showFabMenu && (
                <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 animate-in slide-in-from-bottom-4 fade-in duration-200">
                    {FAB_OPTIONS.map((option) => (
                        <Link
                            key={option.id}
                            href={`/tenant/${tenantSlug}/parent${option.href}`}
                            className="flex items-center gap-3 pl-4 pr-5 py-3 bg-card rounded-xl shadow-lg border border-border hover:bg-secondary transition-colors"
                            onClick={() => setShowFabMenu(false)}
                        >
                            <span className="material-symbols-outlined text-primary">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                        </Link>
                    ))}
                </div>
            )}

            {/* Floating Action Button - Professional minimal style */}
            <button
                onClick={() => setShowFabMenu(!showFabMenu)}
                className={`fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg transition-all duration-200 ${showFabMenu
                        ? 'bg-card border border-border'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                aria-label={showFabMenu ? 'Close menu' : 'New'}
            >
                {showFabMenu ? (
                    <X size={18} className="text-foreground" />
                ) : (
                    <>
                        <Plus size={18} />
                        <span className="text-sm font-medium">New</span>
                    </>
                )}
            </button>
        </div>
    );
}

export default CommunicationHub;
