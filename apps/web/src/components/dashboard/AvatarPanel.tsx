'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    X,
    Moon,
    Sun,
    Monitor,
    Globe,
    BellOff,
    Smartphone,
    LogOut,
    HelpCircle,
    MessageSquare,
    FileText,
    ChevronRight,
    Shield
} from 'lucide-react';
import { RoleSwitcher, type UserRoleAssignment } from './RoleSwitcher';
import { getRoleMetadata } from '@/lib/roles';

interface AvatarPanelProps {
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

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'af', label: 'Afrikaans' },
    { code: 'zu', label: 'isiZulu' },
    { code: 'xh', label: 'isiXhosa' },
];

export function AvatarPanel({
    isOpen,
    onClose,
    user,
    tenantName,
    tenantSlug,
    currentRole,
    allRoles = [],
    onRoleSwitch
}: AvatarPanelProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const panelRef = useRef<HTMLDivElement>(null);
    const [language, setLanguage] = useState('en');
    const [quietHours, setQuietHours] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch with theme
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on escape key
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

    // User display values
    const displayName = user?.displayName || user?.first_name || 'User';
    const displayInitial = displayName.charAt(0).toUpperCase();
    const displayEmail = user?.email || 'No email set';

    // Current role info
    const roleMeta = currentRole ? getRoleMetadata(currentRole.role) : null;

    // Sign out handler
    const handleSignOut = async () => {
        // Clear all session data
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        localStorage.removeItem(`edapp_role_${tenantSlug}`);

        // Redirect to login
        router.push(`/tenant/${tenantSlug}/login`);
    };

    // Theme toggle handler
    const handleThemeChange = (newTheme: ThemeOption) => {
        setTheme(newTheme);
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

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed top-0 right-0 h-full w-full max-w-sm bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Account menu"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h2 className="text-lg font-semibold">Account</h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/60 transition-colors"
                        aria-label="Close panel"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Profile Section */}
                    <div className="p-4 border-b border-border/30">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center overflow-hidden border-2 border-border/50 shrink-0">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                                        {displayInitial}
                                    </span>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-foreground truncate">
                                    {displayName}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {displayEmail}
                                </p>
                                {/* Role Badge */}
                                {roleMeta && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/60 text-xs font-medium">
                                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] ${roleMeta.color}`}>
                                            <span className="material-symbols-outlined text-sm">
                                                {roleMeta.icon}
                                            </span>
                                        </span>
                                        <span>{roleMeta.shortName}</span>
                                        <span className="text-muted-foreground">@ {tenantName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Role Switcher Section */}
                    {allRoles.length > 1 && currentRole && onRoleSwitch && (
                        <div className="p-4 border-b border-border/30">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Switch Role
                            </h4>
                            <RoleSwitcher
                                currentRole={currentRole}
                                allRoles={allRoles}
                                onSwitch={onRoleSwitch}
                                compact={false}
                            />
                        </div>
                    )}

                    {/* Preferences Section */}
                    <div className="p-4 border-b border-border/30">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Preferences
                        </h4>

                        {/* Theme Toggle */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Appearance
                            </label>
                            {mounted && (
                                <div className="flex gap-2">
                                    {[
                                        { value: 'light' as ThemeOption, icon: Sun, label: 'Light' },
                                        { value: 'dark' as ThemeOption, icon: Moon, label: 'Dark' },
                                        { value: 'system' as ThemeOption, icon: Monitor, label: 'System' },
                                    ].map(({ value, icon: Icon, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => handleThemeChange(value)}
                                            className={`
                                                flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all
                                                ${theme === value
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border/50 hover:border-border text-muted-foreground hover:text-foreground'
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

                        {/* Language Selector */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                <Globe size={14} className="inline mr-2" />
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quiet Hours Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BellOff size={16} className="text-muted-foreground" />
                                <div>
                                    <span className="text-sm font-medium">Quiet Hours</span>
                                    <p className="text-xs text-muted-foreground">Pause notifications</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setQuietHours(!quietHours)}
                                className={`
                                    relative w-11 h-6 rounded-full transition-colors
                                    ${quietHours ? 'bg-primary' : 'bg-secondary'}
                                `}
                                role="switch"
                                aria-checked={quietHours}
                            >
                                <span
                                    className={`
                                        absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                                        ${quietHours ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="p-4 border-b border-border/30">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Security
                        </h4>

                        {/* Active Sessions */}
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-secondary/80 flex items-center justify-center">
                                    <Smartphone size={18} className="text-muted-foreground" />
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-medium block">Active Sessions</span>
                                    <span className="text-xs text-muted-foreground">1 device connected</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                        </button>

                        {/* Sign Out */}
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

                    {/* Help Section */}
                    <div className="p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Help & Support
                        </h4>

                        <div className="space-y-1">
                            {[
                                { icon: FileText, label: 'Documentation', href: '#docs' },
                                { icon: HelpCircle, label: 'Contact Support', href: '#support' },
                                { icon: MessageSquare, label: 'Send Feedback', href: '#feedback' },
                            ].map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className="text-muted-foreground" />
                                        <span className="text-sm font-medium">{label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-secondary/30">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Shield size={12} />
                        <span>EdApp v1.0.0 • {tenantName}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
