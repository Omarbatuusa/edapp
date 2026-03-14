'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../../../lib/api-client';
import { MOCK_ADMIN_EVENTS } from '../../../../../lib/calendar-events';
import { DashboardLayout } from '../../../../../components/dashboard/DashboardLayout';
import { MiniCalendar } from '../../../../../components/dashboard/MiniCalendar';
import { WeeklyPlanner } from '../../../../../components/dashboard/WeeklyPlanner';
import { QuickChat } from '../../../../../components/dashboard/QuickChat';
import { QuickAddFAB } from '../../../../../components/dashboard/QuickAddFAB';
import { AddEventSheet } from '../../../../../components/dashboard/AddEventSheet';

interface Props { params: Promise<{ slug: string }> }

const PLATFORM_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin'];
const SECRETARY_ROLES = ['platform_secretary', 'app_secretary'];
const SUPPORT_ROLES = ['platform_support', 'app_support'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];
const BRANCH_ROLES = ['tenant_admin', 'main_branch_admin', 'branch_admin', 'platform_super_admin', 'app_super_admin'];
const ADMISSIONS_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin', 'tenant_admin', 'admissions_officer'];

function useAdminRole(slug: string) {
    const [role, setRole] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const r = localStorage.getItem(`edapp_role_${slug}`) || localStorage.getItem('user_role') || '';
            setRole(r);
        }
    }, [slug]);
    return role;
}

