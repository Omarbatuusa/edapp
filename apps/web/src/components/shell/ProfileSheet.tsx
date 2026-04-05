'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import {
    X, Moon, Sun, Monitor, Globe, BellOff, Smartphone,
    LogOut, HelpCircle, MessageSquare, FileText, ChevronRight, Shield, Settings
} from 'lucide-react';
import { getRoleMetadata } from '@/lib/roles';
import type { UserRoleAssignment } from '@/components/dashboard/RoleSwitcher';

interface ProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    user?: {
        uid?: string;
        displayName?: string | null;
        email?: string | null;
        photoURL?: string | null;
        first_name?: string;
    };
    tenantName: string;
    tenantSlug: string;
    currentRole?: UserRoleAssignment;
    allRoles?: UserRoleAssignment[];
    onRoleSwitch?: (role: UserRoleAssignment) => void;
}

type ThemeOption = 'light' | 'dark' | 'system';

/**
 * Facebook-style profile sheet.
 * Mobile: slides up from bottom as a sheet.
 * Desktop: fixed overlay panel from right (same as before for consistency).
 */
export function ProfileSheet({
    isOpen,
    onClose,
    user,
    tenantName,
    tenantSlug,
    currentRole,
    allRoles = [],
    onRoleSwitch,
}: ProfileSheetProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const panelRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const displayName = user?.displayName || user?.first_name || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();
    const displayEmail = user?.email || 'No email set';
    const roleMeta = currentRole ? getRoleMetadata(currentRole.role) : null;

    const { logout } = useAuth();
    const PLATFORM_ROLES = ['platform_super_admin', 'app_super_admin', 'platform_secretary', 'app_secretary', 'platform_support', 'app_support', 'brand_admin'];
    const handleSignOut = async () => {
        const isPlatform = currentRole && PLATFORM_ROLES.includes(currentRole.role);
        await logout();
        if (isPlatform) {
            window.location.href = 'https://app.edapp.co.za';
        } else {
            router.push(`/tenant/${tenantSlug}/login`);
        }
    };

    const handleThemeChange = (newTheme: ThemeOption) => {
        setTheme(newTheme);
    };

    const handleRoleSwitch = (role: UserRoleAssignment) => {
        if (onRoleSwitch) {
            onRoleSwitch(role);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet — bottom sheet on mobile, right panel on md+ */}
            <div
                ref={panelRef}
                className="
                    fixed z-50 bg-[hsl(var(--admin-surface))] overflow-hidden flex flex-col
                    /* Mobile: bottom sheet */
                    inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl shadow-2xl
                    animate-in slide-in-from-bottom duration-300
                    /* Desktop: right panel */
                    md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:top-0 md:w-96 md:max-h-full md:rounded-none
                    md:animate-in md:slide-in-from-right md:duration-300
                "
                role="dialog"
                aria-modal="true"
                aria-label="Profile menu"
            >
                {/* Handle (mobile only) */}
                <div className="flex justify-center pt-3 md:hidden">
                    <div className="w-10 h-1 rounded-full bg-[hsl(var(--admin-border))]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--admin-border)/0.5)]">
                    <h2 className="text-lg font-semibold text-[hsl(var(--admin-text-main))]">Account</h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(var(--admin-surface-alt))] transition-colors text-[hsl(var(--admin-text-sub))]"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* ── Profile Summary ── */}
                    <div className="p-4 border-b border-[hsl(var(--admin-border)/0.3)]">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center overflow-hidden border-2 border-[hsl(var(--admin-border)/0.5)] shrink-0">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-[hsl(var(--admin-primary))]">
                                        {displayInitial}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-[hsl(var(--admin-text-main))] truncate">
                                    {displayName}
                                </h3>
                                <p className="text-sm text-[hsl(var(--admin-text-muted))] truncate">
                                    {displayEmail}
                                </p>
                                {roleMeta && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[hsl(var(--admin-surface-alt))] text-xs font-medium text-[hsl(var(--admin-text-sub))]">
                                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] ${roleMeta.color}`}>
                                            <span className="material-symbols-outlined text-sm">{roleMeta.icon}</span>
                                        </span>
                                        <span>{roleMeta.shortName}</span>
                                        <span className="text-[hsl(var(--admin-text-muted))]">@ {tenantName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Switch Role Section ── */}
                    {allRoles.length > 1 && currentRole && onRoleSwitch && (
                        <div className="p-4 border-b border-[hsl(var(--admin-border)/0.3)]">
                            <h4 className="text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                                Switch Role
                            </h4>
                            <div className="space-y-1">
                                {allRoles.map((role) => {
                                    const meta = getRoleMetadata(role.role);
                                    const isActive = role.id === currentRole.id;

                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => handleRoleSwitch(role)}
                                            className={`
                                                w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors
                                                ${isActive
                                                    ? 'bg-[hsl(var(--admin-primary)/0.1)]'
                                                    : 'hover:bg-[hsl(var(--admin-surface-alt))]'
                                                }
                                            `}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${meta?.color || 'bg-slate-500'}`}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {meta?.icon || 'person'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[hsl(var(--admin-text-main))] truncate">
                                                    {meta?.displayName || role.role}
                                                </p>
                                                <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">
                                                    {role.tenant_name || tenantName}
                                                    {role.branch_name ? ` • ${role.branch_name}` : ''}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="w-6 h-6 rounded-full bg-[hsl(var(--admin-primary))] flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-white text-sm">check</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Appearance ── */}
                    <div className="p-4 border-b border-[hsl(var(--admin-border)/0.3)]">
                        <h4 className="text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">
                            Appearance
                        </h4>
                        {mounted && (
                            <div className="flex gap-2">
                                {([
                                    { value: 'light' as ThemeOption, icon: Sun, label: 'Light' },
                                    { value: 'dark' as ThemeOption, icon: Moon, label: 'Dark' },
                                    { value: 'system' as ThemeOption, icon: Monitor, label: 'System' },
                                ]).map(({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleThemeChange(value)}
                                        className={`
                                            flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all
                                            ${theme === value
                                                ? 'border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]'
                                                : 'border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))]'
                                            }
                                        `}
                                    >
                                        <Icon size={20} />
                                        <span className="text-xs font-medium">{label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Quick Links ── */}
                    <div className="p-4 border-b border-[hsl(var(--admin-border)/0.3)]">
                        <div className="space-y-1">
                            {[
                                { icon: Settings, label: 'Settings', onClick: () => router.push(`/tenant/${tenantSlug}/settings`) },
                                { icon: HelpCircle, label: 'Help & Support', onClick: () => { } },
                                { icon: MessageSquare, label: 'Send Feedback', onClick: () => { } },
                            ].map(({ icon: Icon, label, onClick }) => (
                                <button
                                    key={label}
                                    onClick={onClick}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className="text-[hsl(var(--admin-text-muted))]" />
                                        <span className="text-sm font-medium text-[hsl(var(--admin-text-main))]">{label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-[hsl(var(--admin-text-muted))]" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Sign Out ── */}
                    <div className="p-4">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <LogOut size={18} />
                            </div>
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-surface-alt)/0.3)]">
                    <div className="flex items-center justify-center gap-2 text-xs text-[hsl(var(--admin-text-muted))]">
                        <Shield size={12} />
                        <span>EdApp v1.0.0 • {tenantName}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
