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
 * Facebook-style 2-row header for ALL roles.
 *
 * Row 1 (mobile): Logo + Tenant Name (full) + action icons (search, emergency, bell, avatar)
 * Row 2 (mobile): Subtitle/scope line (e.g. "Main Campus · Parent Dashboard")
 *
 * Desktop: Single row with more space, same structure.
 *
 * Uses `admin-header` CSS class for backdrop blur + scroll shadow.
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
            {/* Row 1: Logo + Tenant Name + Action Icons */}
            <div className="flex items-center justify-between">
                {/* Left: Logo + Tenant Name */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {logoUrl ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center text-[hsl(var(--admin-primary))] flex-shrink-0">
                            <span className="material-symbols-outlined text-lg">school</span>
                        </div>
                    )}
                    <h1 className="text-[17px] sm:text-[20px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight truncate leading-tight">
                        {title}
                    </h1>
                </div>

                {/* Right: Action Icons */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                    {actions}

                    {onSearch && (
                        <button
                            onClick={onSearch}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </button>
                    )}

                    {onEmergency && (
                        <button
                            onClick={onEmergency}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            aria-label="Emergency Hub"
                        >
                            <span className="material-symbols-outlined text-[18px]">shield</span>
                        </button>
                    )}

                    {onNotificationClick && (
                        <button
                            onClick={onNotificationClick}
                            className="relative w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            {notificationsCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[hsl(var(--admin-background))]">
                                    {notificationsCount > 9 ? '9+' : notificationsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {onAvatarClick && (
                        <button
                            onClick={onAvatarClick}
                            className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border)/0.5)] hover:ring-2 hover:ring-[hsl(var(--admin-primary)/0.2)] transition-all flex items-center justify-center flex-shrink-0 ml-0.5"
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

            {/* Row 2: Scope/Subtitle line */}
            {subtitle && (
                <p className="text-[12px] font-medium text-[hsl(var(--admin-text-muted))] leading-tight mt-1 pl-[46px] sm:pl-[46px] truncate">
                    {subtitle}
                </p>
            )}
        </header>
    );
}
