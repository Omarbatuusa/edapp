import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Calendar,
    Star,
    Clock,
    CheckCircle,
    MoreHorizontal,
    Upload,
    Plus,
    Loader
} from 'lucide-react';
import { learnerService, type Assignment } from '../services/learnerService';

interface HomeworkAssignmentsProps {
    onBack: () => void;
}

type Tab = 'Active' | 'Overdue' | 'Completed';

export default function HomeworkAssignments({ onBack }: HomeworkAssignmentsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Active');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAssignments = async () => {
            try {
                const data = await learnerService.getAssignments();
                setAssignments(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load assignments');
            } finally {
                setLoading(false);
            }
        };
        loadAssignments();
    }, []);

    const subjects = ['All', ...Array.from(new Set(assignments.map(a => a.subject)))];

    if (loading) return <div className="flex h-screen items-center justify-center dark:bg-slate-900"><Loader className="animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-4 text-center text-red-500 dark:bg-slate-900 h-screen">{error}</div>;

    // Filter logic
    const filteredAssignments = assignments.filter(a => {
        if (activeTab === 'Active') return a.status === 'Active';
        if (activeTab === 'Overdue') return a.status === 'Overdue'; // Mock data doesn't return overdue yet
        if (activeTab === 'Completed') return a.status === 'Completed';
        return true;
    });

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col max-w-2xl mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden pb-24">
            {/* Top Navigation / Header */}
            <header className="flex flex-col gap-2 p-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-10 transition-colors duration-200">
                <div className="flex items-center justify-between h-12">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBack}
                            className="text-slate-900 dark:text-white flex items-center justify-center -ml-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Wednesday, 24 Oct</span>
                            <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">My Assignments</h1>
                        </div>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white transition-colors">
                        <Calendar className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Gamification / Progress Bar */}
            <section className="px-4 py-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Star className="fill-yellow-400 text-yellow-400 h-5 w-5" />
                            <p className="text-slate-900 dark:text-white text-base font-bold">Weekly Star Goal</p>
                        </div>
                        <span className="text-primary text-sm font-bold bg-primary/10 px-2 py-0.5 rounded-lg">Level 4</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between mt-2">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-medium">3/4 Tasks Done</p>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-medium">Keep it up! 🚀</p>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="flex flex-col gap-4 py-2 transition-colors duration-200">
                {/* Segmented Buttons (Status) */}
                <div className="px-4">
                    <div className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800 p-1">
                        {['Active', 'Overdue', 'Completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as Tab)}
                                className={`flex-1 flex items-center justify-center rounded-lg text-sm font-medium transition-all h-full ${activeTab === tab
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chips (Subjects) */}
                <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar pb-1">
                    {subjects.map((subject, index) => (
                        <button
                            key={subject}
                            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium transition-colors ${index === 0
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-200'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </section>

            {/* Assignments List */}
            <main className="flex flex-col gap-4 p-4 transition-colors duration-200">

                {activeTab === 'Active' && (
                    <>
                        {filteredAssignments.map((assignment) => (
                            <div key={assignment.id} className="relative flex flex-col gap-0 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-md transition-shadow">
                                {assignment.urgent && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wide">Due {assignment.dueDate}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-4 items-stretch">
                                    <div className="flex flex-1 flex-col justify-between gap-3 z-10">
                                        <div className="flex flex-col gap-1 pr-24">
                                            <p className="text-primary text-sm font-semibold tracking-wide uppercase">{assignment.subject}</p>
                                            <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight line-clamp-2">{assignment.title}</h3>
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">{assignment.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <button className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-blue-600 transition w-fit active:scale-95">
                                                <Upload className="h-[18px] w-[18px]" />
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredAssignments.length === 0 && <p className="text-center text-slate-500 py-10">No active assignments</p>}
                    </>
                )}

                {/* Completed Example (Visually dimmer or distinct) */}
                {activeTab === 'Completed' && (
                    <div className="flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 shrink-0">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <p className="text-text-secondary-light dark:text-slate-500 text-xs font-medium uppercase">English • Completed</p>
                            <p className="text-slate-900 dark:text-slate-400 text-base font-bold decoration-slate-400">Poetry Analysis</p>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">8/10</span>
                            <p className="text-xs text-text-secondary-light dark:text-slate-500">Grade</p>
                        </div>
                    </div>
                )}

                {activeTab === 'Overdue' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                        <p className="text-slate-600 dark:text-slate-400 font-medium">No overdue assignments!</p>
                        <p className="text-xs text-slate-400">You're doing great.</p>
                    </div>
                )}

            </main>

            {/* Floating Action Button */}
            <button className="fixed bottom-24 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-lg shadow-blue-500/30 text-white hover:scale-105 active:scale-95 transition-transform">
                <Plus className="h-7 w-7" />
            </button>

            {/* Bottom Navigation Bar */}
        </div>
    );
}
