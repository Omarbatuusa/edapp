import { Star, BookOpen, Clock, Award, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getBehaviorSummary } from '../services/api';

interface FoundationDashboardProps {
    studentName: string;
    merits: number;
    onViewTasks: () => void;
    onViewFun: () => void;
    onLogout: () => void;
    onViewTimetable: () => void;
    onViewBadges: () => void;
    visibleModules?: string[];
}

export default function FoundationDashboard({
    studentName: propName,
    merits: propMerits,
    onViewTasks,
    onViewFun,
    onLogout,
    onViewTimetable,
    onViewBadges,
    visibleModules = ['academics', 'discipline']
}: FoundationDashboardProps) {
    const { user } = useAuth();
    const [merits, setMerits] = useState(propMerits || 0);
    const [firstName, setFirstName] = useState(propName || "Student");

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "Student");

            // Fetch real merits
            getBehaviorSummary().then(data => {
                if (data && typeof data.merits === 'number') {
                    setMerits(data.merits);
                }
            }).catch(console.error);
        }
    }, [user]);

    const hasModule = (mod: string) => visibleModules.includes(mod);
    return (
        <div className="min-h-screen bg-[#F0F9FF] font-comic p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-300 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/3"></div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg bg-orange-400 overflow-hidden">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUvWGhdnFTHnNWhmy7HMx3D1aVyZ9IjyL49OYMImFj-sanAvzCBAKi4Uf3voBKTl9wmAo-YIDBk7uymO5-eIuX5xOiaiYwysK_QSUocZQ1oicjCGrwcG-JqhKPLRLk861Zy-wu1YLscP6BwIBHZqiA5tToD4dDXPB-OkQ5sTwkVSkMfy-ZSrfwLdN67fIe64YQ9mDRHNvZpMRNy-raPT9Ky4KP4M05HfH3eOwxCT6NQ8SA6OhCa23w6nPIhfMLuWBQQ95oQiwuagI"
                            alt="Student"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-blue-600 font-bold uppercase tracking-wider">Hello!</span>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{firstName}</h1>
                    </div>
                </div>

                {/* Merit Counter (Gamified) */}
                <div className="bg-white rounded-2xl p-2 pr-4 flex items-center gap-2 shadow-lg border-2 border-yellow-100 transform rotate-2">
                    <div className="bg-yellow-400 text-white p-2 rounded-xl">
                        <Star className="h-6 w-6 fill-current" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-xl font-black text-slate-800">{merits}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Stars</span>
                    </div>
                </div>
            </header>

            {/* Main Action Grid */}
            <main className="relative z-10 grid grid-cols-2 gap-4">

                {/* Big Button: My Work */}
                <button
                    onClick={onViewTasks}
                    className="col-span-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-400/30 text-white flex items-center justify-between group active:scale-95 transition-transform"
                >
                    <div className="flex flex-col items-start text-left">
                        <div className="bg-white/20 p-3 rounded-2xl mb-3 group-hover:rotate-12 transition-transform">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-black">My Work</h2>
                        <p className="text-blue-100 font-medium">3 Tasks for today</p>
                    </div>
                    <div className="text-5xl opacity-20 rotate-12">📚</div>
                </button>

                {/* Button: Schedule */}
                <button
                    onClick={onViewTimetable}
                    className="bg-white rounded-3xl p-5 shadow-lg shadow-purple-500/10 border-2 border-purple-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                        <Clock className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-slate-700">Time Table</span>
                </button>

                {/* Button: Awards/Badges */}
                {hasModule('discipline') && (
                    <button
                        onClick={onViewBadges}
                        className="bg-white rounded-3xl p-5 shadow-lg shadow-green-500/10 border-2 border-green-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        <div className="bg-green-100 text-green-600 p-3 rounded-full">
                            <Award className="h-8 w-8" />
                        </div>
                        <span className="font-bold text-slate-700">My Badges</span>
                    </button>
                )}

                {/* Full Width: Fun Zone */}
                <button
                    onClick={onViewFun}
                    className="col-span-2 bg-gradient-to-r from-pink-500 to-orange-400 rounded-3xl p-6 shadow-xl shadow-orange-500/20 text-white flex items-center gap-4 active:scale-95 transition-transform"
                >
                    <div className="bg-white/20 p-3 rounded-full">
                        <PlayCircle className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-start">
                        <h2 className="text-xl font-black">Play & Learn</h2>
                        <p className="text-white/90 font-medium text-sm">Educational games & quizzes</p>
                    </div>
                </button>
            </main>

            {/* Logout / Back */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={onLogout}
                    className="text-slate-400 font-bold text-sm bg-slate-100 px-6 py-2 rounded-full hover:bg-slate-200 transition-colors"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}
