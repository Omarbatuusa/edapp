'use client';

import { Users, BookOpen, Calendar, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import AttendanceCapture from '../../../../../components/attendance/AttendanceCapture';

export default function StaffDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Staff Dashboard</h1>
                <div className="w-full max-w-xs">
                    <AttendanceCapture
                        endpoint={`${API_URL}/attendance/staff/check-in`}
                        headers={{ 'x-tenant-id': slug }}
                        label="Staff Check-In"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="surface-card p-6 col-span-2">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        My Classes
                    </h2>
                    <div className="space-y-3">
                        {['Grade 10 - Mathematics', 'Grade 11 - Physics', 'Grade 9 - Natural Science'].map((cls) => (
                            <div key={cls} className="p-3 bg-secondary/30 rounded-lg flex justify-between items-center">
                                <span className="font-medium text-sm">{cls}</span>
                                <button className="text-xs font-medium text-primary hover:underline">View Register</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="surface-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-primary" />
                        Upcoming
                    </h2>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-10 text-center">
                                <span className="block text-xs font-bold text-muted-foreground uppercase">Today</span>
                                <span className="block text-lg font-bold">09:00</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Department Meeting</p>
                                <p className="text-xs text-muted-foreground">Staff Room 1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
