'use client';

import { Users, BookOpen, Calendar, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import AttendanceCapture from '../../../../../components/attendance/AttendanceCapture';

export default function StaffDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-1">Staff Dashboard</h1>
                    <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))]">Quick overview of your schedule and classes.</p>
                </div>
                <div className="w-full md:max-w-xs">
                    <AttendanceCapture
                        endpoint={`${API_URL}/attendance/staff/check-in`}
                        headers={{ 'x-tenant-id': slug }}
                        label="Staff Check-In"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="ios-card col-span-1 md:col-span-2">
                    <h2 className="font-semibold mb-4 flex items-center gap-2 text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">
                        <BookOpen size={20} className="text-[hsl(var(--admin-primary))]" />
                        My Classes
                    </h2>
                    <div className="space-y-3">
                        {['Grade 10 - Mathematics', 'Grade 11 - Physics', 'Grade 9 - Natural Science'].map((cls) => (
                            <div key={cls} className="p-4 bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors border border-[hsl(var(--admin-border))] rounded-[16px] flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <span className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))]">{cls}</span>
                                <button className="text-[13px] font-bold text-[hsl(var(--admin-surface))] bg-[hsl(var(--admin-text-main))] px-4 py-1.5 rounded-full hover:bg-[hsl(var(--admin-text-main))/0.8] active:scale-95 transition-all w-fit shadow-sm">View Register</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ios-card overflow-hidden">
                    <h2 className="font-semibold mb-4 flex items-center gap-2 text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">
                        <Calendar size={20} className="text-[hsl(var(--admin-primary))]" />
                        Upcoming
                    </h2>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-[16px] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer group">
                            <div className="w-12 text-center flex-shrink-0 flex flex-col items-center justify-center bg-[hsl(var(--admin-primary))/0.1] rounded-[12px] p-2 transition-colors">
                                <span className="block text-[11px] font-bold text-[hsl(var(--admin-primary))] uppercase tracking-wider mb-0.5">Today</span>
                                <span className="block text-[16px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">09:00</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] tracking-tight group-hover:text-[hsl(var(--admin-primary))] transition-colors w-full">Department Meeting</p>
                                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))]">Staff Room 1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
