'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppBottomNav } from './AppBottomNav';
import { AppNavRail } from './AppNavRail';
import { AppFooter } from './AppFooter';
import { SubpageBar } from './SubpageBar';
import { ProfileSheet } from './ProfileSheet';
import { EmergencySheet } from './EmergencySheet';
import { ReportsHubSheet } from './ReportsHubSheet';
import { SafetyChooserSheet } from './SafetyChooserSheet';
import { useSubpageDetection } from '@/hooks/useSubpageDetection';
import { NotificationPanel } from '@/components/dashboard/NotificationPanel';
import { SearchSheet } from '@/components/dashboard/SearchSheet';
import { ScopeSelectorSheet } from '@/components/dashboard/ScopeSelectorSheet';
import { EmergencyProvider } from '@/contexts/EmergencyContext';
import { ShellActionsProvider } from '@/contexts/ShellActionsContext';
import { EmergencyBanner } from '@/components/safety/EmergencyBanner';
import { MOCK_NOTIFICATIONS, countUnread } from '@/lib/notifications';
import { getHeaderFeatures, SAFETY_CARD_ROLES } from '@/config/navigation';
import type { RoleNavConfig } from '@/config/navigation';
import type { UserRoleAssignment } from '@/components/dashboard/RoleSwitcher';

interface AppShellProps {
    children: React.ReactNode;
    tenantSlug: string;
    tenantName: string;
    tenantLogo?: string | null;
    user?: any;
    role: string;
    navConfig: RoleNavConfig;
    appVersion?: string;
    /** Scope chip label (e.g. "Midrand Branch", "All campuses") */
    scopeLabel?: string;
    /** Whether to show the scope chip in header */
    showScopeChip?: boolean;
    /** Branches for scope selector */
    branches?: Array<{ id: string; branch_name: string; branch_code: string; is_main_branch: boolean }>;
    /** Currently selected scope (branch_id or null) */
    currentScope?: string | null;
    /** Callback when scope changes */
    onScopeChange?: (branchId: string | null) => void;
    /** Current user role assignment for ProfileSheet */
    currentRole?: UserRoleAssignment;
    /** All user role assignments for role switching */
    allRoles?: UserRoleAssignment[];
    /** Callback when user switches role */
    onRoleSwitch?: (role: UserRoleAssignment) => void;
}

/**
 * Universal AppShell — one shell for ALL 31 roles.
 * Facebook-style header with always-on bg/shadow.
 * Uses chrome flag: "default" | "takeover" | "modal".
 */
