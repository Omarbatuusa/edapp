'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleMetadata } from '@/lib/roles';
import type { NavItem, NavSection } from '@/config/navigation';
import type { UserRoleAssignment } from '@/components/dashboard/RoleSwitcher';

interface AppNavRailProps {
    sidebarSections?: NavSection[];
    allItems: NavItem[];
    basePath: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    tenantName: string;
    tenantLogo?: string | null;
    tenantSubtitle?: string;
    appVersion?: string;
    user?: any;
    role?: string;
    onSearch?: () => void;
    onProfileClick?: () => void;
    currentRole?: UserRoleAssignment;
    allRoles?: UserRoleAssignment[];
    onRoleSwitch?: (role: UserRoleAssignment) => void;
}

/* ── Tooltip — portal-based, shown when sidebar is in icon-only mode ── */
function RailTooltip({ children, text, show: forceShow }: { children: React.ReactNode; text: string; show: boolean }) {
    const [hovering, setHovering] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (!forceShow) return;
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ x: rect.right + 10, y: rect.top + rect.height / 2 });
            setHovering(true);
        }
    };
    const handleMouseLeave = () => setHovering(false);

    useEffect(() => {
        if (!forceShow) setHovering(false);
    }, [forceShow]);

    return (
        <>
            <div ref={triggerRef} className="w-full flex" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {children}
            </div>
            {forceShow && hovering && typeof window !== 'undefined' && createPortal(
                <div
                    className="fixed z-[100] px-2.5 py-1.5 bg-[hsl(0_0%_15%)] text-white text-[12px] font-medium rounded-lg shadow-lg pointer-events-none fade-in whitespace-nowrap"
                    style={{ left: coords.x, top: coords.y, transform: 'translateY(-50%)' }}
                >
                    {text}
                </div>,
                document.body
            )}
        </>
    );
}

