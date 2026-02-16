'use client';

import { BookOpen, Star, Trophy, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import AttendanceCapture from '../../../../../components/attendance/AttendanceCapture';

export default function LearnerDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 p-6 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Welcome back, Bart!</h1>
                    <p className="opacity-90">You have 3 assignments due this week.</p>
                </div>
                <div>
                    <AttendanceCapture
                        endpoint={`${API_URL}/attendance/learner/mark`}
                        headers={{ 'x-tenant-id': slug }}
                        label="Mark Attendance"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="surface-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <Star size={20} className="text-yellow-500" />
                        Recent Achievements
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        <div className="w-24 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                                <Trophy size={20} className="text-yellow-600" />
                            </div>
                            <span className="text-xs font-medium">Math Whiz</span>
                        </div>
                    </div>
                </div>

                <div className="surface-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" />
                        Next Class
                    </h2>
                    <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">History</h3>
                                <p className="text-sm text-muted-foreground">Mr. Bergstrom</p>
                            </div>
                            <span className="bg-white dark:bg-black/20 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                10:00 AM
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
