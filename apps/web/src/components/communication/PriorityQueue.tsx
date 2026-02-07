'use client';

import React from 'react';
import Link from 'next/link';
import type { FeedItem } from '@/lib/communication-store';

// ============================================================
// PRIORITY QUEUE - Action required items at top of feed
// ============================================================

interface PriorityQueueProps {
    items: FeedItem[];
    tenantSlug: string;
    onAcknowledge?: (id: string) => void;
}

export function PriorityQueue({ items, tenantSlug, onAcknowledge }: PriorityQueueProps) {
    if (items.length === 0) return null;

    return (
        <div className="mb-4 p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-600 text-lg">priority_high</span>
                <h3 className="text-sm font-semibold text-amber-800">Action Required</h3>
                <span className="px-1.5 py-0.5 rounded-lg bg-amber-200 text-amber-800 text-xs font-semibold">
                    {items.length}
                </span>
            </div>

            {/* Items */}
            <div className="space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-amber-100/60 shadow-sm"
                    >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* Type icon */}
                            <span className="material-symbols-outlined text-amber-600 text-sm">
                                {item.type === 'announcement' ? 'campaign' : item.type === 'message' ? 'chat' : 'support_agent'}
                            </span>

                            {/* Title */}
                            <span className="text-sm font-medium text-foreground truncate">
                                {item.title}
                            </span>
                        </div>

                        {/* Action button */}
                        {item.requiresAck && item.ackStatus === 'pending' ? (
                            <button
                                onClick={() => onAcknowledge?.(item.id)}
                                className="px-3 py-1 rounded bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
                            >
                                Acknowledge
                            </button>
                        ) : (
                            <Link
                                href={`/tenant/${tenantSlug}/parent/${item.type === 'announcement' ? 'announcements' : 'chat'}/${item.id}`}
                                className="px-3 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors whitespace-nowrap"
                            >
                                Review
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PriorityQueue;
