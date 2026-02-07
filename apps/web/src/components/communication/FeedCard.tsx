'use client';

import React from 'react';
import Link from 'next/link';
import type { FeedItem } from '@/lib/communication-store';

// ============================================================
// FEED CARD - Universal card for all communication types
// ============================================================

interface FeedCardProps {
    item: FeedItem;
    tenantSlug: string;
    density?: 'comfortable' | 'compact';
    onAcknowledge?: (id: string) => void;
    onMarkRead?: (id: string) => void;
}

// Type badge colors (professional, minimal)
const TYPE_STYLES = {
    announcement: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-100',
        icon: 'campaign',
        label: 'ANNOUNCEMENT',
    },
    message: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        icon: 'chat',
        label: 'MESSAGE',
    },
    support: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-100',
        icon: 'support_agent',
        label: 'SUPPORT',
    },
};

// Status badge styles
const STATUS_STYLES = {
    open: { bg: 'bg-orange-100', text: 'text-orange-700' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    resolved: { bg: 'bg-green-100', text: 'text-green-700' },
};

// Attachment type icons
const ATTACHMENT_ICONS: Record<string, string> = {
    pdf: 'picture_as_pdf',
    image: 'image',
    document: 'description',
    link: 'link',
};

export function FeedCard({ item, tenantSlug, density = 'comfortable', onAcknowledge, onMarkRead }: FeedCardProps) {
    const typeStyle = TYPE_STYLES[item.type];
    const isCompact = density === 'compact';

    // Build href based on type
    const getHref = () => {
        switch (item.type) {
            case 'announcement':
                return `/tenant/${tenantSlug}/parent/announcements/${item.id}`;
            case 'message':
                return `/tenant/${tenantSlug}/parent/chat/${item.threadId || item.id}`;
            case 'support':
                return `/tenant/${tenantSlug}/parent/chat/support/${item.id}`;
            default:
                return '#';
        }
    };

    const handleClick = () => {
        if (item.unread && onMarkRead) {
            onMarkRead(item.id);
        }
    };

    return (
        <Link
            href={getHref()}
            onClick={handleClick}
            className={`block bg-card border border-border/60 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-border ${isCompact ? 'p-3' : 'p-4'
                } ${item.unread ? 'border-l-[3px] border-l-primary' : ''}`}
        >
            {/* Row 1: Type badge + Title + Timestamp */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Type badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${typeStyle.bg} ${typeStyle.text}`}>
                        <span className="material-symbols-outlined text-xs">{typeStyle.icon}</span>
                        {!isCompact && typeStyle.label}
                    </span>

                    {/* Urgency indicator */}
                    {item.urgency === 'urgent' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            URGENT
                        </span>
                    )}

                    {/* Title */}
                    <h3 className={`font-medium text-foreground truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
                        {item.title}
                    </h3>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {item.timestamp}
                </span>
            </div>

            {/* Row 2: Source + Learner context */}
            <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isCompact ? 'mt-1' : 'mt-2'}`}>
                {/* Source with optional avatar */}
                <div className="flex items-center gap-1.5">
                    {item.source.avatar ? (
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex items-center justify-center">
                            {item.source.avatar}
                        </span>
                    ) : (
                        <span className="material-symbols-outlined text-sm text-muted-foreground">
                            {item.type === 'support' ? 'apartment' : 'person'}
                        </span>
                    )}
                    <span>{item.source.name}</span>
                    {item.source.role && (
                        <>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{item.source.role}</span>
                        </>
                    )}
                </div>

                {/* Learner context */}
                {item.learnerContext && item.learnerContext.length > 0 && (
                    <>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="text-primary/80">
                            For: {item.learnerContext.map(l => `${l.name} • ${l.grade}`).join(', ')}
                        </span>
                    </>
                )}
            </div>

            {/* Row 3: Preview + Attachments */}
            <p className={`text-muted-foreground line-clamp-2 ${isCompact ? 'mt-1 text-xs' : 'mt-2 text-sm'}`}>
                {item.preview}
            </p>

            {/* Attachments indicator */}
            {item.attachments && item.attachments.length > 0 && (
                <div className={`flex items-center gap-2 ${isCompact ? 'mt-1' : 'mt-2'}`}>
                    {item.attachments.map((att, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-xs text-muted-foreground">
                            <span className="material-symbols-outlined text-xs">
                                {ATTACHMENT_ICONS[att.type] || 'attach_file'}
                            </span>
                            {att.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Row 4: Actions based on type */}
            <div className={`flex items-center justify-between ${isCompact ? 'mt-2' : 'mt-3'}`}>
                <div className="flex items-center gap-2">
                    {/* Unread indicator for messages */}
                    {item.type === 'message' && item.unread && item.unreadCount && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {item.unreadCount} new
                        </span>
                    )}

                    {/* Support status badge */}
                    {item.type === 'support' && item.status && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLES[item.status].bg} ${STATUS_STYLES[item.status].text}`}>
                            {item.status}
                        </span>
                    )}

                    {/* ACK status for announcements */}
                    {item.type === 'announcement' && item.requiresAck && (
                        item.ackStatus === 'acknowledged' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                Acknowledged
                            </span>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAcknowledge?.(item.id);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                            >
                                Acknowledge
                            </button>
                        )
                    )}
                </div>

                {/* View action */}
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                    {item.type === 'support' ? 'View ticket' : item.type === 'message' ? 'Open' : 'View'}
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
            </div>
        </Link>
    );
}

export default FeedCard;
