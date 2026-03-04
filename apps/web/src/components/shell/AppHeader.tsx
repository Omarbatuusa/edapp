'use client';

import React from 'react';

interface AppHeaderProps {
    title: string;
    subtitle?: string;
    logoUrl?: string;
    isScrolled?: boolean;
    onSearch?: () => void;
    onNotificationClick?: () => void;
    onAvatarClick?: () => void;
    onEmergency?: () => void;
    notificationsCount?: number;
    user?: any;
    actions?: React.ReactNode;
}

/**
 * Universal header for ALL roles.
 * Merges AdminHeader's iOS-premium styling with ShellHeader's action buttons.
 * Uses the `admin-header` CSS class for backdrop blur + scroll shadow.
 */
export function AppHeader({
    title,
    subtitle,
    logoUrl,
    isScrolled = false,
    onSearch,
    onNotificationClick,
    onAvatarClick,
    onEmergency,
    notificationsCount = 0,
    user,
    actions,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0);

    return (
        <header className={`admin-header transition-all duration-200 ${isScrolled ? 'is-scrolled' : ''}`}>
            <div className="flex items-center justify-between">
                {/* Left: Logo + Title */}
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center text-[hsl(var(--admin-primary))] flex-shrink-0">
                            <span className="material-symbols-outlined text-xl">school</span>
                        </div>
                    )}
                    <div className="min-w-0 pt-0.5">
                        <h1 className="text-[22px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight truncate leading-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] leading-tight mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    {/* Custom actions */}
                    {actions}

                    {/* Search */}
                    {onSearch && (
                        <button
                            onClick={onSearch}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-xl">search</span>
                        </button>
                    )}

                    {/* Emergency */}
                    {onEmergency && (
                        <button
                            onClick={onEmergency}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            aria-label="Emergency Hub"
                        >
                            <span className="material-symbols-outlined text-[18px]">shield</span>
                        </button>
                    )}

                    {/* Notifications */}
                    {onNotificationClick && (
                        <button
                            onClick={onNotificationClick}
                            className="relative w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined text-xl">notifications</span>
                            {notificationsCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[hsl(var(--admin-background))]">
                                    {notificationsCount > 9 ? '9+' : notificationsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Avatar */}
                    {onAvatarClick && (
                        <button
                            onClick={onAvatarClick}
                            className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border)/0.5)] hover:ring-2 hover:ring-[hsl(var(--admin-primary)/0.2)] transition-all flex items-center justify-center flex-shrink-0"
                            aria-label="Account"
                        >
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-semibold text-[hsl(var(--admin-primary))]">
                                    {displayInitial}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
