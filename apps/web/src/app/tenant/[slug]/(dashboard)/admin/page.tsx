'use client';

import { use, useState } from 'react';
import {
    Users,
    TrendingUp,
    AlertTriangle,
    Calendar,
    ArrowRight,
    Search
} from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Overview of school performance and alerts.</p>
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
