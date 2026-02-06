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
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{title}</h2>
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
// THREAD ROW CARD - WhatsApp-style thread row
// ============================================================
interface ThreadRowCardProps {
    avatar: string | React.ReactNode;
    name: string;
    context?: string;
    lastMessage: string;
    time: string;
    unread?: number;
    urgent?: boolean;
    online?: boolean;
    href: string;
}

export function ThreadRowCard({ avatar, name, context, lastMessage, time, unread, urgent, online, href }: ThreadRowCardProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${unread ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-secondary/50'
                }`}
        >
            {/* Avatar with online/urgent indicator */}
            <div className="relative shrink-0">
                {typeof avatar === 'string' ? (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {avatar}
                    </div>
                ) : avatar}
                {online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                )}
                {urgent && !online && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className={`text-[15px] truncate ${unread ? 'font-semibold' : 'font-medium'}`}>{name}</span>
                    <span className={`text-xs shrink-0 ml-2 ${unread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-sm truncate ${unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {context && <span className="text-xs text-muted-foreground mr-1.5">{context} •</span>}
                        {lastMessage}
                    </p>
                    {unread && unread > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </div>
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
        ack: { icon: 'task_alt', color: 'text-amber-500' },
        doc: { icon: 'attach_file', color: 'text-blue-500' },
        event: { icon: 'event', color: 'text-emerald-500' },
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors">
            {/* Icon */}
            <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">campaign</span>
            </div>

            {/* Content */}
            <Link href={href} className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    {badges.includes('urgent') && (
                        <span className="material-symbols-outlined text-red-500 text-sm">priority_high</span>
                    )}
                    <h4 className="font-medium text-sm truncate">{title}</h4>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
            </Link>

            {/* Right side */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground">{time}</span>
                <div className="flex items-center gap-1">
                    {badges.filter(b => b !== 'urgent').map((badge) => (
                        <span key={badge} className={`material-symbols-outlined text-sm ${badgeConfig[badge]?.color}`}>
                            {badgeConfig[badge]?.icon}
                        </span>
                    ))}
                </div>
            </div>

            {/* Acknowledge button */}
            {requiresAck && !acknowledged && (
                <button
                    onClick={(e) => { e.preventDefault(); onAcknowledge?.(); }}
                    className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shrink-0"
                >
                    ACK
                </button>
            )}
            {acknowledged && (
                <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
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
    const categoryConfig: Record<string, { icon: string; color: string }> = {
        fees: { icon: 'payments', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
        admissions: { icon: 'how_to_reg', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
        transport: { icon: 'directions_bus', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
        it: { icon: 'computer', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
        general: { icon: 'help', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
    };

    const statusColors: Record<string, string> = {
        open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    const config = categoryConfig[category] || categoryConfig.general;

    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all active:scale-[0.98]"
        >
            {/* Icon */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                <span className="material-symbols-outlined">{config.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{title}</h4>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{statusText}</p>
            </div>

            {/* Time + Chevron */}
            <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">{time}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
            </div>
        </Link>
    );
}

// ============================================================
// FILTER CHIPS - For chat filtering
// ============================================================
interface FilterChipsProps {
    filters: { id: string; label: string; count?: number }[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
}

export function FilterChips({ filters, activeFilter, onFilterChange }: FilterChipsProps) {
    return (
        <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full shrink-0 transition-all active:scale-95 ${activeFilter === filter.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                >
                    {filter.label}
                    {filter.count !== undefined && filter.count > 0 && (
                        <span className={`min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center ${activeFilter === filter.id
                                ? 'bg-white/20 text-white'
                                : 'bg-primary/10 text-primary'
                            }`}>
                            {filter.count}
                        </span>
                    )}
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
            className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl mb-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0 animate-pulse">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-red-700 dark:text-red-400">{title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-500 shrink-0" />
        </Link>
    );
}

// ============================================================
// EMPTY STATE - For empty lanes
// ============================================================
interface EmptyStateProps {
    icon: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-8 px-4">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-3xl text-muted-foreground">{icon}</span>
            </div>
            <p className="font-medium text-sm">{title}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {action && (
                <Link
                    href={action.href}
                    className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mt-3"
                >
                    {action.label}
                    <ChevronRight size={16} />
                </Link>
            )}
        </div>
    );
}
