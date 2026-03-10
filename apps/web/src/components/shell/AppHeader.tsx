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
    notificationsCount?: number;
    user?: any;
    scopeLabel?: string;
    onScopeClick?: () => void;
    showScope?: boolean;
    showSafety?: boolean;
}

/**
 * Facebook-style AppHeader — clean single-line layout.
 *
 * Mobile:   [Logo] [Title + branch ▾] ··· [Safety] [Bell] [Avatar ▾]
 * Tablet:   [Logo] [Title + branch ▾] ··· [Search] [Safety] [Bell] [Avatar ▾]
 * Desktop:  [Logo] [Title + branch ▾] ··· [Search] [Safety] [Bell] [Avatar ▾]
 *
 * Always-on background + shadow.
 * Avatar has small chevron badge for role switching.
 * Safety icon opens emergency/incident chooser.
 */
export function AppHeader({
    title,
    logoUrl,
    onSearch,
    onNotificationClick,
    onAvatarClick,
    onSafetyClick,
    notificationsCount = 0,
    user,
    scopeLabel = 'All campuses',
    onScopeClick,
    showScope = false,
    showSafety = false,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();

    return (
        <header className="admin-header" id="app-header">
            <div className="flex items-center justify-between gap-2.5">
                {/* Left: Logo + Title/Branch */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Logo */}
                    {logoUrl ? (
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-white text-lg">school</span>
                        </div>
                    )}

                    {/* Title + branch subtitle — tappable with chevron if scope switching enabled */}
                    {showScope && onScopeClick ? (
                        <button
                            type="button"
                            onClick={onScopeClick}
                            aria-label="Change campus"
                            className="min-w-0 flex-1 text-left flex items-center gap-0.5"
                        >
                            <div className="min-w-0 flex flex-col justify-center">
                                <h1 className="text-[15px] sm:text-[16px] lg:text-[18px] font-semibold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight truncate">
                                    {title}
                                </h1>
                                {scopeLabel && (
                                    <span className="flex items-center gap-px mt-0">
                                        <span className="material-symbols-outlined text-[8px] text-[hsl(var(--admin-text-muted))] leading-none">location_on</span>
                                        <span className="text-[9px] text-[hsl(var(--admin-text-muted))] leading-none truncate max-w-[140px] lg:max-w-[200px]">
                                            {scopeLabel}
                                        </span>
                                        <span className="material-symbols-outlined text-[8px] text-[hsl(var(--admin-text-muted))] leading-none">expand_more</span>
                                    </span>
                                )}
                            </div>
                        </button>
                    ) : (
                        <div className="min-w-0 flex-1 text-left flex flex-col justify-center">
                            <h1 className="text-[15px] sm:text-[16px] lg:text-[18px] font-semibold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight truncate">
                                {title}
                            </h1>
                            {/* Always show branch/scope label when provided */}
                            {scopeLabel && (
                                <span className="flex items-center gap-px mt-0">
                                    <span className="material-symbols-outlined text-[8px] text-[hsl(var(--admin-text-muted))] leading-none">location_on</span>
                                    <span className="text-[9px] text-[hsl(var(--admin-text-muted))] leading-none truncate max-w-[140px] lg:max-w-[200px]">
                                        {scopeLabel}
                                    </span>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Icon cluster */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Search — tablet+ only */}
                    {onSearch && (
                        <button
                            type="button"
                            onClick={onSearch}
                            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))] transition-colors"
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

                    {/* Notifications — always */}
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

                    {/* Avatar with chevron — always */}
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
