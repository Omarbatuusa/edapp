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
    /** Whether to show the scope chip */
    showScopeChip?: boolean;
    /** Tenant name tap handler (shows tenant details) */
    onTenantNameClick?: () => void;
    /** Reports hub handler */
    onReportsClick?: () => void;
}

/**
 * Universal AppHeader — Refined 2-row layout on mobile, single row on desktop.
 *
 * Mobile:
 *   Row 1: Logo + tenant name (1 line) + scope subtitle | Bell + Emergency
 *   Row 2: Reports icon (left) | Search pill (center) | Avatar (right)
 *
 * Desktop (>=1025px): Single row — all elements inline.
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
    onReportsClick,
}: AppHeaderProps) {
    const displayName = user?.display_name || user?.first_name || user?.displayName || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();

    return (
        <header
            className={`admin-header transition-all duration-200 ${isScrolled ? 'is-scrolled' : ''}`}
            id="app-header"
        >
            {/* ═══ Row 1: Brand + Critical Alerts ═══ */}
            <div className="flex items-center justify-between gap-2">
                {/* Left: Logo + Tenant name + scope subtitle */}
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

                    {/* Tenant name + scope subtitle */}
                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            onClick={onTenantNameClick || onScopeClick}
                            className="text-left min-w-0 w-full group"
                            aria-label="View school details"
                            title={title}
                        >
                            <h1 className="text-[18px] sm:text-[20px] lg:text-[22px] font-extrabold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight truncate min-w-0 group-hover:text-[hsl(var(--admin-primary))] transition-colors">
                                {title}
                            </h1>
                        </button>
                        {/* Scope subtitle — under tenant name, mobile + tablet */}
                        {showScopeChip && onScopeClick && (
                            <button
                                type="button"
                                onClick={onScopeClick}
                                className="flex items-center gap-0.5 mt-0.5 group/scope lg:hidden"
                                aria-label="Change campus"
                            >
                                <span className="material-symbols-outlined text-[13px] text-[hsl(var(--admin-text-muted))]">location_on</span>
                                <span className="text-[12px] font-medium text-[hsl(var(--admin-text-muted))] truncate max-w-[180px] group-hover/scope:text-[hsl(var(--admin-primary))] transition-colors">
                                    {scopeLabel}
                                </span>
                                <span className="material-symbols-outlined text-[12px] text-[hsl(var(--admin-text-muted))]">expand_more</span>
                            </button>
                        )}
                    </div>

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

                {/* Right: Desktop full icon cluster | Mobile: Bell + Emergency only */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    {/* Search — desktop only in Row 1 */}
                    {onSearch && (
                        <button
                            onClick={onSearch}
                            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-[22px]">search</span>
                        </button>
                    )}

                    {/* Reports — desktop only in Row 1 */}
                    {onReportsClick && (
                        <button
                            onClick={onReportsClick}
                            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Reports"
                        >
                            <span className="material-symbols-outlined text-[22px]">summarize</span>
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

                    {/* Notifications — always visible */}
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

                    {/* Emergency SOS — mobile/tablet only in Row 1 */}
                    {onEmergency && (
                        <button
                            onClick={onEmergency}
                            className="flex lg:hidden w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            aria-label="Emergency"
                        >
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">shield</span>
                        </button>
                    )}

                    {/* Avatar — desktop only in Row 1 */}
                    {onAvatarClick && (
                        <button
                            onClick={onAvatarClick}
                            className="hidden lg:flex w-10 h-10 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border-2 border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] transition-all items-center justify-center flex-shrink-0"
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

            {/* ═══ Row 2: Reports | Search pill | Avatar (mobile/tablet only) ═══ */}
            <div className="flex items-center gap-2 mt-2 lg:hidden">
                {/* Left: Reports icon */}
                {onReportsClick && (
                    <button
                        type="button"
                        onClick={onReportsClick}
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors flex-shrink-0"
                        aria-label="Reports"
                    >
                        <span className="material-symbols-outlined text-[20px] sm:text-[22px]">summarize</span>
                    </button>
                )}

                {/* Center: Search pill */}
                {onSearch && (
                    <button
                        type="button"
                        onClick={onSearch}
                        className="flex-1 max-w-[320px] mx-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">search</span>
                        <span className="text-[13px] text-[hsl(var(--admin-text-muted))] font-medium">Search</span>
                    </button>
                )}

                {/* Right: Avatar */}
                {onAvatarClick && (
                    <button
                        type="button"
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
        </header>
    );
}
