'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';

interface AppNavRailProps {
    items: NavItem[];
    basePath: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    tenantName?: string;
    tenantLogo?: string | null;
    tenantSubtitle?: string;
    appVersion?: string;
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
            <div
                ref={triggerRef}
                className="w-full flex"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {forceShow && hovering && typeof window !== 'undefined' && createPortal(
                <div
                    className="fixed z-[100] px-2.5 py-1 bg-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-surface))] text-[12px] font-semibold rounded-md shadow-lg pointer-events-none fade-in whitespace-nowrap"
                    style={{ left: coords.x, top: coords.y, transform: 'translateY(-50%)' }}
                >
                    {text}
                </div>,
                document.body
            )}
        </>
    );
}

/**
 * Universal desktop nav rail for ALL roles.
 * 3-zone layout: sticky header (tenant + collapse) → scrollable nav → sticky micro footer.
 *
 * Collapsed = 60px icon rail. Expanded = 240px full menu.
 */
export function AppNavRail({
    items,
    basePath,
    isCollapsed,
    onToggleCollapse,
    tenantName,
    tenantLogo,
    tenantSubtitle,
    appVersion = '1.0.0',
}: AppNavRailProps) {
    const pathname = usePathname();
    const [isIconOnly, setIsIconOnly] = useState(false);
    const year = new Date().getFullYear();

    // Detect icon-only mode: tablet (769–1024) always, desktop when collapsed
    useEffect(() => {
        const check = () => {
            const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
            setIsIconOnly(!isDesktop || isCollapsed);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [isCollapsed]);

    const isActive = (href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full);
    };

    return (
        <aside className={`admin-nav-rail ${isCollapsed ? 'is-collapsed' : ''}`}>
            {/* ── ZONE 1: Sticky top — tenant identity + collapse control ── */}
            <div className="sidebar-top">
                {isIconOnly ? (
                    /* Collapsed: centered toggle icon only */
                    <div className="flex items-center justify-center">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))] transition-colors active:scale-[0.92]"
                            aria-label="Expand sidebar"
                        >
                            <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
                        </button>
                    </div>
                ) : (
                    /* Expanded: toggle icon + tenant name/subtitle */
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))] transition-colors active:scale-[0.92] flex-shrink-0"
                            aria-label="Collapse sidebar"
                        >
                            <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
                        </button>
                        {tenantName && (
                            <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))] truncate leading-tight">{tenantName}</p>
                                {tenantSubtitle && (
                                    <p className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate leading-tight mt-0.5">{tenantSubtitle}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── ZONE 2: Scrollable nav menu ── */}
            <nav className="sidebar-menu sidebar-scroll-stable">
                <div className="flex flex-col gap-0.5 w-full">
                    {items.map((item) => {
                        const active = isActive(item.href);
                        const linkContent = (
                            <a
                                key={item.id}
                                href={basePath + item.href}
                                className={`sidebar-nav-item group ${active
                                    ? 'bg-[hsl(var(--admin-primary)/0.08)] text-[hsl(var(--admin-primary))] font-semibold'
                                    : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))] font-medium'
                                    } ${isIconOnly ? 'sidebar-nav-item--icon' : 'sidebar-nav-item--full'}`}
                            >
                                <span
                                    className="material-symbols-outlined text-[22px] flex-shrink-0"
                                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                >
                                    {item.icon}
                                </span>
                                {!isIconOnly && <span className="text-[13px] font-medium truncate">{item.label}</span>}
                            </a>
                        );

                        return (
                            <RailTooltip key={item.id} text={item.label} show={isIconOnly}>
                                {linkContent}
                            </RailTooltip>
                        );
                    })}
                </div>
            </nav>

            {/* ── ZONE 3: Sticky micro footer ── */}
            <div className="sidebar-footer">
                {!isIconOnly ? (
                    <p className="text-[9px] font-medium text-[hsl(var(--admin-text-muted)/0.4)] tracking-wide text-center select-none">
                        &copy; edAPP &middot; v{appVersion} &middot; {year}
                    </p>
                ) : (
                    <div className="h-px" />
                )}
            </div>
        </aside>
    );
}
