'use client';

import React from 'react';

interface AppHeaderProps {
    title: string;
    tenantSlug?: string;
    logoUrl?: string | null;
    isScrolled?: boolean;
    onSearch?: () => void;
    onNotificationClick?: () => void;
    onAvatarClick?: () => void;
    onEmergency?: () => void;
    notificationsCount?: number;
    user?: any;
    scopeLabel?: string;
    onScopeClick?: () => void;
    showScopeChip?: boolean;
    onTenantNameClick?: () => void;
    onReportsClick?: () => void;
}

/**
 * Universal AppHeader — 2-line collapsing layout.
 *
 * Line 1: Logo | Tenant name + scope subtitle (within logo height) | Emergency + Bell
 * Line 2 (mobile): Reports card | Search form (visible bg+border) | Avatar
 * Collapses line 2 on scroll.
 * Desktop: single row, all inline.
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
            {/* ═══ Line 1: Logo + Title/Scope stacked + Emergency + Bell ═══ */}
            <div className="flex items-center justify-between gap-3">
                {/* Left: Logo + title & scope stacked (both within logo 40px height) */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {logoUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">school</span>
                        </div>
                    )}

                    {/* Title + scope subtitle — stacked, both fit within logo height */}
                    <div className="min-w-0 flex-1 flex flex-col justify-center h-10">
                        <button
                            type="button"
                            onClick={onTenantNameClick || onScopeClick}
                            className="text-left min-w-0 w-full group"
                            aria-label="View school details"
                            title={title}
                        >
                            <h1 className="text-[16px] sm:text-[17px] lg:text-[20px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight leading-none truncate group-hover:text-[hsl(var(--admin-primary))] transition-colors">
                                {title}
                            </h1>
                        </button>
                        {/* Scope/Branch — always under title on ALL devices */}
                        {showScopeChip && onScopeClick && (
                            <button
                                type="button"
                                onClick={onScopeClick}
                                className="flex items-center gap-0.5 mt-0.5 group/scope"
                                aria-label="Change campus"
                            >
                                <span className="material-symbols-outlined text-[12px] text-[hsl(var(--admin-text-muted))]">location_on</span>
                                <span className="text-[11px] sm:text-[12px] font-medium text-[hsl(var(--admin-text-muted))] truncate max-w-[180px] lg:max-w-[240px] group-hover/scope:text-[hsl(var(--admin-primary))] transition-colors">
                                    {scopeLabel}
                                </span>
                                <span className="material-symbols-outlined text-[11px] text-[hsl(var(--admin-text-muted))]">expand_more</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Emergency + Notifications (always) + desktop extras */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Desktop only: Search */}
                    {onSearch && (
                        <button
                            type="button"
                            onClick={onSearch}
                            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Search"
                        >
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </button>
                    )}

                    {/* Desktop only: Reports */}
                    {onReportsClick && (
                        <button
                            type="button"
                            onClick={onReportsClick}
                            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Reports"
                        >
                            <span className="material-symbols-outlined text-[20px]">fact_check</span>
                        </button>
                    )}

                    {/* Emergency — always visible */}
                    {onEmergency && (
                        <button
                            type="button"
                            onClick={onEmergency}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            aria-label="Emergency"
                        >
                            <span className="material-symbols-outlined text-[20px]">shield</span>
                        </button>
                    )}

                    {/* Notifications — always visible */}
                    {onNotificationClick && (
                        <button
                            type="button"
                            onClick={onNotificationClick}
                            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            {notificationsCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-[1.5px] border-[hsl(var(--admin-background))]">
                                    {notificationsCount > 9 ? '9+' : notificationsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Desktop only: Avatar */}
                    {onAvatarClick && (
                        <button
                            type="button"
                            onClick={onAvatarClick}
                            className="hidden lg:flex w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border-2 border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] transition-all items-center justify-center flex-shrink-0"
                            aria-label="Account"
                        >
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[12px] font-bold text-[hsl(var(--admin-primary))]">
                                    {displayInitial}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ Line 2: Reports | Search form | Avatar (mobile/tablet — collapses on scroll) ═══ */}
            <div
                className={`flex items-center gap-2 mt-2.5 lg:hidden transition-all duration-200 overflow-hidden ${
                    isScrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-[48px] opacity-100'
                }`}
            >
                {/* Left: Reports card icon */}
                {onReportsClick && (
                    <button
                        type="button"
                        onClick={onReportsClick}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border)/0.5)] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors flex-shrink-0"
                        aria-label="Reports"
                    >
                        <span className="material-symbols-outlined text-[19px]">fact_check</span>
                    </button>
                )}

                {/* Center: Search form — visible background + border */}
                {onSearch && (
                    <button
                        type="button"
                        onClick={onSearch}
                        className="flex-1 flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border)/0.6)] hover:border-[hsl(var(--admin-border))] transition-colors"
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">search</span>
                        <span className="text-[13px] text-[hsl(var(--admin-text-muted))] font-medium">Search...</span>
                    </button>
                )}

                {/* Right: Avatar */}
                {onAvatarClick && (
                    <button
                        type="button"
                        onClick={onAvatarClick}
                        className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] border-2 border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] transition-all flex items-center justify-center flex-shrink-0"
                        aria-label="Account"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[12px] font-bold text-[hsl(var(--admin-primary))]">
                                {displayInitial}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </header>
    );
}
