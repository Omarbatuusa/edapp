'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShellHeader } from './ShellHeader';
import { BottomNav } from '@/components/dashboard/bottom-nav';
import { AvatarPanel } from '@/components/dashboard/AvatarPanel';
import { NotificationPanel } from '@/components/dashboard/NotificationPanel';
import { SearchSheet } from '@/components/dashboard/SearchSheet';
import { MOCK_NOTIFICATIONS, countUnread } from '@/lib/notifications';
import { EmergencyProvider } from '@/contexts/EmergencyContext';
import { EmergencyBanner } from '@/components/safety/EmergencyBanner';

interface ShellProps {
    children: React.ReactNode;
    tenantName: string;
    tenantSlug?: string;
    tenantLogo?: string;
    user?: any;
    role?: string;
}

export function Shell({ children, tenantName, tenantSlug, tenantLogo, user, role = 'parent' }: ShellProps) {
    const router = useRouter();
    const pathname = usePathname(); // Add usePathname hook
    const [avatarPanelOpen, setAvatarPanelOpen] = useState(false);
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const [searchSheetOpen, setSearchSheetOpen] = useState(false);

    // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
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

    // Notification count for badge
    const notificationsCount = countUnread(MOCK_NOTIFICATIONS);

    // Derive tenant slug from name if not provided
    const slug = tenantSlug || tenantName.toLowerCase();

    // Emergency hub navigation
    const handleEmergency = () => {
        router.push(`/tenant/${slug}/${role}/emergency`);
    };

    // Check if we are in a fullscreen route (e.g. Communication Hub / Chat)
    // We hide the shell header and bottom nav for these routes to allow "screen takeover"
    const isFullScreen = pathname?.includes('/chat');

    return (
        <EmergencyProvider>
            <div className={`min-h-screen flex flex-col font-display bg-slate-50 dark:bg-[#0B1120] ${isFullScreen ? 'overflow-hidden' : ''}`}>
                {!isFullScreen && <EmergencyBanner />}

                {/* Main Content Area - No Sidebar, centered container */}
                <div className={`flex flex-col ${isFullScreen ? 'min-h-0 flex-1' : 'min-h-screen'}`}>
                    {!isFullScreen && (
                        <ShellHeader
                            tenantName={tenantName}
                            tenantLogo={tenantLogo}
                            user={user}
                            role={role}
                            onAvatarClick={() => setAvatarPanelOpen(true)}
                            onNotificationClick={() => setNotificationPanelOpen(true)}
                            onSearch={() => setSearchSheetOpen(true)}
                            onEmergency={handleEmergency}
                            notificationsCount={notificationsCount}
                            showChangeSchool={true}
                        />
                    )}

                    {/* Main content with bottom padding for nav if not fullscreen */}
                    <main
                        className={`flex-1 w-full mx-auto duration-500 ${isFullScreen
                            ? 'p-0 max-w-full pb-0 min-h-0 relative z-0 bg-slate-50 dark:bg-[#0B1120]'
                            : 'p-4 md:p-6 max-w-2xl lg:max-w-4xl pb-24 animate-in fade-in slide-in-from-bottom-2'
                            }`}
                    >
                        {children}
                    </main>
                </div>

                {/* Bottom Navigation - Always visible unless fullscreen */}
                {!isFullScreen && <BottomNav tenantSlug={slug} />}

                {/* Avatar Panel */}
                <AvatarPanel
                    isOpen={avatarPanelOpen}
                    onClose={() => setAvatarPanelOpen(false)}
                    user={user}
                    tenantName={tenantName}
                    tenantSlug={slug}
                />

                {/* Notification Panel */}
                <NotificationPanel
                    isOpen={notificationPanelOpen}
                    onClose={() => setNotificationPanelOpen(false)}
                    tenantSlug={slug}
                />

                {/* Search Sheet */}
                <SearchSheet
                    isOpen={searchSheetOpen}
                    onClose={() => setSearchSheetOpen(false)}
                    tenantSlug={slug}
                    currentRole={role}
                />
            </div>
        </EmergencyProvider>
    );
}
