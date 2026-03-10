'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';

interface AppBottomNavProps {
    items: NavItem[];
    basePath: string;
}

/**
 * Universal bottom nav for ALL roles (mobile only).
 * Reuses the `admin-bottom-nav` CSS class for iOS-premium styling.
 * Expects exactly 5 items (4 primary + Menu).
 */
export function AppBottomNav({ items, basePath }: AppBottomNavProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full);
    };

    return (
        <nav className="admin-bottom-nav">
            <div className="flex justify-around items-center max-w-[540px] mx-auto">
                {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <a
                            key={item.id}
                            href={basePath + item.href}
                            className={`flex flex-col items-center justify-center gap-[2px] min-w-[64px] py-1 transition-all active:scale-[0.92] ${active
                                ? 'text-[hsl(var(--admin-primary))]'
                                : 'text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-sub))]'
                                }`}
                        >
                            <span
                                className="material-symbols-outlined text-[24px]"
                                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}
