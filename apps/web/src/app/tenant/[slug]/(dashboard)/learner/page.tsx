'use client';

import { BookOpen, Star, Trophy, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import AttendanceCapture from '../../../../../components/attendance/AttendanceCapture';

export default function LearnerDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 p-8 bg-[hsl(var(--admin-primary))] rounded-[24px] text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <h1 className="text-[28px] font-bold tracking-tight mb-2 relative z-10">Welcome back, Bart!</h1>
                    <p className="text-[16px] font-medium text-white/80 relative z-10">You have 3 assignments due this week.</p>
                </div>
                <div className="flex items-center">
                    <AttendanceCapture
                        endpoint={`${API_URL}/attendance/learner/mark`}
                        headers={{ 'x-tenant-id': slug }}
                        label="Mark Attendance"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ios-card overflow-hidden">
                    <h2 className="font-semibold mb-6 flex items-center gap-2 text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">
                        <Star size={20} className="text-[hsl(var(--admin-warning))]" />
                        Recent Achievements
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                        <div className="w-24 flex flex-col items-center text-center group cursor-pointer">
                            <div className="w-14 h-14 bg-[hsl(var(--admin-warning))/0.1] rounded-[16px] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Trophy size={24} className="text-[hsl(var(--admin-warning))]" />
                            </div>
                            <span className="text-[13px] font-bold text-[hsl(var(--admin-text-main))]">Math Whiz</span>
                        </div>
                    </div>
                </div>

                <div className="ios-card overflow-hidden">
                    <h2 className="font-semibold mb-6 flex items-center gap-2 text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">
                        <Clock size={20} className="text-[hsl(var(--admin-primary))]" />
                        Next Class
                    </h2>
                    <div className="p-5 bg-[hsl(var(--admin-surface))] rounded-[16px] border border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/0.3] transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-[17px] tracking-tight text-[hsl(var(--admin-text-main))] group-hover:text-[hsl(var(--admin-primary))] transition-colors">History</h3>
                                <p className="text-[14px] font-medium text-[hsl(var(--admin-text-sub))] mt-0.5">Mr. Bergstrom</p>
                            </div>
                            <span className="bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] px-3 py-1.5 rounded-[10px] text-[13px] font-bold shadow-sm">
                                10:00 AM
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
