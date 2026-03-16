'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
                    <div className="ml-[22px] mt-1 mb-1 border-l-2 border-[hsl(var(--admin-border)/0.15)] pl-3 flex flex-col gap-[2px] pb-0.5">
                        {item.children!.map((child) => {
                            const active = isActive(child.href);
                            return (
                                <a
                                    key={child.id}
                                    href={basePath + child.href}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all active:scale-[0.98] ${active
                                        ? 'bg-[hsl(var(--admin-primary)/0.08)] text-[hsl(var(--admin-primary))] font-semibold'
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

/* ── Mobile account popover (action-sheet style) ── */
function MobileAccountPopover({
    user, role, tenantName, basePath, onClose, drawerClose,
    currentRole, allRoles, onRoleSwitch,
}: {
    user?: any; role?: string; tenantName: string; basePath: string;
    onClose: () => void; drawerClose: () => void;
    currentRole?: UserRoleAssignment; allRoles?: UserRoleAssignment[];
    onRoleSwitch?: (role: UserRoleAssignment) => void;
}) {
    const router = useRouter();
    const { logout } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);

    const displayName = user?.displayName || user?.first_name || 'User';
    const displayEmail = user?.email || '';
    const roleMeta = role ? getRoleMetadata(role) : null;
    const tenantSlug = basePath.split('/tenant/')[1]?.split('/')[0] || '';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const handleSignOut = async () => {
        onClose();
        drawerClose();
        await logout();
        router.push(`/tenant/${tenantSlug}/login`);
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Panel — bottom sheet with sticky header + scrollable body */}
            <div
                ref={panelRef}
                className="fixed inset-x-0 bottom-0 z-[61] bg-[hsl(var(--admin-surface))] rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300"
            >
                {/* ── Sticky header: handle + user info ── */}
                <div className="flex-shrink-0">
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))]" />
                    </div>

                    {/* User info — always visible */}
                    <div className="px-5 py-3 border-b border-[hsl(var(--admin-border)/0.3)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-[18px] font-bold text-[hsl(var(--admin-primary))]">{displayName.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[16px] font-semibold text-[hsl(var(--admin-text-main))] truncate">{displayName}</p>
                                {displayEmail && (
                                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))] truncate mt-0.5">{displayEmail}</p>
                                )}
                                {roleMeta && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[11px] font-medium text-[hsl(var(--admin-text-sub))]">
                                        <span className="material-symbols-outlined text-[14px]">{roleMeta.icon}</span>
                                        <span>{roleMeta.shortName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                    {/* Role switcher */}
                    {allRoles && allRoles.length > 1 && currentRole && onRoleSwitch && (
                        <div className="px-4 py-3 border-b border-[hsl(var(--admin-border)/0.3)]">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-2">Switch Role</p>
                            <div className="space-y-1">
                                {allRoles.map((r) => {
                                    const meta = getRoleMetadata(r.role);
                                    const isActiveRole = r.id === currentRole.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => { onRoleSwitch(r); onClose(); drawerClose(); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isActiveRole
                                                ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]'
                                                : 'text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))]'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{meta?.icon || 'person'}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium truncate">{meta?.displayName || r.role}</p>
                                                <p className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate">{r.tenant_name || tenantName}</p>
                                            </div>
                                            {isActiveRole && <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">check</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="px-4 py-3">
                        <button
                            type="button"
                            onClick={() => { router.push(basePath + '/settings'); onClose(); drawerClose(); }}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-muted))]">settings</span>
                            <span className="text-[14px] font-medium">Settings</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            <span className="text-[14px] font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Safe area bottom */}
                <div className="flex-shrink-0" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }} />
            </div>
        </>,
        document.body
    );
}


/**
 * Premium mobile drawer — follows desktop sidebar design language.
 * No X close button. Closes on backdrop tap, Escape, or route change.
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
    const [accountOpen, setAccountOpen] = useState(false);

    const sections: NavSection[] = navConfig.sidebarSections || navConfig.menuSections;
    const displayName = user?.displayName || user?.first_name || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();
    const roleMeta = role ? getRoleMetadata(role) : null;

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

    // Reset account popover when drawer closes
    useEffect(() => {
        if (!isOpen) setAccountOpen(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const isActive = (href: string) => {
        const full = basePath + href;
        if (href === '') return pathname === basePath || pathname === basePath + '/';
        return pathname?.startsWith(full);
    };

    return (
        <>
            {/* Backdrop — closes drawer on tap */}
            <div className="mobile-drawer-backdrop" onClick={onClose} aria-hidden="true" />

            {/* Drawer panel */}
            <div className="mobile-drawer" role="dialog" aria-label="Navigation menu">
                {/* Header: tenant identity (no X close button) */}
                <div className="mobile-drawer-header">
                    <div className="flex items-center gap-2.5">
                        {tenantLogo ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[hsl(var(--admin-surface-alt))] flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
                                <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary))] flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-white text-xl">school</span>
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] truncate leading-tight">{tenantName}</p>
                            {tenantSubtitle && (
                                <p className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate leading-tight mt-0.5">{tenantSubtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Search bar */}
                    {onSearch && (
                        <button
                            type="button"
                            onClick={() => { onSearch(); onClose(); }}
                            className="w-full flex items-center gap-3 h-10 px-3 mt-3 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-[20px] leading-none flex-shrink-0">search</span>
                            <span className="text-[13px] font-medium leading-none">Search...</span>
                        </button>
                    )}
                </div>

                {/* Scrollable menu body */}
                <nav className="mobile-drawer-body scrollbar-on-hover">
                    {sections.map((section, si) => (
                        <div key={si} className={si > 0 ? 'mt-5' : ''}>
                            {section.title && (
                                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--admin-text-muted))] px-3 mb-2">
                                    {section.title}
                                </p>
                            )}
                            <div className="flex flex-col gap-0.5">
                                {section.items.map((item) => {
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

                {/* Footer: user row — opens floating popover on tap */}
                <div className="border-t border-[hsl(var(--admin-border)/0.3)] p-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setAccountOpen(true)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 border border-[hsl(var(--admin-border)/0.3)]">
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
                        <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Account popover — bottom sheet */}
            {accountOpen && (
                <MobileAccountPopover
                    user={user}
                    role={role}
                    tenantName={tenantName}
                    basePath={basePath}
                    onClose={() => setAccountOpen(false)}
                    drawerClose={onClose}
                    currentRole={currentRole}
                    allRoles={allRoles}
                    onRoleSwitch={onRoleSwitch}
                />
            )}
        </>
    );
}
