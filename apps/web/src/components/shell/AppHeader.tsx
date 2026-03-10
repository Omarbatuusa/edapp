'use client';

import React from 'react';

interface AppHeaderProps {
    title: string;
    logoUrl?: string | null;
    isScrolled?: boolean;
    onSearch?: () => void;
    onNotificationClick?: () => void;
    onAvatarClick?: () => void;
    notificationsCount?: number;
    user?: any;
    scopeLabel?: string;
    onScopeClick?: () => void;
    showScope?: boolean;
}

/**
 * Facebook-style AppHeader — clean single-line layout.
 *
 * Mobile:   [Logo] [Title + scope] ··· [Bell] [Avatar ▾]
 * Tablet:   [Logo] [Title + scope] ··· [Search] [Bell] [Avatar ▾]
 * Desktop:  [Logo] [Title + scope] ··· [Search] [Bell] [Avatar ▾]
 *
 * Always-on background + shadow (no scroll-dependent change).
 * Avatar has Facebook-style chevron badge for role switching.
 */
export function AppHeader({
    title,
    logoUrl,
    onSearch,
    onNotificationClick,
    onAvatarClick,
    notificationsCount = 0,
    user,
    scopeLabel = 'All campuses',
    onScopeClick,
    showScope = false,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();

    // Title area: tappable if scope is enabled (opens scope selector)
    const TitleWrapper = showScope && onScopeClick ? 'button' : 'div';
    const titleProps = showScope && onScopeClick
        ? { type: 'button' as const, onClick: onScopeClick, 'aria-label': 'Change campus' }
        : {};

    return (
        <header className="admin-header" id="app-header">
            <div className="flex items-center justify-between gap-2.5">
                {/* Left: Logo + Title/Scope */}
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

                    {/* Title + scope subtitle */}
                    <TitleWrapper
                        {...titleProps}
                        className="min-w-0 flex-1 text-left flex flex-col justify-center h-9"
                    >
                        <h1 className="text-[15px] sm:text-[16px] lg:text-[18px] font-semibold text-[hsl(var(--admin-text-main))] tracking-tight leading-none truncate">
                            {title}
                        </h1>
                        {showScope && scopeLabel && (
                            <span className="text-[10px] text-[hsl(var(--admin-text-muted))] leading-tight truncate mt-px max-w-[200px] lg:max-w-[260px]">
                                {scopeLabel}
                            </span>
                        )}
                    </TitleWrapper>
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

                    {/* Avatar with Facebook-style chevron — always */}
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
                            {/* Chevron badge */}
                            <div className="absolute -bottom-[1px] -right-[1px] w-[14px] h-[14px] rounded-full bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-surface))] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[10px] text-[hsl(var(--admin-text-sub))]">expand_more</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
