'use client';

import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    fab?: React.ReactNode;
    /** Content rendered after sidebar on mobile (e.g. "all caught up" end marker) */
    footer?: React.ReactNode;
}

/**
 * Facebook-style responsive dashboard layout.
 * Desktop (xl+): centered main (max 680px) + 320px sidebar right.
 * Tablet/mobile: single column with consistent padding.
 */
export function DashboardLayout({ children, sidebar, fab, footer }: DashboardLayoutProps) {
    return (
        <div className="dashboard-layout-outer pb-24">
            <div className={sidebar ? 'dashboard-layout-grid' : 'dashboard-layout-single'}>
                {/* Main content */}
                <div className="min-w-0 space-y-5">
                    {children}
                </div>

                {/* Sidebar — stable position, never scrolls with main */}
                {sidebar && (
                    <aside className="mt-6 xl:mt-0 space-y-4 dashboard-sidebar">
                        {sidebar}
                    </aside>
                )}
            </div>

            {/* Footer — always last, after sidebar on mobile */}
            {footer}

            {fab}
        </div>
    );
}
