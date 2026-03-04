'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getNavConfig } from '@/config/navigation';

interface MenuContentProps {
    role: string;
}

/**
 * Universal Menu page content. Reads `menuSections` from the role's nav config
 * and renders iOS-style grouped lists.
 */
export function MenuContent({ role }: MenuContentProps) {
    const params = useParams();
    const slug = params.slug as string;
    const navConfig = getNavConfig(role);
    const basePath = navConfig.getBasePath(slug);

    return (
        <div className="app-content-padding space-y-6 max-w-lg mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-[28px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">Menu</h1>
            </div>

            {/* Dynamic nav overflow sections from config */}
            {navConfig.menuSections.map((section) => (
                <div key={section.title}>
                    <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-2 px-1">
                        {section.title}
                    </h3>
                    <div className="ios-list-container">
                        {section.items.map((item) => (
                            <Link
                                key={item.id}
                                href={basePath + item.href}
                                className="ios-list-item"
                            >
                                <span className="material-symbols-outlined text-xl text-[hsl(var(--admin-text-muted))] mr-3">
                                    {item.icon}
                                </span>
                                <span className="flex-1 text-sm font-medium text-[hsl(var(--admin-text-main))]">
                                    {item.label}
                                </span>
                                <span className="material-symbols-outlined text-lg text-[hsl(var(--admin-text-muted))]">
                                    chevron_right
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

            {/* Account section (always shown) */}
            <div>
                <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-2 px-1">
                    Account
                </h3>
                <div className="ios-list-container">
                    <Link href={`/tenant/${slug}/settings/profile`} className="ios-list-item">
                        <span className="material-symbols-outlined text-xl text-[hsl(var(--admin-text-muted))] mr-3">account_circle</span>
                        <span className="flex-1 text-sm font-medium text-[hsl(var(--admin-text-main))]">My Profile</span>
                        <span className="material-symbols-outlined text-lg text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                    </Link>
                    <Link href={`/tenant/${slug}/settings/notifications`} className="ios-list-item">
                        <span className="material-symbols-outlined text-xl text-[hsl(var(--admin-text-muted))] mr-3">notifications</span>
                        <span className="flex-1 text-sm font-medium text-[hsl(var(--admin-text-main))]">Notifications</span>
                        <span className="material-symbols-outlined text-lg text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                    </Link>
                    <Link href={`/tenant/${slug}/settings/appearance`} className="ios-list-item">
                        <span className="material-symbols-outlined text-xl text-[hsl(var(--admin-text-muted))] mr-3">dark_mode</span>
                        <span className="flex-1 text-sm font-medium text-[hsl(var(--admin-text-main))]">Appearance</span>
                        <span className="material-symbols-outlined text-lg text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                    </Link>
                </div>
            </div>

            {/* Help & Sign Out (always shown) */}
            <div>
                <h3 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-2 px-1">
                    Support
                </h3>
                <div className="ios-list-container">
                    <Link href={`/tenant/${slug}/help`} className="ios-list-item">
                        <span className="material-symbols-outlined text-xl text-[hsl(var(--admin-text-muted))] mr-3">help</span>
                        <span className="flex-1 text-sm font-medium text-[hsl(var(--admin-text-main))]">Help & Support</span>
                        <span className="material-symbols-outlined text-lg text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                    </Link>
                    <button
                        onClick={() => {
                            localStorage.removeItem('session_token');
                            localStorage.removeItem('user_id');
                            localStorage.removeItem('user_role');
                            window.location.href = `/tenant/${slug}/login`;
                        }}
                        className="ios-list-item w-full text-left"
                    >
                        <span className="material-symbols-outlined text-xl text-red-500 mr-3">logout</span>
                        <span className="flex-1 text-sm font-medium text-red-500">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Spacer for bottom nav */}
            <div className="h-4" />
        </div>
    );
}
