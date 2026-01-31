'use client'

import { use, useState, useEffect } from 'react'
import { useRole, UserRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'

interface TenantData {
    school_name: string
    tenant_slug: string
}

interface QuickAction {
    label: string
    icon: string
    href: string
    color: string
}

const ROLE_QUICK_ACTIONS: Record<UserRole, QuickAction[]> = {
    admin: [
        { label: 'Add User', icon: 'person_add', href: '/people/add', color: 'bg-purple-500' },
        { label: 'New Class', icon: 'add_circle', href: '/classes/add', color: 'bg-blue-500' },
        { label: 'Reports', icon: 'bar_chart', href: '/reports', color: 'bg-green-500' },
        { label: 'Settings', icon: 'settings', href: '/settings', color: 'bg-slate-500' },
    ],
    staff: [
        { label: 'Take Attendance', icon: 'fact_check', href: '/attendance', color: 'bg-blue-500' },
        { label: 'Grade Book', icon: 'grading', href: '/grades', color: 'bg-green-500' },
        { label: 'Messages', icon: 'chat', href: '/messages', color: 'bg-purple-500' },
        { label: 'Calendar', icon: 'calendar_month', href: '/calendar', color: 'bg-orange-500' },
    ],
    parent: [
        { label: 'View Progress', icon: 'trending_up', href: '/progress', color: 'bg-green-500' },
        { label: 'Make Payment', icon: 'payments', href: '/payments', color: 'bg-blue-500' },
        { label: 'Messages', icon: 'chat', href: '/messages', color: 'bg-purple-500' },
        { label: 'Calendar', icon: 'calendar_month', href: '/calendar', color: 'bg-orange-500' },
    ],
    learner: [
        { label: 'My Courses', icon: 'menu_book', href: '/courses', color: 'bg-blue-500' },
        { label: 'Assignments', icon: 'assignment', href: '/assignments', color: 'bg-purple-500' },
        { label: 'Grades', icon: 'grade', href: '/grades', color: 'bg-green-500' },
        { label: 'Calendar', icon: 'calendar_month', href: '/calendar', color: 'bg-orange-500' },
    ],
}

const ROLE_GREETING: Record<UserRole, string> = {
    admin: 'Welcome back, Admin',
    staff: 'Welcome back, Teacher',
    parent: 'Welcome back',
    learner: 'Welcome back, Student',
}

export default function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { currentRole } = useRole()
    const { user } = useAuth()
    const [tenant, setTenant] = useState<TenantData | null>(null)

    // Fetch tenant info
    useEffect(() => {
        async function fetchTenant() {
            try {
                let res = await fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`)
                if (!res.ok) {
                    res = await fetch(`/v1/tenants/lookup-by-code?code=${slug.toUpperCase()}`)
                }
                if (res.ok) {
                    const data = await res.json()
                    setTenant(data)
                }
            } catch (err) {
                // Fail silently
            }
        }
        fetchTenant()
    }, [slug])

    const quickActions = ROLE_QUICK_ACTIONS[currentRole] || ROLE_QUICK_ACTIONS.parent
    const greeting = ROLE_GREETING[currentRole] || 'Welcome'
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'

    return (
        <div className="px-4 py-6 max-w-5xl mx-auto">
            {/* Greeting Section */}
            <section className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    {greeting}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {displayName} · {tenant?.school_name || 'Loading...'}
                </p>
            </section>

            {/* Quick Actions Grid */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                                <span className="material-symbols-outlined text-white text-2xl">{action.icon}</span>
                            </div>
                            <span className="text-sm font-medium text-center">{action.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Recent Activity / Announcements */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Recent Activity
                </h2>
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Placeholder items */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-slate-400 text-xl">notifications</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">No recent activity</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Activities will appear here</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Upcoming Events */}
            <section>
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Upcoming
                </h2>
                <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex flex-col items-center justify-center text-center py-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">event_available</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming events</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
