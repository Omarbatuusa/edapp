'use client';

import { use, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    TrendingUp,
    AlertTriangle,
    Calendar,
    ArrowRight,
    Search
} from 'lucide-react';

interface Props { params: Promise<{ slug: string }> }

const PLATFORM_ROLES = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin'];
const SECRETARY_ROLES = ['PLATFORM_SECRETARY'];
const TENANT_ROLES = ['TENANT_ADMIN', 'MAIN_BRANCH_ADMIN'];
const BRANCH_ROLES = ['TENANT_ADMIN', 'MAIN_BRANCH_ADMIN', 'BRANCH_ADMIN', 'PLATFORM_SUPER_ADMIN', 'platform_admin'];

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
    const isPlatform = PLATFORM_ROLES.some(r => role.includes(r) || r.includes(role));
    const isSecretary = SECRETARY_ROLES.some(r => role.includes(r) || r.includes(role));
    const isTenantAdmin = TENANT_ROLES.some(r => role.includes(r) || r.includes(role));
    const canManageBranches = BRANCH_ROLES.some(r => role.includes(r) || r.includes(role));

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Overview of school performance and alerts.</p>
                </div>
                <div className="flex gap-2">
                    <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                        Generate Report
                    </button>
                    <button className="h-9 px-4 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors">
                        Settings
                    </button>
                </div>
            </div>

            {/* Platform Management (Super Admin + App Admin) */}
            {isPlatform && (
                <NavSection title="Platform Management">
                    <NavCard href={`/tenant/${slug}/admin/tenants`} label="Tenants" description="View and manage all school tenants" icon="domain" color="indigo" />
                    <NavCard href={`/tenant/${slug}/admin/brands`} label="Brand Management" description="Manage school brands and groups" icon="category" color="purple" />
                    <NavCard href={`/tenant/${slug}/admin/dictionaries`} label="Dictionaries" description="Phases, grades, subjects, languages" icon="menu_book" color="violet" />
                </NavSection>
            )}

            {/* School Setup (Platform + Tenant Admin) */}
            {canManageBranches && (
                <NavSection title="School Setup">
                    <NavCard href={`/tenant/${slug}/admin/main-branch`} label="Main Branch Setup" description="Configure your primary school profile" icon="account_balance" color="blue" />
                    <NavCard href={`/tenant/${slug}/admin/branches`} label="Branch Management" description="Manage campuses and branches" icon="location_city" color="green" />
                </NavSection>
            )}

            {/* App Secretary */}
            {isSecretary && (
                <NavSection title="Secretary Tools">
                    <NavCard href={`/tenant/${slug}/admin/inbox`} label="Inbox / Tasks" description="View pending tasks and approvals" icon="inbox" color="orange" />
                    <NavCard href={`/tenant/${slug}/admin/tenants`} label="Tenants Lookup" description="Search tenants by school code" icon="search" color="gray" />
                    <NavCard href={`/tenant/${slug}/admin/approvals`} label="Approvals" description="Process pending approvals" icon="task_alt" color="teal" />
                </NavSection>
            )}

            {/* Tenant Admin */}
            {isTenantAdmin && (
                <NavSection title="School Administration">
                    <NavCard href={`/tenant/${slug}/admin/control`} label="Control Dashboard" description="School overview and quick links" icon="dashboard" color="blue" />
                    <NavCard href={`/tenant/${slug}/admin/integrations`} label="Integrations & Features" description="Feature flags and external systems" icon="integration_instructions" color="amber" />
                    <NavCard href={`/tenant/${slug}/admin/people`} label="People & Roles" description="Manage users and role assignments" icon="group" color="teal" />
                    <NavCard href={`/tenant/${slug}/admin/school-data`} label="School Data" description="Phases, grades and subject offerings" icon="school" color="green" />
                    <NavCard href={`/tenant/${slug}/admin/admissions`} label="Admissions Builder" description="Design your admissions process" icon="assignment" color="rose" />
                </NavSection>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Students"
                    value="1,240"
                    change="+12%"
                    trend="up"
                    icon={Users}
                />
                <StatCard
                    title="Attendance"
                    value="94%"
                    change="-2%"
                    trend="down"
                    icon={Calendar}
                />
                <StatCard
                    title="Incidents"
                    value="3"
                    change="Low"
                    trend="neutral"
                    icon={AlertTriangle}
                    alert
                />
                <StatCard
                    title="Revenue"
                    value="R 840k"
                    change="+5%"
                    trend="up"
                    icon={TrendingUp}
                />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Access */}
                    <div className="surface-card p-6">
                        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <QuickAction icon={Users} label="Add Student" />
                            <QuickAction icon={Calendar} label="Edit Timetable" />
                            <QuickAction icon={AlertTriangle} label="Log Incident" />
                            <QuickAction icon={Search} label="Search Records" />
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="surface-card p-6 min-h-[300px] flex items-center justify-center bg-secondary/5 border-dashed border-2 border-border">
                        <p className="text-muted-foreground font-medium">Attendance Trends Chart (Coming Soon)</p>
                    </div>
                </div>

                {/* Sidebar / Feed */}
                <div className="space-y-6">
                    <div className="surface-card p-5">
                        <h3 className="font-semibold mb-4">Urgent Tasks</h3>
                        <div className="space-y-3">
                            <TaskItem title="Approve Leave Request" time="2h ago" urgent />
                            <TaskItem title="Review Incident Report #102" time="4h ago" urgent />
                            <TaskItem title="Monthly Fee Reconciliation" time="1d ago" />
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors">
                            View All Tasks
                        </button>
                    </div>

                    <div className="surface-card p-5">
                        <h3 className="font-semibold mb-4">Staff On Leave</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">EK</div>
                                <div>
                                    <p className="text-sm font-medium">Edna Krabappel</p>
                                    <p className="text-xs text-muted-foreground">Sick Leave</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, alert }: any) {
    return (
        <div className="surface-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${alert ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                    <Icon size={20} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' :
                    trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-secondary text-secondary-foreground'
                    }`}>
                    {change}
                </span>
            </div>
            <div>
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
            </div>
        </div>
    )
}

function QuickAction({ icon: Icon, label }: any) {
    return (
        <button className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50 group">
            <div className="w-12 h-12 rounded-full bg-secondary group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors mb-2">
                <Icon size={24} />
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
        </button>
    )
}

function TaskItem({ title, time, urgent }: any) {
    return (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${urgent ? 'bg-red-500' : 'bg-blue-500'}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
                <p className="text-xs text-muted-foreground">{time}</p>
            </div>
            <ArrowRight size={14} className="mt-1 text-muted-foreground/50" />
        </div>
    )
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    );
}

const COLOR_MAP: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-200', icon: 'text-indigo-600 dark:text-indigo-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200', icon: 'text-purple-600 dark:text-purple-400' },
    violet: { bg: 'bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200', icon: 'text-violet-600 dark:text-violet-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200', icon: 'text-green-600 dark:text-green-400' },
    teal: { bg: 'bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200', icon: 'text-teal-600 dark:text-teal-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200', icon: 'text-amber-600 dark:text-amber-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200', icon: 'text-orange-600 dark:text-orange-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/30 group-hover:bg-rose-200', icon: 'text-rose-600 dark:text-rose-400' },
    gray: { bg: 'bg-gray-100 dark:bg-gray-900/30 group-hover:bg-gray-200', icon: 'text-gray-600 dark:text-gray-400' },
};

function NavCard({ href, label, description, icon, color }: { href: string; label: string; description: string; icon: string; color: string }) {
    const c = COLOR_MAP[color] || COLOR_MAP.blue;
    return (
        <Link href={href} className="surface-card p-5 flex items-center gap-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all group cursor-pointer border border-transparent">
            <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors`}>
                <span className={`material-symbols-outlined ${c.icon}`}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
        </Link>
    );
}
