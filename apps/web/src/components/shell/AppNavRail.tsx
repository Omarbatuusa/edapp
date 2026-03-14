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

/* ── Tooltip — shows on icon-only rail (tablet collapsed + desktop collapsed) ── */
function RailTooltip({ children, text, show: forceShow }: { children: React.ReactNode; text: string; show: boolean }) {
    const [hovering, setHovering] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (!forceShow) return;
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ x: rect.right + 12, y: rect.top + rect.height / 2 });
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
                    className="fixed z-[100] px-3 py-1.5 bg-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-surface))] text-[13px] font-semibold rounded-lg shadow-lg pointer-events-none fade-in"
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
 * 3-zone layout: sticky top (collapse + tenant) → scrollable menu → sticky footer (branding).
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

    // Detect if labels are hidden (icon-only mode) — tablet or collapsed desktop
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
            {/* ── STICKY TOP: Collapse toggle + Tenant identity ── */}
            <div className="sidebar-top">
                {/* Collapse toggle — desktop only */}
                <div className="hidden lg:flex mb-2">
                    <RailTooltip text={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} show={isIconOnly}>
                        <button
                            onClick={onToggleCollapse}
                            className="flex items-center gap-2 rounded-lg transition-all active:scale-[0.96] w-full text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))]"
                            style={{ padding: '8px', justifyContent: isIconOnly ? 'center' : 'flex-start' }}
                            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <span className="material-symbols-outlined text-[22px] flex-shrink-0">
                                {isCollapsed ? 'menu' : 'keyboard_double_arrow_left'}
                            </span>
                        </button>
                    </RailTooltip>
                </div>

                {/* Tenant identity */}
                {tenantName && (
                    <div className="flex items-center gap-2.5" style={{ justifyContent: isIconOnly ? 'center' : 'flex-start' }}>
                        {tenantLogo ? (
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                                <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-white text-lg">school</span>
                            </div>
                        )}
                        {!isIconOnly && (
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

            {/* ── SCROLLABLE MENU ── */}
            <nav className="sidebar-menu scrollbar-on-hover">
                <div className="flex flex-col gap-1 w-full">
                    {items.map((item) => {
                        const active = isActive(item.href);
                        const linkContent = (
                            <a
                                key={item.id}
                                href={basePath + item.href}
                                className={`flex items-center gap-3 rounded-xl transition-all active:scale-[0.96] group w-full ${active
                                    ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] font-semibold'
                                    : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))] font-medium'
                                    }`}
                                style={{ padding: isIconOnly ? '12px' : '12px 14px', justifyContent: isIconOnly ? 'center' : 'flex-start' }}
                            >
                                <span
                                    className="material-symbols-outlined text-[24px] flex-shrink-0 transition-transform group-active:scale-[0.95]"
                                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                >
                                    {item.icon}
                                </span>
                                {!isIconOnly && <span className="text-sm font-medium truncate">{item.label}</span>}
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

            {/* ── STICKY FOOTER: EdApp branding + Settings ── */}
            <div className="sidebar-footer">
                {/* EdApp branding */}
                <div className="flex items-center gap-2 mb-2" style={{ justifyContent: isIconOnly ? 'center' : 'flex-start' }}>
                    <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                        school
                    </span>
                    {!isIconOnly && (
                        <span className="text-[14px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">edAPP</span>
                    )}
                </div>

                {/* Settings link */}
                <RailTooltip text="Settings" show={isIconOnly}>
                    <a
                        href={basePath + '/settings'}
                        className={`flex items-center gap-3 rounded-xl transition-all active:scale-[0.96] w-full text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))] font-medium ${isActive('/settings') ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] font-semibold' : ''}`}
                        style={{ padding: isIconOnly ? '10px' : '10px 14px', justifyContent: isIconOnly ? 'center' : 'flex-start' }}
                    >
                        <span className="material-symbols-outlined text-[22px] flex-shrink-0">settings</span>
                        {!isIconOnly && <span className="text-sm font-medium">Settings</span>}
                    </a>
                </RailTooltip>

                {/* Version/copyright */}
                {!isIconOnly && (
                    <p className="type-metadata text-center mt-2 px-2">
                        &copy; edAPP &bull; v{appVersion} &bull; {year}
                    </p>
                )}
            </div>
        </aside>
    );
}
