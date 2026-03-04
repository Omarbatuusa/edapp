'use client';

/**
 * @deprecated Use `AppShell` from `@/components/shell` instead.
 * This wrapper exists for backward compatibility with existing imports.
 */

import React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { getNavConfig } from '@/config/navigation';

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

/**
 * @deprecated Thin wrapper that delegates to the universal `AppShell`.
 */
export function AdminShell({ children, tenantSlug, adminRole, headerProps, appVersion = '1.0.0' }: AdminShellProps) {
    const roleForNav = adminRole === 'platform' ? 'platform_super_admin'
        : adminRole === 'secretary' ? 'platform_secretary'
            : 'admin';
    const navConfig = getNavConfig(roleForNav);

    return (
        <AppShell
            tenantSlug={tenantSlug}
            tenantName={headerProps.title}
            tenantLogo={headerProps.logoUrl}
            role={roleForNav}
            navConfig={navConfig}
            appVersion={appVersion}
            headerSubtitle={headerProps.subtitle}
        >
            {children}
        </AppShell>
    );
}

export type { AdminShellProps, AdminHeaderProps, AdminNavItem };
