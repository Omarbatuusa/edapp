'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, CheckCheck } from 'lucide-react';
import {
    Notification,
    MOCK_NOTIFICATIONS,
    getNotificationIcon,
    getNotificationColor,
    formatRelativeTime,
    filterNotifications,
    countUnread
} from '@/lib/notifications';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    tenantSlug: string;
}

type TabType = 'all' | 'urgent' | 'tasks';

export function NotificationPanel({ isOpen, onClose, tenantSlug }: NotificationPanelProps) {
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Mark notification as read
    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
            onClose();
            router.push(`/tenant/${tenantSlug}${notification.actionUrl}`);
        }
    };

    // Get filtered notifications
    const filteredNotifications = filterNotifications(notifications, activeTab);
    const unreadCount = countUnread(notifications);
    const urgentCount = notifications.filter(n => n.type === 'urgent' && !n.read).length;
    const taskCount = notifications.filter(n => n.type === 'task' && !n.read).length;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Notifications"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/60 transition-colors"
                            aria-label="Close panel"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-2 px-4 py-3 border-b border-border/30">
                    {[
                        { id: 'all' as TabType, label: 'All', count: unreadCount },
                        { id: 'urgent' as TabType, label: 'Urgent', count: urgentCount },
                        { id: 'tasks' as TabType, label: 'Tasks', count: taskCount },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }
                            `}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`
                                    text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                                    ${activeTab === tab.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-primary/10 text-primary'
                                    }
                                `}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-muted-foreground">
                                    notifications_off
                                </span>
                            </div>
                            <h3 className="font-medium text-foreground mb-1">No notifications</h3>
                            <p className="text-sm text-muted-foreground">
                                {activeTab === 'all'
                                    ? "You're all caught up!"
                                    : `No ${activeTab} notifications`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {filteredNotifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`
                                        w-full flex items-start gap-3 p-4 text-left transition-colors
                                        hover:bg-secondary/30
                                        ${!notification.read ? 'bg-primary/5' : ''}
                                    `}
                                >
                                    {/* Icon */}
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                        ${getNotificationColor(notification.type)}
                                    `}>
                                        <span className="material-symbols-outlined text-white text-xl">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`text-sm truncate ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                                {formatRelativeTime(notification.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                            {notification.preview}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-secondary/30">
                    <button className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        View all notifications
                    </button>
                </div>
            </div>
        </>
    );
}
