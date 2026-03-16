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
    item, basePath, isIconOnly, isActive, isChildActive,
}: {
    item: NavItem; basePath: string; isIconOnly: boolean;
    isActive: (href: string) => boolean; isChildActive: boolean;
}) {
    const [open, setOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) setOpen(true);
    }, [isChildActive]);

    const parentActive = isActive(item.href) && !isChildActive;

    if (isIconOnly) {
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
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`sidebar-nav-item sidebar-nav-item--full w-full ${parentActive || isChildActive ? 'is-active' : ''}`}
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

            <div className={`sidebar-accordion-content ${open ? 'is-open' : ''}`}>
                <div>
                    <div className="ml-[18px] mt-1 mb-1 border-l border-[hsl(var(--sidebar-divider)/0.12)] pl-2.5 flex flex-col gap-[3px]">
                        {item.children!.map((child) => {
                            const active = isActive(child.href);
                            return (
                                <a
                                    key={child.id}
                                    href={basePath + child.href}
                                    className={`sidebar-sub-item ${active ? 'is-active' : ''}`}
                                >
                                    <span
                                        className="material-symbols-outlined text-[18px] flex-shrink-0"
                                        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        {child.icon}
                                    </span>
                                    <span className="text-[12.5px] font-medium truncate">{child.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Floating user popover — portal-rendered to avoid clipping ── */
function UserPopover({
    user, role, tenantName, basePath,
    currentRole, allRoles, onRoleSwitch, onProfileClick, onClose,
    anchorRef,
}: {
    user?: any; role?: string; tenantName: string; basePath: string;
    currentRole?: UserRoleAssignment; allRoles?: UserRoleAssignment[];
    onRoleSwitch?: (role: UserRoleAssignment) => void;
    onProfileClick?: () => void; onClose: () => void;
    anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
    const router = useRouter();
    const { logout } = useAuth();
    const popoverRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ left: 0, bottom: 0, width: 260 });

    const displayName = user?.displayName || user?.first_name || 'User';
    const displayEmail = user?.email || '';
    const roleMeta = role ? getRoleMetadata(role) : null;

    // Position relative to anchor
    useEffect(() => {
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPos({
                left: rect.left,
                bottom: window.innerHeight - rect.top + 8,
                width: Math.max(rect.width, 260),
            });
        }
    }, [anchorRef]);

    // Close on outside click or Escape
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        // Delay listener to avoid immediate close from the triggering click
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClick);
        }, 10);
        document.addEventListener('keydown', handleKey);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose, anchorRef]);

    const handleSignOut = async () => {
        onClose();
        await logout();
        const slug = basePath.split('/tenant/')[1]?.split('/')[0] || '';
        router.push(`/tenant/${slug}/login`);
    };

    if (typeof window === 'undefined') return null;

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed z-[200] rounded-2xl shadow-2xl overflow-hidden"
            style={{
                left: pos.left,
                bottom: pos.bottom,
                width: pos.width,
                background: 'hsl(225 15% 16% / 0.97)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid hsl(0 0% 100% / 0.08)',
                animation: 'sidebar-popover-in 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
        >
            {/* User info */}
            <div className="px-4 py-3 border-b border-[hsl(0_0%_100%/0.08)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-[hsl(0_0%_100%/0.1)]">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="text-[15px] font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-white truncate">{displayName}</p>
                        {displayEmail && (
                            <p className="text-[12px] text-[hsl(0_0%_55%)] truncate mt-0.5">{displayEmail}</p>
                        )}
                    </div>
                </div>
                {roleMeta && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[hsl(0_0%_100%/0.06)] text-[11px] font-medium text-[hsl(0_0%_75%)]">
                        <span className="material-symbols-outlined text-[14px]">{roleMeta.icon}</span>
                        <span>{roleMeta.shortName}</span>
                    </div>
                )}
            </div>

            {/* Role switcher */}
            {allRoles && allRoles.length > 1 && currentRole && onRoleSwitch && (
                <div className="px-2 py-2 border-b border-[hsl(0_0%_100%/0.08)]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_45%)] px-2 mb-1">
                        Switch Role
                    </p>
                    {allRoles.map((r) => {
                        const meta = getRoleMetadata(r.role);
                        const active = r.id === currentRole.id;
                        return (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => { onRoleSwitch(r); onClose(); }}
                                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${active
                                    ? 'bg-[hsl(var(--admin-primary)/0.15)] text-[hsl(210_100%_70%)]'
                                    : 'text-[hsl(0_0%_75%)] hover:bg-[hsl(0_0%_100%/0.06)]'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{meta?.icon || 'person'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium truncate">{meta?.displayName || r.role}</p>
                                    <p className="text-[10px] text-[hsl(0_0%_45%)] truncate">{r.tenant_name || tenantName}</p>
                                </div>
                                {active && <span className="material-symbols-outlined text-[16px] text-[hsl(210_100%_70%)]">check</span>}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Quick links */}
            <div className="px-2 py-1.5">
                <button
                    type="button"
                    onClick={() => { onProfileClick?.(); onClose(); }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[hsl(0_0%_75%)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="text-[12px] font-medium">My Profile</span>
                </button>
                <button
                    type="button"
                    onClick={() => { router.push(basePath + '/control'); onClose(); }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[hsl(0_0%_75%)] hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    <span className="text-[12px] font-medium">Settings</span>
                </button>
                <div className="my-1 border-t border-[hsl(0_0%_100%/0.08)]" />
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span className="text-[12px] font-medium">Sign Out</span>
                </button>
            </div>
        </div>,
        document.body
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
    const footerRef = useRef<HTMLDivElement>(null);

    const sections: NavSection[] = sidebarSections || [{ title: '', items: allItems }];

    useEffect(() => {
        const check = () => {
            const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
            setIsIconOnly(!isDesktop || isCollapsed);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [isCollapsed]);

    // Close popover on route change
    useEffect(() => {
        setPopoverOpen(false);
    }, [pathname]);

    const isActive = useCallback((href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full) || false;
    }, [basePath, pathname]);

    const hasActiveChild = useCallback((item: NavItem) => {
        if (!item.children) return false;
        return item.children.some((child) => isActive(child.href));
    }, [isActive]);

    const displayName = user?.displayName || user?.first_name || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();
    const roleMeta = role ? getRoleMetadata(role) : null;

    return (
        <aside className={`admin-nav-rail ${isCollapsed ? 'is-collapsed' : ''}`}>
            {/* ── Chevron collapse handle — attached to outer right edge ── */}
            <button
                type="button"
                onClick={onToggleCollapse}
                className="sidebar-collapse-handle hidden lg:flex"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <span className="material-symbols-outlined text-[14px]">
                    {isCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
            </button>

            {/* ── ZONE 1: Brand block ── */}
            <div className="sidebar-top">
                {isIconOnly ? (
                    <div className="flex flex-col items-center">
                        <RailTooltip text={tenantName} show={isIconOnly}>
                            <div className="flex justify-center">
                                {tenantLogo ? (
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[hsl(0_0%_100%/0.08)] flex-shrink-0">
                                        <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary)/0.2)] flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[hsl(210_100%_70%)] text-xl">school</span>
                                    </div>
                                )}
                            </div>
                        </RailTooltip>
                    </div>
                ) : (
                    <div>
                        {/* Tenant identity row */}
                        <div className="flex items-center gap-2.5 mb-4">
                            {tenantLogo ? (
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[hsl(0_0%_100%/0.08)] flex-shrink-0 border border-[hsl(0_0%_100%/0.06)]">
                                    <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary)/0.2)] flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[hsl(210_100%_70%)] text-xl">school</span>
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

                        {/* Search field — fixed alignment */}
                        {onSearch && (
                            <button
                                type="button"
                                onClick={onSearch}
                                className="w-full flex items-center gap-3 h-9 px-3 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.1)] text-[hsl(var(--sidebar-text-muted))] transition-colors text-left"
                            >
                                <span className="material-symbols-outlined text-[20px] leading-none flex-shrink-0">search</span>
                                <span className="text-[13px] font-medium leading-none flex-1">Search...</span>
                                <kbd className="text-[10px] font-mono bg-[hsl(0_0%_100%/0.08)] px-1.5 py-0.5 rounded text-[hsl(0_0%_45%)] leading-none flex-shrink-0">
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
                    <div key={si} className={si > 0 ? 'mt-5' : ''}>
                        {!isIconOnly && section.title && (
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--sidebar-section-label))] px-3 mb-2">
                                {section.title}
                            </p>
                        )}
                        {isIconOnly && si > 0 && (
                            <div className="mx-3 mb-2 border-t border-[hsl(var(--sidebar-divider)/0.08)]" />
                        )}

                        <div className="flex flex-col gap-0.5">
                            {section.items.map((item) => {
                                const childActive = hasActiveChild(item);

                                if (item.children && item.children.length > 0) {
                                    return (
                                        <SidebarAccordion
                                            key={item.id}
                                            item={item}
                                            basePath={basePath}
                                            isIconOnly={isIconOnly}
                                            isActive={isActive}
                                            isChildActive={childActive}
                                        />
                                    );
                                }

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
            <div className="sidebar-footer" ref={footerRef}>
                {isIconOnly ? (
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
            </div>

            {/* Portal-rendered user popover */}
            {popoverOpen && (
                <UserPopover
                    user={user}
                    role={role}
                    tenantName={tenantName}
                    basePath={basePath}
                    currentRole={currentRole}
                    allRoles={allRoles}
                    onRoleSwitch={onRoleSwitch}
                    onProfileClick={onProfileClick}
                    onClose={() => setPopoverOpen(false)}
                    anchorRef={footerRef}
                />
            )}
        </aside>
    );
}