export default function AdminDashboard({ params }: Props) {
    const { slug } = use(params);
    const role = useAdminRole(slug);
    const isPlatform = PLATFORM_ROLES.includes(role);
    const isSecretary = SECRETARY_ROLES.includes(role);
    const isSupport = SUPPORT_ROLES.includes(role);
    const isTenantAdmin = TENANT_ROLES.includes(role);
    const canManageBranches = BRANCH_ROLES.includes(role);
    const canManageAdmissions = ADMISSIONS_ROLES.includes(role);
    const isBranchAdmin = role === 'branch_admin';

    const [branchId, setBranchId] = useState('');
    const [attendanceStats, setAttendanceStats] = useState<{ total: number; present: number; absent: number; late: number } | null>(null);
    const [eventSheetOpen, setEventSheetOpen] = useState(false);
    const [preselectedDate, setPreselectedDate] = useState<string>();

    useEffect(() => {
        apiClient.get('/auth/me').then(res => {
            if (res.data?.branch_id) setBranchId(res.data.branch_id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!branchId) return;
        const today = new Date().toISOString().split('T')[0];
        apiClient.get(`/attendance/learner/branch?branch_id=${branchId}&date=${today}`)
            .then(res => {
                if (res.data?.status === 'success') {
                    const learners = res.data.learners || [];
                    setAttendanceStats({
                        total: learners.length,
                        present: learners.filter((l: any) => l.status === 'PRESENT' || l.status === 'LATE').length,
                        absent: learners.filter((l: any) => l.status === 'ABSENT' || l.status === 'UNKNOWN').length,
                        late: learners.filter((l: any) => l.status === 'LATE').length,
                    });
                }
            }).catch(() => {});
    }, [branchId]);

    const attendanceRate = attendanceStats && attendanceStats.total > 0
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
        : null;

    const basePath = `/tenant/${slug}/admin`;

    const fabItems = [
        { icon: 'event', label: 'Add Event', onClick: () => setEventSheetOpen(true) },
        { icon: 'person_add', label: 'Add Student', onClick: () => {} },
        { icon: 'warning', label: 'Log Incident', onClick: () => {} },
    ];

    const sidebar = (
        <>
            <MiniCalendar
                events={MOCK_ADMIN_EVENTS}
                onAddEvent={(date) => { setPreselectedDate(date); setEventSheetOpen(true); }}
            />

            {/* Urgent Tasks */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-danger))]">priority_high</span>
                    Urgent Tasks
                </h3>
                <div className="space-y-1">
                    <TaskItem title="Approve Leave Request" time="2h ago" urgent />
                    <TaskItem title="Review Incident Report #102" time="4h ago" urgent />
                    <TaskItem title="Monthly Fee Reconciliation" time="1d ago" />
                </div>
                <button type="button" className="w-full mt-3 py-2 type-muted text-[hsl(var(--admin-primary))] font-semibold hover:bg-[hsl(var(--admin-primary)/0.05)] rounded-lg transition-colors">
                    View All Tasks
                </button>
            </div>

            <QuickChat basePath={basePath} />

            {/* Staff On Leave */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">person_off</span>
                    Staff On Leave
                </h3>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center type-muted font-bold text-[hsl(var(--admin-text-main))]">EK</div>
                    <div>
                        <p className="type-muted font-semibold text-[hsl(var(--admin-text-main))]">Edna Krabappel</p>
                        <p className="type-metadata text-[hsl(var(--admin-text-muted))]">Sick Leave</p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">notifications</span>
                    Recent Notifications
                </h3>
                <div className="space-y-2">
                    <NotifItem icon="person_add" text="New enrollment application received" time="10m ago" />
                    <NotifItem icon="event_available" text="Staff meeting confirmed for tomorrow" time="1h ago" />
                    <NotifItem icon="payments" text="3 fee payments processed" time="2h ago" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="type-page-title text-[hsl(var(--admin-text-main))]">Dashboard</h1>
                    <p className="type-body-medium text-[hsl(var(--admin-text-sub))] mt-0.5">Overview of school performance and alerts.</p>
                </div>
                <button type="button" className="h-9 px-4 rounded-xl bg-[hsl(var(--admin-primary))] text-white font-semibold text-[13px] hover:opacity-90 transition-opacity shadow-sm flex-shrink-0">
                    Generate Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
                <StatCard title="Total Students" value="1,240" change="+12%" trend="up" icon="group" />
                <Link href={`${basePath}/attendance`} className="block">
                    <StatCard
                        title="Attendance"
                        value={attendanceRate !== null ? `${attendanceRate}%` : '—'}
                        change={attendanceRate !== null ? (attendanceRate >= 90 ? 'On track' : 'Needs attention') : 'Loading…'}
                        trend={attendanceRate !== null ? (attendanceRate >= 90 ? 'up' : 'down') : 'neutral'}
                        icon="calendar_today"
                    />
                </Link>
                <StatCard title="Incidents" value="3" change="Low" trend="neutral" icon="warning" alert />
                <StatCard title="Revenue" value="R 840k" change="+5%" trend="up" icon="trending_up" />
            </div>

            {/* Nav Sections */}
            {isPlatform && (
                <NavSection title="Platform Management">
                    <NavCard href={`${basePath}/tenants`} label="Tenants" description="View and manage all school tenants" icon="domain" color="indigo" />
                    <NavCard href={`${basePath}/brands`} label="Brand Management" description="Manage school brands and groups" icon="category" color="purple" />
                    <NavCard href={`${basePath}/dictionaries`} label="Dictionaries" description="Phases, grades, subjects, languages" icon="menu_book" color="violet" />
                    <NavCard href={`${basePath}/people`} label="People & Roles" description="Manage users and role assignments" icon="group" color="teal" />
                    <NavCard href={`${basePath}/audit`} label="Audit Log" description="View platform activity and changes" icon="history" color="gray" />
                </NavSection>
            )}
            {canManageBranches && (
                <NavSection title="School Setup">
                    <NavCard href={`${basePath}/main-branch`} label="Main Branch Setup" description="Configure your primary school profile" icon="account_balance" color="blue" />
                    <NavCard href={`${basePath}/branches`} label="Branch Management" description="Manage campuses and branches" icon="location_city" color="green" />
                </NavSection>
            )}
            {isSecretary && (
                <NavSection title="Secretary Tools">
                    <NavCard href={`${basePath}/inbox`} label="Inbox / Tasks" description="View pending tasks and approvals" icon="inbox" color="orange" />
                    <NavCard href={`${basePath}/tenants`} label="Tenants Lookup" description="Search tenants by school code" icon="search" color="gray" />
                    <NavCard href={`${basePath}/approvals`} label="Approvals" description="Process pending approvals" icon="task_alt" color="teal" />
                    <NavCard href={`${basePath}/people`} label="People Lookup" description="Search users across tenants" icon="person_search" color="blue" />
                </NavSection>
            )}
            {isTenantAdmin && (
                <NavSection title="School Administration">
                    <NavCard href={`${basePath}/control`} label="Control Dashboard" description="School overview and quick links" icon="dashboard" color="blue" />
                    <NavCard href={`${basePath}/attendance`} label="Attendance" description="Daily learner & staff attendance tracking" icon="event_available" color="green" />
                    <NavCard href={`${basePath}/enrollment`} label="Enrollment" description="View and manage enrollment applications" icon="person_add" color="rose" />
                    <NavCard href={`${basePath}/staff`} label="Staff Management" description="Manage staff profiles and roles" icon="badge" color="purple" />
                    <NavCard href={`${basePath}/school-data`} label="School Data" description="Phases, grades and subject offerings" icon="school" color="indigo" />
                    <NavCard href={`${basePath}/people`} label="People & Roles" description="Manage users and role assignments" icon="group" color="teal" />
                    <NavCard href={`${basePath}/calendar`} label="Academic Calendar" description="Manage school days, holidays, exams" icon="calendar_month" color="orange" />
                    <NavCard href={`${basePath}/curriculum`} label="Curriculum" description="Manage curricula and subject offerings" icon="menu_book" color="violet" />
                    <NavCard href={`${basePath}/grades-classes`} label="Grades &amp; Classes" description="Configure grades and class groups" icon="class" color="green" />
                    <NavCard href={`${basePath}/families`} label="Families" description="Manage family records and links" icon="family_restroom" color="teal" />
                    <NavCard href={`${basePath}/family-doctors`} label="Family Doctors" description="Manage family doctor records" icon="medical_services" color="rose" />
                    <NavCard href={`${basePath}/emergency-contacts`} label="Emergency Contacts" description="Manage emergency contact records" icon="contact_emergency" color="amber" />
                    <NavCard href={`${basePath}/admissions`} label="Admissions Builder" description="Design your admissions process" icon="assignment" color="rose" />
                    <NavCard href={`${basePath}/integrations`} label="Integrations &amp; Features" description="Feature flags and external systems" icon="integration_instructions" color="amber" />
                </NavSection>
            )}
            {canManageAdmissions && !isPlatform && !isTenantAdmin && (
                <NavSection title="Admissions">
                    <NavCard href={`${basePath}/admissions`} label="Admissions Builder" description="Design your admissions process" icon="assignment" color="rose" />
                </NavSection>
            )}
            {isBranchAdmin && !canManageBranches && (
                <NavSection title="Branch Administration">
                    <NavCard href={`${basePath}/branches`} label="My Branch" description="Manage your branch settings" icon="location_city" color="green" />
                    <NavCard href={`${basePath}/people`} label="People & Roles" description="Manage branch staff and roles" icon="group" color="teal" />
                </NavSection>
            )}

            {/* Weekly Planner */}
            <WeeklyPlanner
                events={MOCK_ADMIN_EVENTS}
                onAddClick={(date) => { setPreselectedDate(date); setEventSheetOpen(true); }}
            />

            {/* Today's Attendance */}
            <div className="ios-card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="type-card-title text-[hsl(var(--admin-text-main))]">
                        Today&apos;s Attendance
                    </h3>
                    <Link
                        href={`${basePath}/attendance`}
                        className="type-metadata font-semibold text-[hsl(var(--admin-primary))] hover:underline flex items-center gap-1"
                    >
                        Full Dashboard
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                </div>
                <div className="flex items-center justify-between mb-4 p-3 bg-[hsl(var(--admin-surface-alt))] rounded-xl">
                    <span className="type-muted text-[hsl(var(--admin-text-muted))]">Attendance Rate</span>
                    <span className={`type-kpi-number ${attendanceRate !== null && attendanceRate >= 90 ? 'text-green-600' : attendanceRate !== null ? 'text-amber-600' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                        {attendanceRate !== null ? `${attendanceRate}%` : '—'}
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <AttendanceStat icon="check_circle" value={attendanceStats?.present ?? '—'} label="Present" color="green" />
                    <AttendanceStat icon="person_off" value={attendanceStats?.absent ?? '—'} label="Absent" color="red" />
                    <AttendanceStat icon="schedule" value={attendanceStats?.late ?? '—'} label="Late" color="amber" />
                </div>
                {!branchId && (
                    <p className="type-metadata text-[hsl(var(--admin-text-muted))] text-center mt-4">
                        Branch data loads after sign-in.{' '}
                        <Link href={`${basePath}/attendance`} className="text-[hsl(var(--admin-primary))] hover:underline font-semibold">
                            Go to Attendance →
                        </Link>
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <QuickAction icon="person_add" label="Add Student" />
                    <Link href={`${basePath}/attendance`} className="contents">
                        <QuickAction icon="event_available" label="Attendance" />
                    </Link>
                    <QuickAction icon="warning" label="Log Incident" />
                    <QuickAction icon="search" label="Search Records" />
                </div>
            </div>
        </DashboardLayout>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="type-badge text-[hsl(var(--admin-text-muted))] mb-2 ml-1 px-1">{title}</p>
            {/* Mobile: compact list card */}
            <div className="sm:hidden ios-card p-0 overflow-hidden divide-y divide-[hsl(var(--admin-border))]">{children}</div>
            {/* Desktop/tablet: equal-height grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 auto-rows-fr">{children}</div>
        </div>
    );
}

const COLOR_MAP: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', icon: 'text-violet-600 dark:text-violet-400' },
    blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',   icon: 'text-blue-600 dark:text-blue-400' },
    green:  { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    teal:   { bg: 'bg-teal-100 dark:bg-teal-900/30',   icon: 'text-teal-600 dark:text-teal-400' },
    amber:  { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    rose:   { bg: 'bg-rose-100 dark:bg-rose-900/30',   icon: 'text-rose-600 dark:text-rose-400' },
    gray:   { bg: 'bg-gray-100 dark:bg-gray-900/30',   icon: 'text-gray-600 dark:text-gray-400' },
};

function NavCard({ href, label, description, icon, color }: { href: string; label: string; description: string; icon: string; color: string }) {
    const c = COLOR_MAP[color] || COLOR_MAP.blue;
    return (
        <Link href={href} className="group block active:opacity-70 transition-opacity h-full">
            {/* Mobile: list row */}
            <div className="sm:hidden flex items-center gap-3 px-4 py-3.5 hover:bg-[hsl(var(--admin-surface-alt))] active:bg-[hsl(var(--admin-surface-alt))] transition-colors min-h-[60px]">
                <div className={`w-10 h-10 ${c.bg} rounded-[12px] flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-[20px] ${c.icon}`}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="type-body-medium text-[hsl(var(--admin-text-main))]">{label}</p>
                    <p className="type-muted text-[hsl(var(--admin-text-muted))] truncate">{description}</p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-primary))] transition-colors flex-shrink-0">chevron_right</span>
            </div>
            {/* Desktop/tablet: card — h-full ensures equal height in grid */}
            <div className="hidden sm:flex h-full ios-card p-4 lg:p-5 items-start gap-4 hover:-translate-y-0.5 active:scale-[0.98] transition-all border border-transparent group-hover:border-[hsl(var(--admin-border))]">
                <div className={`w-11 h-11 lg:w-[52px] lg:h-[52px] ${c.bg} rounded-[12px] lg:rounded-[14px] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <span className={`material-symbols-outlined text-[22px] lg:text-[26px] ${c.icon}`}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                    <p className="type-card-title text-[hsl(var(--admin-text-main))] leading-snug">{label}</p>
                    <p className="type-muted text-[hsl(var(--admin-text-sub))] mt-0.5 line-clamp-2">{description}</p>
                </div>
            </div>
        </Link>
    );
}

function StatCard({ title, value, change, trend, icon, alert }: { title: string; value: string; change: string; trend: string; icon: string; alert?: boolean }) {
    return (
        <div className="stat-card h-full flex flex-col hover:-translate-y-0.5 transition-transform group cursor-pointer">
            <div className="flex items-start justify-between mb-auto">
                <div className={`p-2 sm:p-2.5 rounded-xl ${alert ? 'bg-red-100/80 dark:bg-red-900/30 text-red-600' : 'bg-[hsl(var(--admin-primary)/0.12)] text-[hsl(var(--admin-primary))]'}`}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[22px] transition-transform group-hover:scale-110">{icon}</span>
                </div>
                <span className={`type-metadata font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${trend === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : trend === 'down' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))]'}`}>
                    {change}
                </span>
            </div>
            <div className="mt-3 sm:mt-4">
                <p className="type-muted text-[hsl(var(--admin-text-muted))]">{title}</p>
                <h3 className="text-[22px] sm:text-[28px] font-bold leading-tight tracking-tight mt-0.5">{value}</h3>
            </div>
        </div>
    );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
    return (
        <button type="button" className="h-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl hover:bg-[hsl(var(--admin-surface-alt))] active:scale-[0.96] transition-all border border-transparent hover:border-[hsl(var(--admin-border)/0.5)] group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[hsl(var(--admin-surface-alt))] group-hover:bg-[hsl(var(--admin-primary)/0.1)] group-hover:text-[hsl(var(--admin-primary))] flex items-center justify-center transition-colors mb-2">
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">{icon}</span>
            </div>
            <span className="type-muted font-medium text-center text-[hsl(var(--admin-text-main))]">{label}</span>
        </button>
    );
}

const ATTENDANCE_COLORS: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600' },
};

function AttendanceStat({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
    const c = ATTENDANCE_COLORS[color] || ATTENDANCE_COLORS.green;
    return (
        <div className={`flex flex-col items-center justify-center p-2.5 sm:p-3 ${c.bg} rounded-xl`}>
            <span className={`material-symbols-outlined text-[20px] ${c.text}`}>{icon}</span>
            <p className={`text-[20px] sm:text-[22px] font-bold ${c.text} mt-1 leading-none`}>{value}</p>
            <p className="type-metadata text-[hsl(var(--admin-text-muted))] mt-1">{label}</p>
        </div>
    );
}

function TaskItem({ title, time, urgent }: { title: string; time: string; urgent?: boolean }) {
    return (
        <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] active:scale-[0.98] transition-all cursor-pointer">
            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${urgent ? 'bg-[hsl(var(--admin-danger))]' : 'bg-[hsl(var(--admin-primary))]'}`} />
            <div className="flex-1 min-w-0">
                <p className="type-muted text-[hsl(var(--admin-text-main))] truncate">{title}</p>
                <p className="type-metadata text-[hsl(var(--admin-text-muted))]">{time}</p>
            </div>
        </div>
    );
}

function NotifItem({ icon, text, time }: { icon: string; text: string; time: string }) {
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
