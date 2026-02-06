'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

// ============================================================
// CHAT LANE - Reusable lane container
// ============================================================
interface ChatLaneProps {
    title: string;
    badge?: number | string;
    viewAllHref?: string;
    rightAction?: React.ReactNode;
    children: React.ReactNode;
}

export function ChatLane({ title, badge, viewAllHref, rightAction, children }: ChatLaneProps) {
    return (
        <section className="mb-6">
            {/* Lane Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-base">{title}</h2>
                    {badge !== undefined && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                            {badge}
                        </span>
                    )}
                </div>
                {viewAllHref ? (
                    <Link href={viewAllHref} className="text-sm text-primary font-medium hover:underline">
                        View all
                    </Link>
                ) : rightAction}
            </div>

            {/* Lane Content */}
            <div className="space-y-2">
                {children}
            </div>
        </section>
    );
}

// ============================================================
// THREAD ROW CARD - For messages/DMs
// ============================================================
interface ThreadRowCardProps {
    avatar: string | React.ReactNode;
    name: string;
    context?: string;
    lastMessage: string;
    time: string;
    unread?: number;
    urgent?: boolean;
    href: string;
}

export function ThreadRowCard({ avatar, name, context, lastMessage, time, unread, urgent, href }: ThreadRowCardProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors ${unread ? 'bg-primary/5' : ''
                }`}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                {typeof avatar === 'string' ? (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">{avatar}</span>
                    </div>
                ) : avatar}
                {urgent && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm truncate ${unread ? 'font-semibold' : 'font-medium'}`}>{name}</span>
                    {context && (
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">{context}</span>
                    )}
                </div>
                <p className={`text-sm truncate mt-0.5 ${unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {lastMessage}
                </p>
            </div>

            {/* Right side */}
            <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">{time}</span>
                {unread && unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </div>
        </Link>
    );
}

// ============================================================
// ANNOUNCEMENT COMPACT CARD - For announcements lane
// ============================================================
interface AnnouncementCompactCardProps {
    title: string;
    preview: string;
    time: string;
    badges: ('urgent' | 'ack' | 'doc' | 'event')[];
    requiresAck?: boolean;
    acknowledged?: boolean;
    onAcknowledge?: () => void;
    href: string;
}

export function AnnouncementCompactCard({
    title,
    preview,
    time,
    badges,
    requiresAck,
    acknowledged,
    onAcknowledge,
    href
}: AnnouncementCompactCardProps) {
    const badgeConfig: Record<string, { icon: string; color: string }> = {
        urgent: { icon: 'priority_high', color: 'text-red-500' },
        ack: { icon: 'check_circle', color: 'text-amber-500' },
        doc: { icon: 'attach_file', color: 'text-blue-500' },
        event: { icon: 'event', color: 'text-emerald-500' },
    };

    return (
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">campaign</span>
            </div>

            {/* Content */}
            <Link href={href} className="flex-1 min-w-0 hover:underline">
                <h4 className="font-medium text-sm truncate">{title}</h4>
                <p className="text-xs text-muted-foreground truncate">{preview}</p>
            </Link>

            {/* Right side */}
            <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1">
                    {badges.map((badge) => (
                        <span key={badge} className={`material-symbols-outlined text-sm ${badgeConfig[badge]?.color}`}>
                            {badgeConfig[badge]?.icon}
                        </span>
                    ))}
                </div>
                <span className="text-xs text-muted-foreground">{time}</span>
            </div>

            {/* Acknowledge button */}
            {requiresAck && !acknowledged && (
                <button
                    onClick={(e) => { e.preventDefault(); onAcknowledge?.(); }}
                    className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                >
                    Acknowledge
                </button>
            )}
        </div>
    );
}

// ============================================================
// TICKET ROW CARD - For support tickets
// ============================================================
interface TicketRowCardProps {
    category: 'fees' | 'admissions' | 'transport' | 'it' | 'general';
    title: string;
    status: 'open' | 'pending' | 'closed';
    statusText: string;
    time: string;
    href: string;
}

export function TicketRowCard({ category, title, status, statusText, time, href }: TicketRowCardProps) {
    const categoryIcons: Record<string, string> = {
        fees: 'payments',
        admissions: 'how_to_reg',
        transport: 'directions_bus',
        it: 'computer',
        general: 'help',
    };

    const statusColors: Record<string, string> = {
        open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors"
        >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-muted-foreground">{categoryIcons[category]}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{title}</h4>
                <p className="text-xs text-muted-foreground">{statusText}</p>
            </div>

            {/* Status + Time */}
            <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColors[status]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground">{time}</span>
            </div>
        </Link>
    );
}

// ============================================================
// FILTER CHIPS - For chat filtering
// ============================================================
interface FilterChipsProps {
    filters: { id: string; label: string }[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
}

export function FilterChips({ filters, activeFilter, onFilterChange }: FilterChipsProps) {
    return (
        <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-full shrink-0 transition-colors ${activeFilter === filter.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}

// ============================================================
// URGENT BANNER - For emergency alerts
// ============================================================
interface UrgentBannerProps {
    icon?: string;
    title: string;
    href: string;
}

export function UrgentBanner({ icon = 'warning', title, href }: UrgentBannerProps) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4"
        >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-red-700 dark:text-red-400">{title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-500 shrink-0" />
        </Link>
    );
}
