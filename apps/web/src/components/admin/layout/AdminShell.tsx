'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

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
}

interface AdminShellProps {
    children: React.ReactNode;
    tenantSlug: string;
    adminRole: 'platform' | 'secretary' | 'tenant';
    headerProps: AdminHeaderProps;
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

/* ── Admin Header ── */
function AdminHeader({ title, subtitle, logoUrl, onThemeToggle, onNotificationClick, actions }: AdminHeaderProps) {
    return (
        <header className="admin-header">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]">
                            <span className="material-symbols-outlined text-xl">shield</span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold text-[hsl(var(--admin-text-main))] truncate leading-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-[10px] font-medium text-[hsl(var(--admin-text-sub))] uppercase tracking-wider">{subtitle}</p>
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
                            className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-colors ${active
                                    ? 'text-[hsl(var(--primary))]'
                                    : 'text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-sub))]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[22px]" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}

/* ── Admin Nav Rail (tablet+ only) ── */
function AdminNavRail({ items, basePath }: { items: AdminNavItem[]; basePath: string }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full);
    };

    return (
        <aside className="admin-nav-rail">
            {items.map((item) => {
                const active = isActive(item.href);
                return (
                    <a
                        key={item.label}
                        href={basePath + item.href}
                        className={`flex items-center gap-3 rounded-xl transition-all group ${active
                                ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                                : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface))] hover:text-[hsl(var(--admin-text-main))]'
                            }`}
                        /* Tablet: icon-only centered; Desktop: icon + label */
                        style={{ padding: '10px' }}
                    >
                        <span
                            className="material-symbols-outlined text-[22px] flex-shrink-0 mx-auto lg:mx-0"
                            style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                            {item.icon}
                        </span>
                        {/* Label only on desktop */}
                        <span className="hidden lg:inline text-sm font-medium truncate">{item.label}</span>
                    </a>
                );
            })}
        </aside>
    );
}

/* ── Admin Shell (main export) ── */
export function AdminShell({ children, tenantSlug, adminRole, headerProps }: AdminShellProps) {
    const basePath = `/tenant/${tenantSlug}/admin`;
    const navItems = getNavItems(adminRole);

    return (
        <div className="admin-app-outer">
            <div className="admin-app-container">
                <AdminHeader {...headerProps} />
                <div className="admin-body">
                    <AdminNavRail items={navItems} basePath={basePath} />
                    <main className="admin-main">
                        {children}
                    </main>
                </div>
                <AdminBottomNav items={navItems} basePath={basePath} />
            </div>
        </div>
    );
}

export { AdminHeader, AdminBottomNav, AdminNavRail };
export type { AdminShellProps, AdminHeaderProps, AdminNavItem };
