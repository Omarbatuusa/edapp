'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

    return (
        <EmergencyProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col font-display">
                <EmergencyBanner />

                {/* Main Content Area - No Sidebar, centered container */}
                <div className="flex flex-col min-h-screen">
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

                    {/* Main content with bottom padding for nav */}
                    <main className="flex-1 p-4 md:p-6 max-w-2xl lg:max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24">
                        {children}
                    </main>
                </div>

                {/* Bottom Navigation - Always visible */}
                <BottomNav tenantSlug={slug} />

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
