'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { RoleNavConfig } from '@/config/navigation';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    navConfig: RoleNavConfig;
    basePath: string;
    tenantName: string;
    tenantLogo?: string | null;
    tenantSubtitle?: string;
    appVersion?: string;
}

/**
 * Slide-in mobile drawer menu.
 * Shown on mobile (<769px) when hamburger is tapped.
 * Contains full navigation, tenant identity, and EdApp branding.
 */
export function MobileDrawer({
    isOpen,
    onClose,
    navConfig,
    basePath,
    tenantName,
    tenantLogo,
    tenantSubtitle,
    appVersion = '1.0.0',
}: MobileDrawerProps) {
    const pathname = usePathname();
    const year = new Date().getFullYear();

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Close when route changes
    useEffect(() => {
        if (isOpen) onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    if (!isOpen) return null;

    const isActive = (href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="mobile-drawer-backdrop" onClick={onClose} aria-hidden="true" />

            {/* Drawer panel */}
            <div className="mobile-drawer" role="dialog" aria-label="Navigation menu">
                {/* Header: tenant identity + close */}
                <div className="mobile-drawer-header">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {tenantLogo ? (
                                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                                    <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-white text-lg">school</span>
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] truncate leading-tight">{tenantName}</p>
                                {tenantSubtitle && (
                                    <p className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate leading-tight mt-0.5">{tenantSubtitle}</p>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[hsl(var(--admin-surface-alt))] transition-colors flex-shrink-0"
                            aria-label="Close menu"
                        >
                            <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-sub))]">close</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable menu body */}
                <nav className="mobile-drawer-body scrollbar-on-hover">
                    {/* Primary nav items */}
                    <div className="flex flex-col gap-0.5 mb-4">
                        {navConfig.allItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <a
                                    key={item.id}
                                    href={basePath + item.href}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all active:scale-[0.98] ${active
                                        ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] font-semibold'
                                        : 'text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))] font-medium'
                                        }`}
                                >
                                    <span
                                        className="material-symbols-outlined text-[22px] flex-shrink-0"
                                        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="text-[14px] truncate">{item.label}</span>
                                </a>
                            );
                        })}
                    </div>

                    {/* Menu sections */}
                    {navConfig.menuSections.map((section, si) => (
                        <div key={si} className="mb-4">
                            <p className="type-badge px-3 mb-1">{section.title}</p>
                            <div className="flex flex-col gap-0.5">
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <a
                                            key={item.id}
                                            href={basePath + item.href}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all active:scale-[0.98] ${active
                                                ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] font-semibold'
                                                : 'text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))] font-medium'
                                                }`}
                                        >
                                            <span
                                                className="material-symbols-outlined text-[20px] flex-shrink-0"
                                                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="text-[13px] truncate">{item.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer: EdApp branding + Settings */}
                <div className="mobile-drawer-footer">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                school
                            </span>
                            <span className="text-[14px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">edAPP</span>
                        </div>
                        <a
                            href={basePath + '/settings'}
                            className="flex items-center gap-1.5 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))] transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            <span className="text-[13px] font-medium">Settings</span>
                        </a>
                    </div>
                    <p className="type-metadata text-center">
                        &copy; edAPP &bull; v{appVersion} &bull; {year}
                    </p>
                </div>
            </div>
        </>
    );
}
