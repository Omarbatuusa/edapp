'use client';

import React from 'react';

interface AppHeaderProps {
    title: string;
    logoUrl?: string | null;
    isScrolled?: boolean;
    onSearch?: () => void;
    onNotificationClick?: () => void;
    onAvatarClick?: () => void;
    onEmergency?: () => void;
    notificationsCount?: number;
    user?: any;
    /** Scope chip */
    scopeLabel?: string;
    onScopeClick?: () => void;
    showScopeChip?: boolean;
}

/**
 * Facebook-style 2-row header.
 *
 * Row 1: Logo + bold tenant name (left) | icon buttons in filled circles (right)
 * Row 2: Scope chip (left) | Emergency SOS chip (right)
 */
export function AppHeader({
    title,
    logoUrl,
    isScrolled = false,
    onSearch,
    onNotificationClick,
    onAvatarClick,
    onEmergency,
    notificationsCount = 0,
    user,
    scopeLabel = 'All campuses',
    onScopeClick,
    showScopeChip = true,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0);

    return (
        <header className={`admin-header transition-all duration-200 ${isScrolled ? 'is-scrolled' : ''}`}>
            {/* Row 1: Brand + Actions */}
            <div className="flex items-center justify-between gap-2">
                {/* Left: Logo + Bold tenant name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {logoUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">school</span>
                        </div>
                    )}
                    <h1 className="text-[20px] sm:text-[24px] font-extrabold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight line-clamp-2 min-w-0">
                        {title}
                    </h1>
                </div>

                {/* Right: Facebook-style circular icon buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {onSearch && (
                        <button
                            onClick={onSearch}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-[22px]">search</span>
                        </button>
                    )}

                    {onNotificationClick && (
                        <button
                            onClick={onNotificationClick}
                            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            {notificationsCount > 0 && (
                                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[hsl(var(--admin-background))]">
                                    {notificationsCount > 9 ? '9+' : notificationsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {onAvatarClick && (
                        <button
                            onClick={onAvatarClick}
                            className="w-10 h-10 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border-2 border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] transition-all flex items-center justify-center flex-shrink-0"
                            aria-label="Account"
                        >
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-[hsl(var(--admin-primary))]">
                                    {displayInitial}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Row 2: Scope chip + Emergency chip */}
            <div className="flex items-center gap-2 mt-1.5">
                {/* Scope chip */}
                {showScopeChip && onScopeClick && (
                    <button
                        onClick={onScopeClick}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] transition-colors max-w-[200px]"
                    >
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="text-[12px] font-medium truncate">{scopeLabel}</span>
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                    </button>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Emergency SOS chip */}
                {onEmergency && (
                    <button
                        onClick={onEmergency}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">shield</span>
                        <span className="text-[12px] font-bold">SOS</span>
                    </button>
                )}
            </div>
        </header>
    );
}
