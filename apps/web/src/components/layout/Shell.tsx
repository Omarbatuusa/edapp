'use client';

/**
 * @deprecated Use `AppShell` from `@/components/shell` instead.
 * This wrapper exists for backward compatibility with existing imports.
 */

import React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { getNavConfig } from '@/config/navigation';

interface ShellProps {
    children: React.ReactNode;
    tenantName: string;
    tenantSlug?: string;
    tenantLogo?: string;
    user?: any;
    role?: string;
}

/**
 * @deprecated Thin wrapper that delegates to the universal `AppShell`.
 */
export function Shell({ children, tenantName, tenantSlug, tenantLogo, user, role = 'parent' }: ShellProps) {
    const slug = tenantSlug || tenantName.toLowerCase();
    const navConfig = getNavConfig(role);

    const subtitles: Record<string, string> = {
        admin: 'School Admin',
        staff: 'Staff',
        learner: 'Learner',
        parent: 'Parent',
    };

    return (
        <AppShell
            tenantSlug={slug}
            tenantName={tenantName}
            tenantLogo={tenantLogo}
            user={user}
            role={role}
            navConfig={navConfig}
        >
            {children}
        </AppShell>
    );
}
