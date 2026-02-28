'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { AdminFooter } from './AdminFooter';

interface AdminNavItem {
    icon: string;
    label: string;
    href: string;
    badge?: number;
}

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    logoUrl?: string;
    onThemeToggle?: () => void;
    onNotificationClick?: () => void;
    onAvatarClick?: () => void;
    actions?: React.ReactNode;
    isScrolled?: boolean;
}

interface AdminShellProps {
    children: React.ReactNode;
    tenantSlug: string;
    adminRole: 'platform' | 'secretary' | 'tenant';
    headerProps: Omit<AdminHeaderProps, 'isScrolled'>;
    appVersion?: string;
}

const PLATFORM_NAV: AdminNavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', href: '' },
    { icon: 'domain', label: 'Tenants', href: '/tenants' },
    { icon: 'sell', label: 'Brands', href: '/brands' },
    { icon: 'dictionary', label: 'Dictionaries', href: '/dictionaries' },
    { icon: 'settings', label: 'Settings', href: '/control' },
];

const SECRETARY_NAV: AdminNavItem[] = [
    { icon: 'inbox', label: 'Inbox', href: '/inbox' },
    { icon: 'domain', label: 'Tenants', href: '/tenants' },
    { icon: 'approval', label: 'Approvals', href: '/approvals' },
    { icon: 'settings', label: 'Settings', href: '/control' },
];

const TENANT_NAV: AdminNavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', href: '' },
    { icon: 'database', label: 'Data', href: '/school-data' },
    { icon: 'group', label: 'People', href: '/people' },
    { icon: 'settings', label: 'Settings', href: '/integrations' },
];

function getNavItems(role: string): AdminNavItem[] {
    switch (role) {
        case 'platform': return PLATFORM_NAV;
        case 'secretary': return SECRETARY_NAV;
        case 'tenant': return TENANT_NAV;
        default: return TENANT_NAV;
    }
}

/* ── Tooltip Component ── */
function RailTooltip({ children, text, enabled }: { children: React.ReactNode, text: string, enabled: boolean }) {
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (!enabled) return;
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                x: rect.right + 12,
                y: rect.top + rect.height / 2,
            });
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
                    style={{
                        left: coords.x,
                        top: coords.y,
                        transform: 'translateY(-50%)'
                    }}
                >
                    {text}
                </div>,
                document.body
            )}
        </>
    );
}

/* ── Admin Header ── */
function AdminHeader({ title, subtitle, logoUrl, onThemeToggle, onNotificationClick, actions, isScrolled = false }: AdminHeaderProps) {
    return (
        <header className={`admin-header transition-all duration-200 ${isScrolled ? 'is-scrolled' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* iOS style simplified logo / avatar */}
                    {logoUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center text-[hsl(var(--admin-primary))] flex-shrink-0">
                            <span className="material-symbols-outlined text-xl">shield</span>
                        </div>
                    )}
                    <div className="min-w-0 pt-0.5">
                        <h1 className="text-[22px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight truncate leading-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] leading-tight mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {actions}
                    {onNotificationClick && (
                        <button
                            onClick={onNotificationClick}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                    )}
                    {onThemeToggle && (
                        <button
                            onClick={onThemeToggle}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">dark_mode</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

/* ── Admin Bottom Nav (mobile only) ── */
function AdminBottomNav({ items, basePath }: { items: AdminNavItem[]; basePath: string }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full);
    };

    return (
        <nav className="admin-bottom-nav">
            <div className="flex justify-around items-center">
                {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <a
                            key={item.label}
                            href={basePath + item.href}
                            className={`flex flex-col items-center justify-center gap-[2px] min-w-[64px] py-1 transition-all active:scale-[0.92] ${active
                                ? 'text-[hsl(var(--admin-primary))]'
                                : 'text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-sub))]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[24px]" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}

/* ── Admin Nav Rail (tablet+ only) ── */
interface AdminNavRailProps {
    items: AdminNavItem[];
    basePath: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

function AdminNavRail({ items, basePath, isCollapsed, onToggleCollapse }: AdminNavRailProps) {
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
                            key={item.label}
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
                        <RailTooltip key={item.label} text={item.label} enabled={isCollapsed}>
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

/* ── Admin Shell (main export) ── */
export function AdminShell({ children, tenantSlug, adminRole, headerProps, appVersion = '1.0.0' }: AdminShellProps) {
    const basePath = `/tenant/${tenantSlug}/admin`;
    const navItems = getNavItems(adminRole);

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('admin_sidebar_collapsed');
        if (stored === 'true') setIsCollapsed(true);
    }, []);

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('admin_sidebar_collapsed', String(next));
    };

    const handleScroll = () => {
        if (mainRef.current) {
            setIsScrolled(mainRef.current.scrollTop > 10);
        }
    };

    return (
        <div className="admin-app-outer">
            <div className="admin-app-container">
                <AdminHeader {...headerProps} isScrolled={isScrolled} />
                <div className="admin-body">
                    <AdminNavRail
                        items={navItems}
                        basePath={basePath}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={toggleCollapse}
                    />
                    <main
                        className="admin-main relative flex flex-col"
                        ref={mainRef}
                        onScroll={handleScroll}
                    >
                        <div className="flex-1">
                            {children}
                        </div>
                        <AdminFooter version={appVersion} />
                    </main>
                </div>
                <AdminBottomNav items={navItems} basePath={basePath} />
            </div>
        </div>
    );
}

export { AdminHeader, AdminBottomNav, AdminNavRail };
export type { AdminShellProps, AdminHeaderProps, AdminNavItem };
