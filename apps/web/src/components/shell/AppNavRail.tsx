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
}

/* ── Tooltip for collapsed rail ── */
function RailTooltip({ children, text, enabled }: { children: React.ReactNode; text: string; enabled: boolean }) {
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (!enabled) return;
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ x: rect.right + 12, y: rect.top + rect.height / 2 });
            setShow(true);
        }
    };

    const handleMouseLeave = () => setShow(false);

    useEffect(() => {
        if (!enabled) setShow(false);
    }, [enabled]);

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
            {enabled && show && typeof window !== 'undefined' && createPortal(
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
 * Reuses the `admin-nav-rail` CSS class for iOS-premium styling.
 */
export function AppNavRail({ items, basePath, isCollapsed, onToggleCollapse }: AppNavRailProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full);
    };

    return (
        <aside className={`admin-nav-rail flex flex-col justify-between ${isCollapsed ? 'is-collapsed' : ''}`}>
            <div className="flex flex-col gap-1 w-full">
                {items.map((item) => {
                    const active = isActive(item.href);
                    const linkContent = (
                        <a
                            key={item.id}
                            href={basePath + item.href}
                            className={`flex items-center gap-3 rounded-xl transition-all active:scale-[0.96] group w-full ${active
                                ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] font-semibold'
                                : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface))] hover:text-[hsl(var(--admin-text-main))] font-medium'
                                }`}
                            style={{ padding: isCollapsed ? '12px' : '12px 14px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                        >
                            <span
                                className="material-symbols-outlined text-[24px] flex-shrink-0 mx-auto lg:mx-0 transition-transform group-active:scale-[0.95]"
                                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="hidden lg:inline text-sm font-medium truncate">{item.label}</span>}
                        </a>
                    );

                    return (
                        <RailTooltip key={item.id} text={item.label} enabled={isCollapsed}>
                            {linkContent}
                        </RailTooltip>
                    );
                })}
            </div>

            {/* Collapse Toggle */}
            <div className="hidden lg:flex w-full mt-auto pt-4 border-t border-[hsl(var(--admin-border)/0.5)]">
                <RailTooltip text="Expand" enabled={isCollapsed}>
                    <button
                        onClick={onToggleCollapse}
                        className="flex items-center gap-3 rounded-xl transition-all active:scale-[0.96] w-full text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface))] hover:text-[hsl(var(--admin-text-main))] font-medium group"
                        style={{ padding: isCollapsed ? '12px' : '12px 14px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        <span className="material-symbols-outlined text-[24px] flex-shrink-0 mx-auto lg:mx-0 transition-transform group-active:scale-[0.95]">
                            {isCollapsed ? 'dock_to_right' : 'keyboard_double_arrow_left'}
                        </span>
                        {!isCollapsed && <span className="hidden lg:inline text-sm font-medium truncate">Collapse sidebar</span>}
                    </button>
                </RailTooltip>
            </div>
        </aside>
    );
}