export function AppShell({
    children,
    tenantSlug,
    tenantName,
    tenantLogo,
    user,
    role,
    navConfig,
    appVersion = '1.0.0',
    scopeLabel = 'All campuses',
    showScopeChip = true,
    branches = [],
    currentScope = null,
    onScopeChange,
    currentRole,
    allRoles = [],
    onRoleSwitch,
}: AppShellProps) {
    const router = useRouter();
    const basePath = navConfig.getBasePath(tenantSlug);

    // Sidebar collapse state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    // Overlay panels
    const [profileSheetOpen, setProfileSheetOpen] = useState(false);
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const [searchSheetOpen, setSearchSheetOpen] = useState(false);
    const [scopeSelectorOpen, setScopeSelectorOpen] = useState(false);
    const [emergencySheetOpen, setEmergencySheetOpen] = useState(false);
    const [reportsHubOpen, setReportsHubOpen] = useState(false);
    const [safetyChooserOpen, setSafetyChooserOpen] = useState(false);

    // Subpage detection + chrome flag
    const { isSubpage, isFullscreen, chrome } = useSubpageDetection(navConfig.bottomTabs, basePath);

    // Notification count
    const notificationsCount = countUnread(MOCK_NOTIFICATIONS);

    // Header feature flags
    const hf = getHeaderFeatures(role);
    const showSafety = SAFETY_CARD_ROLES.has(role);

    // Shell actions context — lets dashboard pages open overlays
    const shellActions = useMemo(() => ({
        openEmergency: () => setEmergencySheetOpen(true),
        openReportsHub: () => setReportsHubOpen(true),
        openSearch: () => setSearchSheetOpen(true),
    }), []);

    // Restore sidebar collapse preference
    useEffect(() => {
        const stored = localStorage.getItem('app_sidebar_collapsed');
        if (stored === 'true') setIsCollapsed(true);
    }, []);

    // Keyboard shortcut: Cmd+K / Ctrl+K for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchSheetOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('app_sidebar_collapsed', String(next));
    };

    const handleScroll = () => {
        if (mainRef.current) {
            setIsScrolled(mainRef.current.scrollTop > 10);
        }
    };

    // Fullscreen mode — hide shell chrome (used by chat routes)
    if (chrome === 'modal') {
        return (
            <EmergencyProvider>
                <ShellActionsProvider value={shellActions}>
                    <div className="admin-app-outer">
                        <div className="admin-app-container">
                            <main className="admin-main relative flex flex-col flex-1">
                                {children}
                            </main>
                        </div>
                    </div>
                </ShellActionsProvider>
            </EmergencyProvider>
        );
    }

    return (
        <EmergencyProvider>
            <ShellActionsProvider value={shellActions}>
                <div className="admin-app-outer">
                    <div className="admin-app-container">
                        <EmergencyBanner />
                        {/* AppHeader on tab roots only (chrome === "default") */}
                        {chrome === 'default' && (
                            <AppHeader
                                title={tenantName}
                                logoUrl={tenantLogo}
                                onSearch={() => setSearchSheetOpen(true)}
                                onSafetyClick={showSafety ? () => setSafetyChooserOpen(true) : undefined}
                                onNotificationClick={() => setNotificationPanelOpen(true)}
                                onAvatarClick={() => setProfileSheetOpen(true)}
                                notificationsCount={notificationsCount}
                                user={user}
                                scopeLabel={scopeLabel}
                                onScopeClick={hf.showScope && showScopeChip ? () => setScopeSelectorOpen(true) : undefined}
                                showScope={hf.showScope && showScopeChip}
                                showSafety={showSafety}
                            />
                        )}
                        <div className="admin-body">
                            <AppNavRail
                                items={navConfig.allItems}
                                basePath={basePath}
                                isCollapsed={isCollapsed}
                                onToggleCollapse={toggleCollapse}
                            />
                            <main
                                className="admin-main relative flex flex-col"
                                ref={mainRef}
                                onScroll={handleScroll}
                            >
                                {/* Subpage takeover: only SubpageBar, no AppHeader */}
                                {chrome === 'takeover' && <SubpageBar />}
                                <div className="flex-1">
                                    {children}
                                </div>
                                <AppFooter version={appVersion} />
                            </main>
                        </div>
                        {/* Bottom nav only on tab roots */}
                        {chrome === 'default' && (
                            <AppBottomNav
                                items={navConfig.bottomTabs}
                                basePath={basePath}
                            />
                        )}
                    </div>
                </div>

                {/* Overlay panels */}
                <ProfileSheet
                    isOpen={profileSheetOpen}
                    onClose={() => setProfileSheetOpen(false)}
                    user={user}
                    tenantName={tenantName}
                    tenantSlug={tenantSlug}
                    currentRole={currentRole}
                    allRoles={allRoles}
                    onRoleSwitch={onRoleSwitch}
                />
                <NotificationPanel
                    isOpen={notificationPanelOpen}
                    onClose={() => setNotificationPanelOpen(false)}
                    tenantSlug={tenantSlug}
                />
                <SearchSheet
                    isOpen={searchSheetOpen}
                    onClose={() => setSearchSheetOpen(false)}
                    tenantSlug={tenantSlug}
                    currentRole={role}
                />
                <ScopeSelectorSheet
                    isOpen={scopeSelectorOpen}
                    onClose={() => setScopeSelectorOpen(false)}
                    branches={branches}
                    currentScope={currentScope}
                    onSelect={(branchId) => onScopeChange?.(branchId)}
                    tenantName={tenantName}
                />
                <SafetyChooserSheet
                    isOpen={safetyChooserOpen}
                    onClose={() => setSafetyChooserOpen(false)}
                    onChooseEmergency={() => setEmergencySheetOpen(true)}
                    onChooseReports={() => setReportsHubOpen(true)}
                />
                <EmergencySheet
                    isOpen={emergencySheetOpen}
                    onClose={() => setEmergencySheetOpen(false)}
                    tenantName={tenantName}
                />
                <ReportsHubSheet
                    isOpen={reportsHubOpen}
                    onClose={() => setReportsHubOpen(false)}
                    tenantSlug={tenantSlug}
                    role={role}
                    basePath={basePath}
                    tenantName={tenantName}
                    onOpenEmergency={() => {
                        setReportsHubOpen(false);
                        setEmergencySheetOpen(true);
                    }}
                />
            </ShellActionsProvider>
        </EmergencyProvider>
    );
}
