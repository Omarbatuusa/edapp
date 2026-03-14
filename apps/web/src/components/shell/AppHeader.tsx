'use client';

import React from 'react';

interface AppHeaderProps {
    title: string;
    logoUrl?: string | null;
    isScrolled?: boolean;
    onSearch?: () => void;
    onNotificationClick?: () => void;
    onAvatarClick?: () => void;
    onSafetyClick?: () => void;
    onMenuOpen?: () => void;
    notificationsCount?: number;
    user?: any;
    scopeLabel?: string;
    onScopeClick?: () => void;
    showScope?: boolean;
    showSafety?: boolean;
}

/**
 * Minimal AppHeader — icon-only left, action icons right.
 *
 * Mobile:   [≡ trigger] [Logo] ··· [Search] [Safety] [Bell] [Avatar ▾]
 * Desktop:  [Logo] ··· [Search] [Safety] [Bell] [Avatar ▾]
 */
export function AppHeader({
    logoUrl,
    onSearch,
    onNotificationClick,
    onAvatarClick,
    onSafetyClick,
    onMenuOpen,
    notificationsCount = 0,
    user,
    showSafety = false,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();

    return (
        <header className="admin-header" id="app-header">
            <div className="flex items-center justify-between gap-2">
                {/* Left: Drawer trigger (mobile) + Logo icon */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Drawer trigger — mobile only */}
                    {onMenuOpen && (
                        <button
                            type="button"
                            onClick={onMenuOpen}
                            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[hsl(var(--admin-surface-alt))] transition-colors flex-shrink-0 hide-on-rail"
                            aria-label="Open menu"
                        >
                            <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-sub))]">menu</span>
                        </button>
                    )}

                    {/* Logo icon — mobile only (sidebar has tenant identity on desktop) */}
                    <div className="hide-on-rail flex-shrink-0">
                        {logoUrl ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border)/0.3)]">
                                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-primary))] flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-base">school</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Icon cluster */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Search — visible on all sizes */}
                    {onSearch && (
                        <button
                            type="button"
                            onClick={onSearch}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-[18px]">search</span>
                        </button>
                    )}

                    {/* Safety — emergency/incident access */}
                    {showSafety && onSafetyClick && (
                        <button
                            type="button"
                            onClick={onSafetyClick}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Safety & Reports"
                        >
                            <span className="material-symbols-outlined text-[18px]">shield</span>
                        </button>
                    )}

                    {/* Notifications */}
                    {onNotificationClick && (
                        <button
                            type="button"
                            onClick={onNotificationClick}
                            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined text-[18px]">notifications</span>
                            {notificationsCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-[1.5px] border-[hsl(var(--admin-surface))]">
                                    {notificationsCount > 9 ? '9+' : notificationsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Avatar with chevron */}
                    {onAvatarClick && (
                        <button
                            type="button"
                            onClick={onAvatarClick}
                            className="relative flex-shrink-0"
                            aria-label="Account"
                        >
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border-[1.5px] border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] transition-all flex items-center justify-center">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[13px] font-bold text-[hsl(var(--admin-primary))]">
                                        {displayInitial}
                                    </span>
                                )}
                            </div>
                            {/* Small chevron badge */}
                            <div className="absolute -bottom-[2px] -right-[2px] w-[15px] h-[15px] rounded-full bg-[hsl(var(--admin-border))] border-[1.5px] border-[hsl(var(--admin-surface))] flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-[9px] text-[hsl(var(--admin-text-main))]">expand_more</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
