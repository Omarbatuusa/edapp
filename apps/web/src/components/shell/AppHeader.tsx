'use client';

import React from 'react';

interface AppHeaderProps {
    /** Full tenant/school name */
    title: string;
    /** Tenant slug for routes */
    tenantSlug?: string;
    /** Tenant logo URL */
    logoUrl?: string | null;
    /** Whether the main scroll container is scrolled (adds shadow) */
    isScrolled?: boolean;
    /** Search icon handler */
    onSearch?: () => void;
    /** Notifications bell handler */
    onNotificationClick?: () => void;
    /** Avatar / profile button handler */
    onAvatarClick?: () => void;
    /** Emergency SOS chip handler */
    onEmergency?: () => void;
    /** Unread notification count */
    notificationsCount?: number;
    /** Current user object */
    user?: any;
    /** Scope chip label (e.g. "Midrand Branch", "All campuses") */
    scopeLabel?: string;
    /** Scope chip tap handler (opens ScopeSelectorSheet) */
    onScopeClick?: () => void;
    /** Whether to show the scope chip in row 2 */
    showScopeChip?: boolean;
    /** Tenant name tap handler (shows tenant details) */
    onTenantNameClick?: () => void;
}

/**
 * Universal AppHeader — Facebook-style 2-row layout on mobile,
 * collapses to single row on desktop. Uses Admin iOS-premium design tokens.
 *
 * Row 1: Logo + tenant name (left) | icon cluster: Search, Bell, Avatar (right)
 * Row 2: Scope chip (left) | Emergency SOS chip (right)
 *
 * Desktop (≥1025px): Single row — all elements inline.
 */
export function AppHeader({
    title,
    tenantSlug,
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
    onTenantNameClick,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();

    return (
        <header
            className={`admin-header transition-all duration-200 ${isScrolled ? 'is-scrolled' : ''}`}
            id="app-header"
        >
            {/* ═══ Row 1: Brand + Icon Cluster ═══ */}
            <div className="flex items-center justify-between gap-2">
                {/* Left: Logo + Tenant name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Tenant Logo */}
                    {logoUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">school</span>
                        </div>
                    )}

                    {/* Tenant name — tappable, 1–2 lines max */}
                    <button
                        type="button"
                        onClick={onTenantNameClick || onScopeClick}
                        className="text-left min-w-0 flex-1 group"
                        aria-label="View school details"
                    >
                        <h1 className="text-[18px] sm:text-[20px] lg:text-[22px] font-extrabold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight line-clamp-2 min-w-0 group-hover:text-[hsl(var(--admin-primary))] transition-colors">
                            {title}
                        </h1>
                    </button>

                    {/* Desktop only: inline scope chip */}
                    {showScopeChip && onScopeClick && (
                        <button
                            onClick={onScopeClick}
                            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] transition-colors max-w-[240px] flex-shrink-0"
                        >
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            <span className="text-[12px] font-medium truncate">{scopeLabel}</span>
                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                        </button>
                    )}
                </div>

                {/* Right: Icon cluster — Search, Emergency (desktop), Bell, Avatar */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    {/* Search */}
                    {onSearch && (
                        <button
                            onClick={onSearch}
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">search</span>
                        </button>
                    )}

                    {/* Emergency — desktop inline icon */}
                    {onEmergency && (
                        <button
                            onClick={onEmergency}
                            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            aria-label="Emergency"
                        >
                            <span className="material-symbols-outlined text-[22px]">shield</span>
                        </button>
                    )}

                    {/* Notifications */}
                    {onNotificationClick && (
                        <button
                            onClick={onNotificationClick}
                            className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">notifications</span>
                            {notificationsCount > 0 && (
                                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[hsl(var(--admin-background))]">
                                    {notificationsCount > 9 ? '9+' : notificationsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Avatar */}
                    {onAvatarClick && (
                        <button
                            onClick={onAvatarClick}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border-2 border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] transition-all flex items-center justify-center flex-shrink-0"
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

            {/* ═══ Row 2: Scope chip + Emergency chip (mobile/tablet only) ═══ */}
            <div className="flex items-center gap-2 mt-1.5 lg:hidden">
                {/* Scope chip */}
                {showScopeChip && onScopeClick && (
                    <button
                        onClick={onScopeClick}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] transition-colors max-w-[220px]"
                    >
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="text-[12px] font-medium truncate">{scopeLabel}</span>
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                    </button>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Emergency SOS chip — mobile/tablet */}
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
