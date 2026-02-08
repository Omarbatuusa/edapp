'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Megaphone } from 'lucide-react';

// ============================================================
// THREAD ROW - Unified component for all thread types
// ============================================================

export type ThreadType = 'dm' | 'group' | 'announcement' | 'ticket' | 'safeguarding';
export type TicketStatus = 'open' | 'pending' | 'closed';
export type TicketCategory = 'fees' | 'admissions' | 'transport' | 'it' | 'general';

export interface ThreadRowProps {
    id: string;
    type: ThreadType;
    // Display
    avatar?: string | React.ReactNode;
    name: string;
    subtitle?: string;
    lastMessage: string;
    time: string;
    // State
    unread?: number;
    muted?: boolean;
    online?: boolean;
    pinned?: boolean;
    // Announcement specific
    requiresAck?: boolean;
    acknowledged?: boolean;
    // Ticket specific
    ticketStatus?: TicketStatus;
    ticketCategory?: TicketCategory;
    // Navigation
    href: string;
    onClick?: () => void;
}

const CATEGORY_ICONS: Record<TicketCategory, string> = {
    fees: 'payments',
    admissions: 'school',
    transport: 'directions_bus',
    it: 'computer',
    general: 'help_outline'
};

const STATUS_STYLES: Record<TicketStatus, string> = {
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    closed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
};

export function ThreadRow({
    id,
    type,
    avatar,
    name,
    subtitle,
    lastMessage,
    time,
    unread = 0,
    muted = false,
    online = false,
    pinned = false,
    requiresAck = false,
    acknowledged = false,
    ticketStatus,
    ticketCategory,
    href,
    onClick
}: ThreadRowProps) {
    // Render avatar based on type
    const renderAvatar = () => {
        if (type === 'safeguarding') {
            return (
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <Shield size={22} className="text-red-600 dark:text-red-400" />
                </div>
            );
        }
        if (type === 'announcement') {
            return (
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <Megaphone size={22} className="text-indigo-600 dark:text-indigo-400" />
                </div>
            );
        }
        if (type === 'ticket' && ticketCategory) {
            return (
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px] text-muted-foreground">
                        {CATEGORY_ICONS[ticketCategory]}
                    </span>
                </div>
            );
        }
        if (typeof avatar === 'string') {
            if (avatar.startsWith('http')) {
                return (
                    <div className="relative shrink-0">
                        <img
                            src={avatar}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        {online && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
                        )}
                    </div>
                );
            }
            return (
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                        {avatar}
                    </div>
                    {online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                </div>
            );
        }
        if (avatar) {
            return <div className="relative shrink-0">{avatar}</div>;
        }
        // Fallback to initials
        return (
            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                    {name.charAt(0).toUpperCase()}
                </div>
                {online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
                )}
            </div>
        );
    };

    // Render chips/badges
    const renderChips = () => {
        const chips = [];

        if (type === 'announcement' && requiresAck && !acknowledged) {
            chips.push(
                <span key="ack" className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    ACK Required
                </span>
            );
        }

        if (type === 'ticket' && ticketStatus) {
            chips.push(
                <span key="status" className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[ticketStatus]}`}>
                    {ticketStatus.charAt(0).toUpperCase() + ticketStatus.slice(1)}
                </span>
            );
        }

        if (type === 'safeguarding') {
            chips.push(
                <span key="restricted" className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Restricted
                </span>
            );
        }

        return chips.length > 0 ? <div className="flex gap-1.5 mb-0.5">{chips}</div> : null;
    };

    const content = (
        <div
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-secondary/50 ${pinned ? 'bg-secondary/30' : ''
                }`}
            onClick={onClick}
        >
            {renderAvatar()}

            <div className="flex-1 min-w-0">
                {renderChips()}
                <div className="flex items-baseline justify-between gap-2">
                    <h3 className={`font-semibold text-[15px] truncate ${unread > 0 ? 'text-foreground' : 'text-foreground'}`}>
                        {name}
                    </h3>
                    <span className={`text-xs shrink-0 ${unread > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {time}
                    </span>
                </div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-sm truncate ${unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {lastMessage}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {muted && (
                            <span className="material-symbols-outlined text-[14px] text-muted-foreground">
                                notifications_off
                            </span>
                        )}
                        {unread > 0 && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                                {unread > 99 ? '99+' : unread}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (onClick) {
        return content;
    }

    return (
        <Link href={href} className="block">
            {content}
        </Link>
    );
}