/* ── Accordion submenu for items with children ── */
function SidebarAccordion({
    item, basePath, isIconOnly, isActive, isChildActive, pathname,
}: {
    item: NavItem; basePath: string; isIconOnly: boolean;
    isActive: (href: string) => boolean; isChildActive: boolean; pathname: string;
}) {
    const [open, setOpen] = useState(isChildActive);

    // Auto-open when a child route becomes active
    useEffect(() => {
        if (isChildActive) setOpen(true);
    }, [isChildActive]);

    const parentActive = isActive(item.href) && !isChildActive;

    if (isIconOnly) {
        // In collapsed mode, just show parent icon — children hidden
        const active = parentActive || isChildActive;
        return (
            <RailTooltip text={item.label} show={isIconOnly}>
                <a
                    href={basePath + item.href}
                    className={`sidebar-nav-item sidebar-nav-item--icon ${active ? 'is-active' : ''}`}
                >
                    <span
                        className="material-symbols-outlined text-[22px] flex-shrink-0"
                        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                        {item.icon}
                    </span>
                </a>
            </RailTooltip>
        );
    }

    return (
        <div>
            {/* Accordion trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`sidebar-nav-item sidebar-nav-item--full w-full ${parentActive || isChildActive
                    ? 'is-active'
                    : ''
                    }`}
            >
                <span
                    className="material-symbols-outlined text-[22px] flex-shrink-0"
                    style={parentActive || isChildActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                    {item.icon}
                </span>
                <span className="text-[13px] font-medium truncate flex-1 text-left">{item.label}</span>
                <span className={`material-symbols-outlined sidebar-accordion-chevron ${open ? 'is-open' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Children container with grid animation */}
            <div className={`sidebar-accordion-content ${open ? 'is-open' : ''}`}>
                <div>
                    <div className="ml-4 mt-0.5 border-l border-[hsl(var(--sidebar-divider)/0.1)] pl-2 flex flex-col gap-0.5">
                        {item.children!.map((child) => {
                            const active = isActive(child.href);
                            return (
                                <a
                                    key={child.id}
                                    href={basePath + child.href}
                                    className={`sidebar-nav-item sidebar-nav-item--full py-[7px] ${active ? 'is-active' : ''}`}
                                >
                                    <span
                                        className="material-symbols-outlined text-[18px] flex-shrink-0"
                                        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        {child.icon}
                                    </span>
                                    <span className="text-[12px] font-medium truncate">{child.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── User popover (floating card above footer) ── */
function UserPopover({
    user, role, tenantName, tenantSlug, basePath,
    currentRole, allRoles, onRoleSwitch, onProfileClick, onClose,
}: {
    user?: any; role?: string; tenantName: string; tenantSlug: string; basePath: string;
    currentRole?: UserRoleAssignment; allRoles?: UserRoleAssignment[];
    onRoleSwitch?: (role: UserRoleAssignment) => void;
    onProfileClick?: () => void; onClose: () => void;
}) {
    const router = useRouter();
    const { logout } = useAuth();
    const popoverRef = useRef<HTMLDivElement>(null);

    const displayName = user?.displayName || user?.first_name || 'User';
    const displayEmail = user?.email || '';
    const roleMeta = role ? getRoleMetadata(role) : null;

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const handleSignOut = async () => {
        await logout();
        const slug = basePath.split('/tenant/')[1]?.split('/')[0] || '';
        router.push(`/tenant/${slug}/login`);
    };

    return (
        <div ref={popoverRef} className="sidebar-user-popover">
            {/* User info */}
            <div className="px-3 py-3 border-b border-[hsl(var(--sidebar-divider)/0.1)]">
                <p className="text-[14px] font-semibold text-white truncate">{displayName}</p>
                {displayEmail && (
                    <p className="text-[12px] text-[hsl(var(--sidebar-text-muted))] truncate mt-0.5">{displayEmail}</p>
                )}
                {roleMeta && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[hsl(0_0%_100%/0.06)] text-[11px] font-medium text-[hsl(var(--sidebar-text))]">
                        <span className="material-symbols-outlined text-[14px]">{roleMeta.icon}</span>
                        <span>{roleMeta.shortName}</span>
                    </div>
                )}
            </div>

            {/* Role switcher */}
            {allRoles && allRoles.length > 1 && currentRole && onRoleSwitch && (
                <div className="px-2 py-2 border-b border-[hsl(var(--sidebar-divider)/0.1)]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-text-muted))] px-2 mb-1">
                        Switch Role
                    </p>
                    {allRoles.map((r) => {
                        const meta = getRoleMetadata(r.role);
                        const isActive = r.id === currentRole.id;
                        return (
                            <button
                                key={r.id}
                                onClick={() => { onRoleSwitch(r); onClose(); }}
                                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${isActive
                                    ? 'bg-[hsl(var(--admin-primary)/0.15)] text-[hsl(210_100%_70%)]'
                                    : 'text-[hsl(var(--sidebar-text))] hover:bg-[hsl(0_0%_100%/0.06)]'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {meta?.icon || 'person'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium truncate">{meta?.displayName || r.role}</p>
                                    <p className="text-[10px] text-[hsl(var(--sidebar-text-muted))] truncate">
                                        {r.tenant_name || tenantName}
                                    </p>
                                </div>
                                {isActive && (
                                    <span className="material-symbols-outlined text-[16px] text-[hsl(210_100%_70%)]">check</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Quick links */}
            <div className="px-2 py-1.5">
                <button
                    onClick={() => { onProfileClick?.(); onClose(); }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[hsl(var(--sidebar-text))] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="text-[12px] font-medium">My Profile</span>
                </button>
                <button
                    onClick={() => { router.push(basePath + '/control'); onClose(); }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[hsl(var(--sidebar-text))] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    <span className="text-[12px] font-medium">Settings</span>
                </button>
                <div className="my-1 border-t border-[hsl(var(--sidebar-divider)/0.1)]" />
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span className="text-[12px] font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
}


/**
 * Premium collapsible sidebar for EdApp.
 * Dark elegant base, grouped sections, accordion submenus, brand block, user area.
 * Collapsed = 72px icon rail. Expanded = 280px full sidebar.
 */
export function AppNavRail({
    sidebarSections,
    allItems,
    basePath,
    isCollapsed,
    onToggleCollapse,
    tenantName,
    tenantLogo,
    tenantSubtitle,
    appVersion = '1.0.0',
    user,
    role,
    onSearch,
    onProfileClick,
    currentRole,
    allRoles = [],
    onRoleSwitch,
}: AppNavRailProps) {
    const pathname = usePathname();
    const [isIconOnly, setIsIconOnly] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const year = new Date().getFullYear();

    // Build sections: prefer explicit sidebarSections, fallback to flat allItems
    const sections: NavSection[] = sidebarSections || [
        { title: '', items: allItems },
    ];

    // Detect icon-only mode: tablet always, desktop when collapsed
    useEffect(() => {
        const check = () => {
            const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
            setIsIconOnly(!isDesktop || isCollapsed);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [isCollapsed]);

    const isActive = useCallback((href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full) || false;
    }, [basePath, pathname]);

    // Check if any child of an item is active
    const hasActiveChild = useCallback((item: NavItem) => {
        if (!item.children) return false;
        return item.children.some((child) => isActive(child.href));
    }, [isActive]);

    const displayName = user?.displayName || user?.first_name || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();
    const roleMeta = role ? getRoleMetadata(role) : null;
    const tenantSlug = basePath.split('/tenant/')[1]?.split('/')[0] || '';

    return (
        <aside className={`admin-nav-rail ${isCollapsed ? 'is-collapsed' : ''}`}>
            {/* ── ZONE 1: Brand block ── */}
            <div className="sidebar-top">
                {isIconOnly ? (
                    /* Collapsed: logo + toggle */
                    <div className="flex flex-col items-center gap-2">
                        {tenantLogo ? (
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[hsl(0_0%_100%/0.08)] flex-shrink-0">
                                <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--admin-primary)/0.2)] flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[hsl(210_100%_70%)] text-lg">school</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-[hsl(var(--sidebar-text-muted))] hover:bg-[hsl(0_0%_100%/0.06)] hover:text-white transition-colors active:scale-[0.92]"
                            aria-label="Expand sidebar"
                        >
                            <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
                        </button>
                    </div>
                ) : (
                    /* Expanded: logo + tenant name + subtitle + collapse toggle */
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {tenantLogo ? (
                                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-[hsl(0_0%_100%/0.08)] flex-shrink-0 border border-[hsl(0_0%_100%/0.06)]">
                                        <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-9 h-9 rounded-xl bg-[hsl(var(--admin-primary)/0.2)] flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[hsl(210_100%_70%)] text-lg">school</span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14px] font-semibold text-white truncate leading-tight" title={tenantName}>
                                        {tenantName}
                                    </p>
                                    {tenantSubtitle && (
                                        <p className="text-[11px] text-[hsl(var(--sidebar-text-muted))] truncate leading-tight mt-0.5">
                                            {tenantSubtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[hsl(var(--sidebar-text-muted))] hover:bg-[hsl(0_0%_100%/0.06)] hover:text-white transition-colors active:scale-[0.92] flex-shrink-0"
                                aria-label="Collapse sidebar"
                            >
                                <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
                            </button>
                        </div>

                        {/* Search bar */}
                        {onSearch && (
                            <button
                                type="button"
                                onClick={onSearch}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.05)] hover:bg-[hsl(0_0%_100%/0.08)] text-[hsl(var(--sidebar-text-muted))] transition-colors text-left"
                            >
                                <span className="material-symbols-outlined text-[18px]">search</span>
                                <span className="text-[12px] font-medium truncate">Search...</span>
                                <kbd className="ml-auto text-[10px] font-mono bg-[hsl(0_0%_100%/0.06)] px-1.5 py-0.5 rounded text-[hsl(var(--sidebar-text-muted))]">
                                    /K
                                </kbd>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── ZONE 2: Scrollable nav sections ── */}
            <nav className="sidebar-menu sidebar-scroll-stable">
                {sections.map((section, si) => (
                    <div key={si} className={si > 0 ? 'mt-4' : ''}>
                        {/* Section label — only in expanded mode */}
                        {!isIconOnly && section.title && (
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--sidebar-section-label))] px-3 mb-1.5">
                                {section.title}
                            </p>
                        )}
                        {/* Divider in collapsed mode between sections */}
                        {isIconOnly && si > 0 && (
                            <div className="mx-3 mb-2 border-t border-[hsl(var(--sidebar-divider)/0.08)]" />
                        )}

                        <div className="flex flex-col gap-0.5">
                            {section.items.map((item) => {
                                const childActive = hasActiveChild(item);

                                // Accordion items (have children)
                                if (item.children && item.children.length > 0) {
                                    return (
                                        <SidebarAccordion
                                            key={item.id}
                                            item={item}
                                            basePath={basePath}
                                            isIconOnly={isIconOnly}
                                            isActive={isActive}
                                            isChildActive={childActive}
                                            pathname={pathname || ''}
                                        />
                                    );
                                }

                                // Leaf items
                                const active = isActive(item.href);
                                const linkContent = (
                                    <a
                                        key={item.id}
                                        href={basePath + item.href}
                                        className={`sidebar-nav-item ${isIconOnly ? 'sidebar-nav-item--icon' : 'sidebar-nav-item--full'} ${active ? 'is-active' : ''}`}
                                    >
                                        <span
                                            className="material-symbols-outlined text-[22px] flex-shrink-0"
                                            style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                        >
                                            {item.icon}
                                        </span>
                                        {!isIconOnly && (
                                            <span className="text-[13px] font-medium truncate">{item.label}</span>
                                        )}
                                        {!isIconOnly && item.badge != null && item.badge > 0 && (
                                            <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                    </a>
                                );

                                return (
                                    <RailTooltip key={item.id} text={item.label} show={isIconOnly}>
                                        {linkContent}
                                    </RailTooltip>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── ZONE 3: Pinned user area ── */}
            <div className="sidebar-footer relative">
                {isIconOnly ? (
                    /* Collapsed: avatar only */
                    <RailTooltip text={displayName} show={isIconOnly}>
                        <button
                            type="button"
                            onClick={() => setPopoverOpen(!popoverOpen)}
                            className="w-full flex items-center justify-center py-1"
                            aria-label="Account menu"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center border border-[hsl(0_0%_100%/0.1)]">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-[14px] font-bold text-white">{displayInitial}</span>
                                )}
                            </div>
                        </button>
                    </RailTooltip>
                ) : (
                    /* Expanded: full user row */
                    <button
                        type="button"
                        onClick={() => setPopoverOpen(!popoverOpen)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors text-left"
                        aria-label="Account menu"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-[hsl(0_0%_100%/0.1)]">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="text-[14px] font-bold text-white">{displayInitial}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-white truncate leading-tight">{displayName}</p>
                            {roleMeta && (
                                <p className="text-[11px] text-[hsl(var(--sidebar-text-muted))] truncate leading-tight mt-0.5">
                                    {roleMeta.shortName}
                                </p>
                            )}
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-[hsl(var(--sidebar-text-muted))]">
                            unfold_more
                        </span>
                    </button>
                )}

                {/* User popover */}
                {popoverOpen && (
                    <UserPopover
                        user={user}
                        role={role}
                        tenantName={tenantName}
                        tenantSlug={tenantSlug}
                        basePath={basePath}
                        currentRole={currentRole}
                        allRoles={allRoles}
                        onRoleSwitch={onRoleSwitch}
                        onProfileClick={onProfileClick}
                        onClose={() => setPopoverOpen(false)}
                    />
                )}
            </div>
        </aside>
    );
}
