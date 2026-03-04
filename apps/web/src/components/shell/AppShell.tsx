'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppBottomNav } from './AppBottomNav';
import { AppNavRail } from './AppNavRail';
import { AppFooter } from './AppFooter';
import { SubpageBar } from './SubpageBar';
import { useSubpageDetection } from '@/hooks/useSubpageDetection';
import { AvatarPanel } from '@/components/dashboard/AvatarPanel';
import { NotificationPanel } from '@/components/dashboard/NotificationPanel';
import { SearchSheet } from '@/components/dashboard/SearchSheet';
import { EmergencyProvider } from '@/contexts/EmergencyContext';
import { EmergencyBanner } from '@/components/safety/EmergencyBanner';
import { MOCK_NOTIFICATIONS, countUnread } from '@/lib/notifications';
import type { RoleNavConfig } from '@/config/navigation';

interface AppShellProps {
    children: React.ReactNode;
    tenantSlug: string;
    tenantName: string;
    tenantLogo?: string;
    user?: any;
    role: string;
    navConfig: RoleNavConfig;
    appVersion?: string;
    /** Subtitle shown in header (e.g. "Platform Admin", "Parent Dashboard") */
    headerSubtitle?: string;
}

/**
 * Universal AppShell — one shell for ALL 31 roles.
 * Based on AdminShell's exact layout, reusing all `admin-*` CSS classes.
 *
 * Layout:
 * ```
 * <EmergencyProvider>
 *   <div.admin-app-outer>
 *     <div.admin-app-container>
 *       <EmergencyBanner />
 *       <AppHeader />
 *       <div.admin-body>
 *         <AppNavRail />
 *         <main.admin-main>
 *           {isSubpage && <SubpageBar />}
 *           {children}
 *           <AppFooter />
 *         </main>
 *       </div>
 *       {!isSubpage && !isFullscreen && <AppBottomNav />}
 *     </div>
 *   </div>
 *   <AvatarPanel /> <NotificationPanel /> <SearchSheet />
 * </EmergencyProvider>
 * ```
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
    headerSubtitle,
}: AppShellProps) {
    const router = useRouter();
    const basePath = navConfig.getBasePath(tenantSlug);

    // Sidebar collapse state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    // Overlay panels
    const [avatarPanelOpen, setAvatarPanelOpen] = useState(false);
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const [searchSheetOpen, setSearchSheetOpen] = useState(false);

    // Subpage detection
    const { isSubpage, isFullscreen } = useSubpageDetection(navConfig.bottomTabs, basePath);

    // Notification count
    const notificationsCount = countUnread(MOCK_NOTIFICATIONS);

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

    const handleEmergency = () => {
        router.push(`/tenant/${tenantSlug}/${role}/emergency`);
    };

    // Fullscreen mode — hide shell chrome (used by chat routes)
    if (isFullscreen) {
        return (
            <EmergencyProvider>
                <div className="admin-app-outer">
                    <div className="admin-app-container">
                        <main className="admin-main relative flex flex-col flex-1">
                            {children}
                        </main>
                    </div>
                </div>
            </EmergencyProvider>
        );
    }

    return (
        <EmergencyProvider>
            <div className="admin-app-outer">
                <div className="admin-app-container">
                    <EmergencyBanner />
                    <AppHeader
                        title={tenantName}
                        subtitle={headerSubtitle}
                        logoUrl={tenantLogo}
                        isScrolled={isScrolled}
                        onSearch={() => setSearchSheetOpen(true)}
                        onEmergency={handleEmergency}
                        onNotificationClick={() => setNotificationPanelOpen(true)}
                        onAvatarClick={() => setAvatarPanelOpen(true)}
                        notificationsCount={notificationsCount}
                        user={user}
                    />
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
                            {isSubpage && <SubpageBar />}
                            <div className="flex-1">
                                {children}
                            </div>
                            <AppFooter version={appVersion} />
                        </main>
                    </div>
                    {!isSubpage && (
                        <AppBottomNav
                            items={navConfig.bottomTabs}
                            basePath={basePath}
                        />
                    )}
                </div>
            </div>

            {/* Overlay panels */}
            <AvatarPanel
                isOpen={avatarPanelOpen}
                onClose={() => setAvatarPanelOpen(false)}
                user={user}
                tenantName={tenantName}
                tenantSlug={tenantSlug}
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
        </EmergencyProvider>
    );
}
