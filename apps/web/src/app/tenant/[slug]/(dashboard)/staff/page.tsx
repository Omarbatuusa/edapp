'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StaffAttendanceCard from '../../../../../components/attendance/StaffAttendanceCard';
import { apiClient } from '../../../../../lib/api-client';
import { MOCK_STAFF_EVENTS } from '../../../../../lib/calendar-events';
import { DashboardLayout } from '../../../../../components/dashboard/DashboardLayout';
import { MiniCalendar } from '../../../../../components/dashboard/MiniCalendar';
import { WeeklyPlanner } from '../../../../../components/dashboard/WeeklyPlanner';
import { QuickChat } from '../../../../../components/dashboard/QuickChat';
import { QuickAddFAB } from '../../../../../components/dashboard/QuickAddFAB';
import { AddEventSheet } from '../../../../../components/dashboard/AddEventSheet';
import { ProfileCompletionCard } from '../../../../../components/dashboard/ProfileCompletionCard';
import { GroupsChannelsCard } from '../../../../../components/dashboard/GroupsChannelsCard';
import { ActivityFeed } from '../../../../../components/dashboard/ActivityFeed';

export default function StaffDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const [branchId, setBranchId] = useState<string>('');
    const [classes, setClasses] = useState<any[]>([]);
    const [eventSheetOpen, setEventSheetOpen] = useState(false);
    const [preselectedDate, setPreselectedDate] = useState<string>();

    useEffect(() => {
        apiClient.get('/auth/me').then(res => {
            if (res.data?.branch_id) setBranchId(res.data.branch_id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!branchId) return;
        apiClient.get('/attendance/register/my-classes').then(res => {
            if (res.data?.status === 'success') setClasses(res.data.classes || []);
        }).catch(() => {});
    }, [branchId]);

    const basePath = `/tenant/${slug}/staff`;

    const fabItems = [
        { icon: 'event', label: 'Add Event', onClick: () => setEventSheetOpen(true) },
        { icon: 'assignment', label: 'Assign Homework', onClick: () => {} },
        { icon: 'fact_check', label: 'Take Attendance', onClick: () => {} },
    ];

    const sidebar = (
        <>
            <ProfileCompletionCard
                sections={[
                    { label: 'General Information', completed: 5, total: 6 },
                    { label: 'Work Experience', completed: 1, total: 3 },
                    { label: 'Profile Photo', completed: 1, total: 1 },
                    { label: 'Qualifications', completed: 2, total: 4 },
                ]}
                editLink={`${basePath}/profile`}
            />

            <MiniCalendar
                events={MOCK_STAFF_EVENTS}
                onAddEvent={(date) => { setPreselectedDate(date); setEventSheetOpen(true); }}
            />

            <QuickChat basePath={basePath} />

            <GroupsChannelsCard basePath={basePath} />

            {/* My Tasks */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">checklist</span>
                    My Tasks
                </h3>
                <div className="space-y-1.5">
                    <TaskRow label="Grade 10 homework to mark" count={12} color="text-amber-600" />
                    <TaskRow label="Term reports due" count={3} color="text-red-500" />
                    <TaskRow label="Parent queries to respond" count={2} color="text-blue-500" />
                </div>
            </div>

            {/* Notifications */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">notifications</span>
                    Notifications
                </h3>
                <div className="space-y-2">
                    <NotifRow icon="campaign" text="Staff meeting moved to 14:00" time="30m ago" />
                    <NotifRow icon="assignment_turned_in" text="Grade 11 homework submitted" time="1h ago" />
                    <NotifRow icon="event" text="Parent evening next Friday" time="3h ago" />
                </div>
            </div>
        </>
    );

    return (
        <DashboardLayout
            sidebar={sidebar}
            fab={
                <>
                    <QuickAddFAB items={fabItems} />
                    <AddEventSheet isOpen={eventSheetOpen} onClose={() => setEventSheetOpen(false)} preselectedDate={preselectedDate} />
                </>
            }
        >
            {/* Header */}
            <div>
                <h1 className="type-page-title text-[hsl(var(--admin-text-main))]">Dashboard</h1>
                <p className="type-body-medium text-[hsl(var(--admin-text-sub))] mt-0.5">Your schedule, classes and tasks at a glance.</p>
            </div>

            {/* Attendance + Classes row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                    {branchId && <StaffAttendanceCard branchId={branchId} />}
                    {!branchId && (
                        <div className="ios-card">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-symbols-outlined text-[22px] text-[hsl(var(--admin-primary))]">check_circle</span>
                                <h3 className="type-card-title text-[hsl(var(--admin-text-main))]">Attendance</h3>
                            </div>
                            <p className="type-muted text-[hsl(var(--admin-text-muted))]">Sign in to view attendance.</p>
                        </div>
                    )}
                </div>

                <div className="ios-card col-span-1 md:col-span-2">
                    <h2 className="type-card-title text-[hsl(var(--admin-text-main))] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))]">auto_stories</span>
                        My Classes
                    </h2>
                    <div className="space-y-2">
                        {classes.length === 0 && (
                            <p className="type-muted text-[hsl(var(--admin-text-sub))]">No classes assigned yet.</p>
                        )}
                        {classes.map((cls: any) => (
                            <Link
                                key={cls.id}
                                href={`/tenant/${slug}/staff/register/${cls.id}`}
                                className="p-3.5 bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors border border-[hsl(var(--admin-border))] rounded-xl flex justify-between items-center gap-2"
                            >
                                <div>
                                    <span className="type-body-medium text-[hsl(var(--admin-text-main))]">
                                        {cls.section_name || cls.class_code}
                                    </span>
                                    {cls.grade_id && (
                                        <span className="ml-2 type-metadata text-[hsl(var(--admin-text-sub))]">Grade {cls.grade_id}</span>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-sub))]">chevron_right</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Planner */}
            <WeeklyPlanner
                events={MOCK_STAFF_EVENTS}
                onAddClick={(date) => { setPreselectedDate(date); setEventSheetOpen(true); }}
            />

            {/* Activity Feed */}
            <ActivityFeed role="staff" />
        </DashboardLayout>
    );
}

function TaskRow({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
            <span className="type-muted text-[hsl(var(--admin-text-main))]">{label}</span>
            <span className={`type-metadata font-bold ${color} bg-[hsl(var(--admin-surface-alt))] px-2 py-0.5 rounded-full`}>{count}</span>
        </div>
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
