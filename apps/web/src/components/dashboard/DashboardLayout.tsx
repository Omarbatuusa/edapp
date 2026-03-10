'use client';

import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    fab?: React.ReactNode;
}

/**
 * Responsive 2-column dashboard layout.
 * Desktop (lg+): main content left + 340px sticky sidebar right.
 * Mobile: single column, sidebar below main.
 */
export function DashboardLayout({ children, sidebar, fab }: DashboardLayoutProps) {
    return (
        <div className="app-content-padding max-w-7xl mx-auto pb-24">
            <div className={sidebar ? 'lg:grid lg:grid-cols-[1fr_340px] lg:gap-6' : ''}>
                {/* Main content */}
                <div className="min-w-0 space-y-6">
                    {children}
                </div>

                {/* Sidebar — sticky on desktop, stacked on mobile */}
                {sidebar && (
                    <aside className="mt-6 lg:mt-0 space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto lg:hide-scrollbar">
                        {sidebar}
                    </aside>
                )}
            </div>

            {fab}
        </div>
    );
}
