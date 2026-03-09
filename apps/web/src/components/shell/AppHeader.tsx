'use client';

import React from 'react';

interface AppHeaderProps {
    /** Full tenant/school name */
    title: string;
    /** Tenant slug for routes */
    tenantSlug?: string;
    /** Tenant logo URL */
    logoUrl?: string | null;
    /** Whether the main scroll container is scrolled (collapses line 2) */
    isScrolled?: boolean;
    /** Search icon handler */
    onSearch?: () => void;
    /** Notifications bell handler */
    onNotificationClick?: () => void;
    /** Avatar / profile button handler */
    onAvatarClick?: () => void;
    /** Emergency SOS icon handler */
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
    /** Tenant name tap handler */
    onTenantNameClick?: () => void;
    /** Reports hub handler */
    onReportsClick?: () => void;
}

/**
 * Universal AppHeader — 2-line collapsing layout.
 *
 * EXPANDED (not scrolled):
 *   Line 1: Logo + Tenant name (truncate) | Emergency + Bell
 *   Line 2: Scope line (left) | Search icon (center) | Avatar (right)
 *
 * COLLAPSED (scrolled):
 *   Single line: Logo + Tenant name | Emergency + Bell
 *   Line 2 hidden on mobile/tablet.
 *
 * Desktop (≥1025px): Always single row — all elements inline.
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
            {/* ═══ Line 1: Brand identity + Critical alerts ═══ */}
            <div className="flex items-center justify-between gap-3">
                {/* Left: Logo + Tenant name */}
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

                    <button
                        type="button"
                        onClick={onTenantNameClick || onScopeClick}
                        className="text-left min-w-0 flex-1 group"
                        aria-label="View school details"
                        title={title}
                    >
                        <h1 className="text-[17px] sm:text-[19px] lg:text-[21px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight truncate group-hover:text-[hsl(var(--admin-primary))] transition-colors">
                            {title}
                        </h1>
                    </button>

                    {/* Desktop only: inline scope chip */}
                    {showScopeChip && onScopeClick && (
                        <button
                            onClick={onScopeClick}
                            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] transition-colors max-w-[220px] flex-shrink-0"
                        >
                            <span className="material-symbols-outlined text-[15px]">location_on</span>
                            <span className="text-[12px] font-medium truncate">{scopeLabel}</span>
                            <span className="material-symbols-outlined text-[13px]">expand_more</span>
                        </button>
                    )}
                </div>

                {/* Right: Emergency + Notifications (always) + desktop extras */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Desktop only: Search */}
                    {onSearch && (
                        <button
                            onClick={onSearch}
                            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-[21px]">search</span>
                        </button>
                    )}

                    {/* Desktop only: Reports */}
                    {onReportsClick && (
                        <button
                            onClick={onReportsClick}
                            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Reports"
                        >
                            <span className="material-symbols-outlined text-[21px]">description</span>
                        </button>
                    )}

                    {/* Emergency — always visible */}
                    {onEmergency && (
                        <button
                            onClick={onEmergency}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            aria-label="Emergency"
                        >
                            <span className="material-symbols-outlined text-[21px]">shield</span>
                        </button>
                    )}

                    {/* Notifications — always visible */}
                    {onNotificationClick && (
                        <button
                            onClick={onNotificationClick}
                            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined text-[21px]">notifications</span>
                            {notificationsCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[hsl(var(--admin-background))]">
                                    {notificationsCount > 9 ? '9+' : notificationsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Desktop only: Avatar */}
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

            {/* ═══ Line 2: Scope | Search | Avatar (mobile/tablet — collapses on scroll) ═══ */}
            <div
                className={`flex items-center gap-2 mt-2 lg:hidden transition-all duration-200 overflow-hidden ${
                    isScrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-[48px] opacity-100'
                }`}
            >
                {/* Left: Scope/Branch line */}
                {showScopeChip && onScopeClick && (
                    <button
                        type="button"
                        onClick={onScopeClick}
                        className="flex items-center gap-1 min-w-0 group/scope flex-shrink-0 max-w-[45%]"
                        aria-label="Change campus"
                    >
                        <span className="material-symbols-outlined text-[14px] text-[hsl(var(--admin-text-muted))]">location_on</span>
                        <span className="text-[12px] font-medium text-[hsl(var(--admin-text-muted))] truncate group-hover/scope:text-[hsl(var(--admin-primary))] transition-colors">
                            {scopeLabel}
                        </span>
                        <span className="material-symbols-outlined text-[12px] text-[hsl(var(--admin-text-muted))]">expand_more</span>
                    </button>
                )}

                {/* Center: Search launcher */}
                {onSearch && (
                    <button
                        type="button"
                        onClick={onSearch}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] transition-colors max-w-[200px] mx-auto"
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">search</span>
                        <span className="text-[12px] text-[hsl(var(--admin-text-muted))] font-medium">Search</span>
                    </button>
                )}

                {/* Right: Avatar */}
                {onAvatarClick && (
                    <button
                        type="button"
                        onClick={onAvatarClick}
                        className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border-2 border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] transition-all flex items-center justify-center flex-shrink-0 ml-auto"
                        aria-label="Account"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[13px] font-bold text-[hsl(var(--admin-primary))]">
                                {displayInitial}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </header>
    );
}
