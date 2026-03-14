'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ParentHome } from '@/components/parent/ParentHome';
import { MOCK_PARENT_EVENTS } from '@/lib/calendar-events';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { QuickChat } from '@/components/dashboard/QuickChat';
import { QuickAddFAB } from '@/components/dashboard/QuickAddFAB';
import { AddEventSheet } from '@/components/dashboard/AddEventSheet';
import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard';
import { GroupsChannelsCard } from '@/components/dashboard/GroupsChannelsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

const MOCK_TENANT = {
    name: 'Lakewood International Academy',
    slug: 'lia',
    logo: undefined,
};

const MOCK_USER = {
    name: 'Marge Simpson',
    parentCode: 'PAR-2026-0042',
    familyCode: 'FAM-SIMPSON-01',
};

export default function ParentDashboard() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const [eventSheetOpen, setEventSheetOpen] = useState(false);
    const [preselectedDate, setPreselectedDate] = useState<string>();

    const basePath = `/tenant/${tenantSlug}/parent`;

    const fabItems = [
        { icon: 'sick', label: 'Report Absence', onClick: () => {} },
        { icon: 'chat', label: 'Message Teacher', onClick: () => {} },
        { icon: 'event', label: 'Add Reminder', onClick: () => setEventSheetOpen(true) },
    ];

    const sidebar = (
        <>
            <ProfileCompletionCard
                sections={[
                    { label: 'General Information', completed: 4, total: 5 },
                    { label: 'Emergency Contacts', completed: 1, total: 2 },
                    { label: 'Profile Photo', completed: 1, total: 1 },
                    { label: 'Cover Photo', completed: 0, total: 1 },
                ]}
                editLink={`${basePath}/profile`}
            />

            <MiniCalendar
                events={MOCK_PARENT_EVENTS}
                onAddEvent={(date) => { setPreselectedDate(date); setEventSheetOpen(true); }}
            />

            <QuickChat basePath={basePath} />

            <GroupsChannelsCard basePath={basePath} />

            {/* Upcoming Events */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">event</span>
                    Upcoming Events
                </h3>
                <div className="space-y-1.5">
                    {MOCK_PARENT_EVENTS.slice(0, 4).map(ev => (
                        <div key={ev.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))]">
                                {ev.type === 'exam' ? 'quiz' : ev.type === 'sport' ? 'sports_soccer' : ev.type === 'holiday' ? 'beach_access' : 'event'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="type-muted font-semibold text-[hsl(var(--admin-text-main))] truncate">{ev.title}</p>
                                <p className="type-metadata text-[hsl(var(--admin-text-muted))]">
                                    {new Date(ev.date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    {ev.startTime && ` · ${ev.startTime}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">notifications</span>
                    Notifications
                </h3>
                <div className="space-y-2">
                    <NotifRow icon="school" text="Report cards available for download" time="1h ago" />
                    <NotifRow icon="payments" text="Fee payment confirmed — R4,200" time="2h ago" />
                    <NotifRow icon="campaign" text="Sports Day details announced" time="5h ago" />
                </div>
            </div>
        </>
    );

    const endMarker = (
        <div className="flex flex-col items-center py-10">
            <div className="w-full max-w-[260px] flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[hsl(var(--admin-border)/0.5)]" />
                <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-muted)/0.5)]">check_circle</span>
                <div className="flex-1 h-px bg-[hsl(var(--admin-border)/0.5)]" />
            </div>
            <p className="type-body-medium text-[hsl(var(--admin-text-main))]">You&apos;re all caught up</p>
            <p className="type-muted text-[hsl(var(--admin-text-muted))] mt-1">You&apos;ve seen all new posts from the past 3 days.</p>
        </div>
    );

    return (
        <DashboardLayout
            sidebar={sidebar}
            footer={endMarker}
            fab={
                <>
                    <QuickAddFAB items={fabItems} />
                    <AddEventSheet isOpen={eventSheetOpen} onClose={() => setEventSheetOpen(false)} preselectedDate={preselectedDate} />
                </>
            }
        >
            {/* Welcome Header */}
            <div>
                <p className="type-muted text-[hsl(var(--admin-text-muted))]">Welcome back</p>
                <h1 className="type-page-title text-[hsl(var(--admin-text-main))]">{MOCK_USER.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <p className="type-muted text-[hsl(var(--admin-text-sub))]">
                        Parent: <span className="font-mono font-semibold text-[hsl(var(--admin-text-main))]">{MOCK_USER.parentCode}</span>
                    </p>
                    <p className="type-muted text-[hsl(var(--admin-text-sub))]">
                        Family: <span className="font-mono font-semibold text-[hsl(var(--admin-text-main))]">{MOCK_USER.familyCode}</span>
                    </p>
                </div>
            </div>

            <ParentHome
                tenantSlug={tenantSlug}
                tenantName={MOCK_TENANT.name}
                tenantLogo={MOCK_TENANT.logo}
            />

            {/* Activity Feed */}
            <ActivityFeed role="parent" />
        </DashboardLayout>
    );
}

function NotifRow({ icon, text, time }: { icon: string; text: string; time: string }) {
    return (
        <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))] mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="type-muted text-[hsl(var(--admin-text-main))] leading-snug">{text}</p>
                <p className="type-metadata text-[hsl(var(--admin-text-muted))]">{time}</p>
            </div>
        </div>
    );
}
