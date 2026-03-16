'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleMetadata } from '@/lib/roles';
import type { RoleNavConfig, NavItem, NavSection } from '@/config/navigation';
import type { UserRoleAssignment } from '@/components/dashboard/RoleSwitcher';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    navConfig: RoleNavConfig;
    basePath: string;
    tenantName: string;
    tenantLogo?: string | null;
    tenantSubtitle?: string;
    appVersion?: string;
    user?: any;
    role?: string;
    onSearch?: () => void;
    currentRole?: UserRoleAssignment;
    allRoles?: UserRoleAssignment[];
    onRoleSwitch?: (role: UserRoleAssignment) => void;
}

/* ── Accordion for mobile drawer ── */
function DrawerAccordion({
    item, basePath, isActive,
}: {
    item: NavItem; basePath: string;
    isActive: (href: string) => boolean;
}) {
    const childActive = item.children?.some((c) => isActive(c.href)) || false;
    const [open, setOpen] = useState(childActive);

    useEffect(() => {
        if (childActive) setOpen(true);
    }, [childActive]);

    const parentActive = isActive(item.href) && !childActive;

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 w-full transition-all active:scale-[0.98] ${parentActive || childActive
                    ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] font-semibold'
                    : 'text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))] font-medium'
                    }`}
            >
                <span
                    className="material-symbols-outlined text-[22px] flex-shrink-0"
                    style={parentActive || childActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                    {item.icon}
                </span>
                <span className="text-[14px] truncate flex-1 text-left">{item.label}</span>
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${open ? 'rotate-180' : ''} text-[hsl(var(--admin-text-muted))]`}>
                    expand_more
                </span>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="ml-5 mt-0.5 border-l-2 border-[hsl(var(--admin-border)/0.3)] pl-3 flex flex-col gap-0.5 pb-1">
                        {item.children!.map((child) => {
                            const active = isActive(child.href);
                            return (
                                <a
                                    key={child.id}
                                    href={basePath + child.href}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all active:scale-[0.98] ${active
                                        ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] font-semibold'
                                        : 'text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))] font-medium'
                                        }`}
                                >
                                    <span
                                        className="material-symbols-outlined text-[18px] flex-shrink-0"
                                        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        {child.icon}
                                    </span>
                                    <span className="text-[13px] truncate">{child.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Premium mobile drawer menu with grouped sections, accordion submenus, and user footer.
 * Shown on mobile (<769px) when trigger is tapped.
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
    user,
    role,
    onSearch,
    currentRole,
    allRoles = [],
    onRoleSwitch,
}: MobileDrawerProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const sections: NavSection[] = navConfig.sidebarSections || navConfig.menuSections;
    const displayName = user?.displayName || user?.first_name || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();
    const roleMeta = role ? getRoleMetadata(role) : null;
    const tenantSlug = basePath.split('/tenant/')[1]?.split('/')[0] || '';

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

    const handleSignOut = async () => {
        onClose();
        await logout();
        router.push(`/tenant/${tenantSlug}/login`);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="mobile-drawer-backdrop" onClick={onClose} aria-hidden="true" />

            {/* Drawer panel */}
            <div className="mobile-drawer" role="dialog" aria-label="Navigation menu">
                {/* Header: tenant identity */}
                <div className="mobile-drawer-header">
                    <div className="flex items-center gap-2.5">
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
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))] transition-colors text-[hsl(var(--admin-text-muted))]"
                            aria-label="Close menu"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Search bar */}
                    {onSearch && (
                        <button
                            type="button"
                            onClick={() => { onSearch(); onClose(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-3 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-[18px]">search</span>
                            <span className="text-[13px] font-medium">Search...</span>
                        </button>
                    )}
                </div>

                {/* Scrollable menu body */}
                <nav className="mobile-drawer-body scrollbar-on-hover">
                    {sections.map((section, si) => (
                        <div key={si} className={si > 0 ? 'mt-4' : ''}>
                            {section.title && (
                                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--admin-text-muted))] px-3 mb-1.5">
                                    {section.title}
                                </p>
                            )}
                            <div className="flex flex-col gap-0.5">
                                {section.items.map((item) => {
                                    // Accordion items
                                    if (item.children && item.children.length > 0) {
                                        return (
                                            <DrawerAccordion
                                                key={item.id}
                                                item={item}
                                                basePath={basePath}
                                                isActive={isActive}
                                            />
                                        );
                                    }

                                    // Leaf items
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
                                            {item.badge != null && item.badge > 0 && (
                                                <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                                                    {item.badge > 99 ? '99+' : item.badge}
                                                </span>
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer: user area */}
                <div className="border-t border-[hsl(var(--admin-border)/0.3)] p-3 flex-shrink-0">
                    {/* User row */}
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="text-[16px] font-bold text-[hsl(var(--admin-primary))]">{displayInitial}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))] truncate leading-tight">{displayName}</p>
                            {roleMeta && (
                                <p className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate leading-tight mt-0.5">{roleMeta.shortName}</p>
                            )}
                        </div>
                    </div>

                    {/* Role switcher (if multiple roles) */}
                    {allRoles.length > 1 && currentRole && onRoleSwitch && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {allRoles.map((r) => {
                                const meta = getRoleMetadata(r.role);
                                const isActiveRole = r.id === currentRole.id;
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => { onRoleSwitch(r); onClose(); }}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${isActiveRole
                                            ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]'
                                            : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-border))]'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">{meta?.icon || 'person'}</span>
                                        {meta?.shortName || r.role}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Sign out */}
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-[13px]"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}
