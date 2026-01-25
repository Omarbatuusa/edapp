import { useState } from 'react';
import { Users, CalendarCheck, Megaphone, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StaffDashboard from './StaffDashboard';

// We can reuse StaffDashboard as the shell, but pass specific props/config
// OR Create a dedicated layout if significantly different.
// StaffDashboard already handles dynamic config based on role.
// So this component might just be the "Smart Wrapper" that decides what to render based on selection?
// Actually, TenantLanding renders StaffDashboard directly.
// Let's see: TenantLanding uses <StaffDashboard ... onViewStudents={...} />
// The requirement is to implement the logic for "My Class" and "Attendance" VIEWS.
// EducatorDashboard.tsx might not be needed as a separate shell if StaffDashboard handles it.
// BUT, `task.md` says "Implement EducatorDashboard.tsx logic".
// Let's treat EducatorDashboard as the specialized version of StaffDashboard for the "educator" scope.
// However, looking at TenantLanding, it renders <StaffDashboard> for both Admin and Educator.
// Providing a separate <EducatorDashboard> might be cleaner if we want custom widgets.
// For now, let's Stick to the Plan: Create EducatorDashboard.tsx, 
// likely wrapping StaffDashboard or replacing it in TenantLanding for educators.

// DECISION: Replace generic <StaffDashboard> in TenantLanding for 'educator' role with <EducatorDashboard>
// to allow specific widget logic (like "Next Class: 11A").

interface EducatorDashboardProps {
    onLogout: () => void;
    onViewClass: () => void;
    onViewAttendance: () => void;
    visibleModules?: string[];
}

export default function EducatorDashboard({ onLogout, onViewClass, onViewAttendance, visibleModules }: EducatorDashboardProps) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 p-4 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</p>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.first_name}</h1>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                        {user?.first_name[0]}{user?.last_name[0]}
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* Hero Widget: Next Class */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">NEXT CLASS</span>
                        <LayoutDashboard className="h-5 w-5 opacity-80" />
                    </div>
                    <h2 className="text-3xl font-bold mb-1">Grade 11A</h2>
                    <p className="opacity-90 text-sm mb-4">Mathematics • Room 12</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onViewAttendance}
                            className="flex-1 bg-white text-blue-700 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-sm"
                        >
                            Mark Register
                        </button>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 px-1">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onViewClass}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">My Class</span>
                        </button>

                        <button
                            onClick={onViewAttendance}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                <CalendarCheck className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Attendance</span>
                        </button>

                        <button
                            onClick={() => console.log('Announce')}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className="h-12 w-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Megaphone className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Announce</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
