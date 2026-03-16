'use client';

import React from 'react';

interface AppHeaderProps {
    title?: string;
    subtitle?: string;
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
    onSwitchSchool?: () => void;
}

/**
 * AppHeader — utility bar with mobile tenant identity.
 *
 * Mobile:   [≡ trigger] [Logo + Name] ··· [Search] [Safety] [Bell] [Avatar ▾]
 * Desktop:  (empty left) ··· [Search] [Safety] [Bell] [Avatar ▾]
 */
export function AppHeader({
    title,
    logoUrl,
    onSearch,
    onNotificationClick,
    onAvatarClick,
    onSafetyClick,
    onMenuOpen,
    notificationsCount = 0,
    user,
    showSafety = false,
    onSwitchSchool,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();

    return (
        <header className="admin-header" id="app-header">
            <div className="flex items-center justify-between gap-2">
                {/* Left: mobile drawer trigger + tenant identity (mobile only) */}
                <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
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
                    {/* Tenant logo icon only — mobile, hidden when sidebar is visible */}
                    <div className="lg:hidden flex-shrink-0">
                        {logoUrl ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border)/0.3)]">
                                <img src={logoUrl} alt={title || ''} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-primary)/0.12)] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] text-[18px]">school</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: utility icon cluster */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Switch School */}
                    {onSwitchSchool && (
                        <button
                            type="button"
                            onClick={onSwitchSchool}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Switch school"
                        >
                            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                        </button>
                    )}

                    {/* Search */}
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

                    {/* Safety */}
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

                    {/* Avatar */}
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
