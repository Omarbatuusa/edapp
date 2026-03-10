'use client';

import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    fab?: React.ReactNode;
}

/**
 * Facebook-style responsive dashboard layout.
 * Desktop (lg+): centered main (max 680px) + 320px sidebar right.
 * Mobile: single column, sidebar below main.
 */
export function DashboardLayout({ children, sidebar, fab }: DashboardLayoutProps) {
    return (
        <div className="dashboard-layout-outer pb-24">
            <div className={sidebar ? 'dashboard-layout-grid' : 'dashboard-layout-single'}>
                {/* Main content — Facebook-width center column */}
                <div className="min-w-0 space-y-5 px-4 sm:px-5 lg:px-0">
                    {children}
                </div>

                {/* Sidebar — stable position, never scrolls with main */}
                {sidebar && (
                    <aside className="mt-6 lg:mt-0 space-y-4 dashboard-sidebar">
                        {sidebar}
                    </aside>
                )}
            </div>

            {fab}
        </div>
    );
}
