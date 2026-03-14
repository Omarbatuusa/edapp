'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '../../../../../lib/api-client';
import { MOCK_LEARNER_EVENTS } from '../../../../../lib/calendar-events';
import { DashboardLayout } from '../../../../../components/dashboard/DashboardLayout';
import { MiniCalendar } from '../../../../../components/dashboard/MiniCalendar';
import { WeeklyPlanner } from '../../../../../components/dashboard/WeeklyPlanner';
import { QuickChat } from '../../../../../components/dashboard/QuickChat';
import { QuickAddFAB } from '../../../../../components/dashboard/QuickAddFAB';
import { AddEventSheet } from '../../../../../components/dashboard/AddEventSheet';

export default function LearnerDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const [attendance, setAttendance] = useState<any>(null);
    const [eventSheetOpen, setEventSheetOpen] = useState(false);
    const [preselectedDate, setPreselectedDate] = useState<string>();

    useEffect(() => {
        apiClient.get('/attendance/staff/today').then(res => {
            if (res.data?.status === 'success') setAttendance(res.data);
        }).catch(() => {});
    }, []);

    const basePath = `/tenant/${slug}/learner`;

    const fabItems = [
        { icon: 'event', label: 'Add Reminder', onClick: () => setEventSheetOpen(true) },
        { icon: 'upload_file', label: 'Submit Homework', onClick: () => {} },
    ];

    const sidebar = (
        <>
            <MiniCalendar
                events={MOCK_LEARNER_EVENTS}
                onAddEvent={(date) => { setPreselectedDate(date); setEventSheetOpen(true); }}
            />

            <QuickChat basePath={basePath} />

            {/* Assignments Due */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-500">assignment</span>
                    Assignments Due
                </h3>
                <div className="space-y-1.5">
                    <AssignmentRow subject="History" title="Essay: The Cold War" due="In 2 days" urgent />
                    <AssignmentRow subject="Science" title="Lab Report: Photosynthesis" due="In 5 days" />
                    <AssignmentRow subject="Math" title="Chapter 7 Exercises" due="In 7 days" />
                </div>
            </div>

            {/* My Progress */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">trending_up</span>
                    My Progress
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <ProgressCard label="Avg Grade" value="78%" color="text-green-600" />
                    <ProgressCard label="Attendance" value="94%" color="text-blue-600" />
                    <ProgressCard label="Merits" value="12" color="text-amber-600" />
                    <ProgressCard label="Completed" value="85%" color="text-purple-600" />
                </div>
            </div>

            {/* Notifications */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">notifications</span>
                    Notifications
                </h3>
                <div className="space-y-2">
                    <NotifRow icon="emoji_events" text="You earned the Math Whiz badge!" time="1h ago" />
                    <NotifRow icon="assignment" text="New homework: Chapter 7 exercises" time="3h ago" />
                    <NotifRow icon="event" text="Sports Day on Friday" time="5h ago" />
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
            {/* Welcome Hero */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-6 sm:p-8 bg-[hsl(var(--admin-primary))] rounded-[20px] text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight mb-1.5 relative z-10">Welcome back!</h1>
                    <p className="type-body-medium text-white/80 relative z-10">You have 3 assignments due this week.</p>
                </div>
                <div className="flex items-center">
                    <div className="ios-card text-center p-5">
                        {attendance?.checked_in ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <span className="material-symbols-outlined text-[22px]">check_circle</span>
                                <div className="text-left">
                                    <p className="type-muted font-bold text-green-600">Checked In</p>
                                    <p className="type-metadata text-[hsl(var(--admin-text-muted))]">
                                        {attendance.check_in_time
                                            ? new Date(attendance.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))]">
                                <span className="material-symbols-outlined text-[22px]">cancel</span>
                                <p className="type-muted font-bold">Not Checked In</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Weekly Planner */}
            <WeeklyPlanner
                events={MOCK_LEARNER_EVENTS}
                onAddClick={(date) => { setPreselectedDate(date); setEventSheetOpen(true); }}
            />

            {/* Achievements + Next Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="ios-card overflow-hidden">
                    <h2 className="type-card-title text-[hsl(var(--admin-text-main))] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-amber-500">star</span>
                        Recent Achievements
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                        <AchievementBadge icon="emoji_events" label="Math Whiz" color="hsl(var(--admin-warning, 45 100% 51%))" />
                        <AchievementBadge icon="star" label="Perfect Week" color="hsl(var(--admin-primary))" />
                        <AchievementBadge icon="check_circle" label="On Time" color="hsl(var(--admin-success, 142 71% 45%))" />
                    </div>
                </div>

                <div className="ios-card overflow-hidden">
                    <h2 className="type-card-title text-[hsl(var(--admin-text-main))] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-primary))]">schedule</span>
                        Next Class
                    </h2>
                    <div className="p-4 bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary)/0.3)] transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] group-hover:text-[hsl(var(--admin-primary))] transition-colors">History</h3>
                                <p className="type-muted text-[hsl(var(--admin-text-sub))] mt-0.5">Mr. Bergstrom</p>
                            </div>
                            <span className="bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] px-3 py-1.5 rounded-[10px] type-muted font-bold">
                                10:00 AM
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function AchievementBadge({ icon, label, color }: { icon: string; label: string; color: string }) {
    return (
        <div className="w-24 flex flex-col items-center text-center group cursor-pointer flex-shrink-0">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${color}15`, color }}
            >
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            <span className="type-muted font-bold text-[hsl(var(--admin-text-main))]">{label}</span>
        </div>
    );
}

function AssignmentRow({ subject, title, due, urgent }: { subject: string; title: string; due: string; urgent?: boolean }) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
            <div className={`w-1.5 self-stretch rounded-full ${urgent ? 'bg-red-500' : 'bg-[hsl(var(--admin-primary))]'}`} />
            <div className="flex-1 min-w-0">
                <p className="type-muted font-semibold text-[hsl(var(--admin-text-main))] truncate">{title}</p>
                <p className="type-metadata text-[hsl(var(--admin-text-muted))]">{subject} · {due}</p>
            </div>
        </div>
    );
}

function ProgressCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="text-center p-3 bg-[hsl(var(--admin-surface-alt))] rounded-xl">
            <p className={`text-[20px] font-bold ${color}`}>{value}</p>
            <p className="type-metadata text-[hsl(var(--admin-text-muted))] mt-0.5">{label}</p>
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
