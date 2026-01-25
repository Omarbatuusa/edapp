import { BookOpen, Calendar, Award, Briefcase, GraduationCap, Clock, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

interface SeniorDashboardProps {
    studentName: string;
    grade: string; // e.g., "11A"
    onViewSubjects: () => void;
    onViewCareer: () => void;
    onViewTimetable: () => void;
    onViewResults: () => void;
    onLogout: () => void;
    visibleModules?: string[];
}

export default function SeniorDashboard({
    studentName: propName,
    grade: propGrade,
    onViewSubjects,
    onViewCareer,
    onViewTimetable,
    onViewResults,
    onLogout,
    visibleModules = ['academics']
}: SeniorDashboardProps) {
    const { user } = useAuth();
    const [name, setName] = useState(propName || "Lefu");
    const [grade, setGrade] = useState(propGrade || "11A");

    useEffect(() => {
        if (user) {
            setName(user.first_name || "Student");
            // @ts-ignore - 'grade' and 'phase' are dynamic on the user object now
            if (user.grade) setGrade(user.grade);
        }
    }, [user]);

    const hasModule = (mod: string) => visibleModules.includes(mod);
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Professional Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome, {name}</h1>
                        <p className="text-sm text-slate-500 font-medium">Grade {grade} • FET Phase</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV6SWXMcMvwG7daVg4ryYHTGmj2dFLeqTgl14DPqrBLq3jW2l0Wt0NinWQapThji4xOGzVA4rxIeejlNYWtX3HLnK_XjKG8OYyqra15OjPvjZzKAvGwg7Z7it0BbyI61EN4eIBZMZkaRs7wcyTQI1ZNGRgK9cyA3IYLoIjnIG56WLEG5cD-6gjTFHwYIYcEttw7I0ie0sIAybTMYtWKtPvJQAdj6-JmIsR-YuO3xWylkndeWkORYP9uhjC0fzWkfl25K4eZoPWn8g"
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6">

                {/* Focus: Tasks & Deadlines */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Up Next
                        </h2>
                        <span className="text-xs font-semibold text-primary cursor-pointer">View Calendar</span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Physical Sciences Test</h3>
                                <p className="text-sm text-slate-500 mt-1">Newton's Laws • Mr. Naidoo</p>
                            </div>
                            <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded">10:00 AM</span>
                        </div>
                    </div>
                </section>

                {/* Core Modules Grid */}
                <section className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onViewSubjects}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:border-blue-500"
                    >
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-sm">My Subjects</span>
                    </button>

                    {hasModule('academics') && (
                        <button
                            onClick={onViewCareer}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:border-purple-500"
                        >
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-sm">Career Mode</span>
                        </button>
                    )}

                    <button
                        onClick={onViewTimetable}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:border-green-500"
                    >
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-sm">Timetable</span>
                    </button>

                    {hasModule('academics') && (
                        <button
                            onClick={onViewResults}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:border-orange-500"
                        >
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-sm">Results</span>
                        </button>
                    )}
                </section>

                {/* Career / Future Focus Widget */}
                <section className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <GraduationCap className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">University Readiness</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">Bachelor Pass Tracker</h3>
                        <p className="text-sm opacity-70 mb-4">You are on track for a Bachelor's pass. Keep your Math mark above 50%.</p>

                        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-400 h-full w-[75%]"></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1 opacity-60">
                            <span>Current APS: 32</span>
                            <span>Goal: 35</span>
                        </div>
                    </div>
                </section>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="w-full text-center text-slate-400 text-sm font-medium py-4 hover:text-slate-600 transition-colors"
                >
                    Sign Out
                </button>
            </main>
        </div>
    );
}
