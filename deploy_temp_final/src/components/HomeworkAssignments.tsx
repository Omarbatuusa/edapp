import { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    Star,
    Clock,
    CheckCircle,
    MoreHorizontal,
    Upload,
    Plus
} from 'lucide-react';

interface HomeworkAssignmentsProps {
    onBack: () => void;
}

type Tab = 'Active' | 'Overdue' | 'Completed';

export default function HomeworkAssignments({ onBack }: HomeworkAssignmentsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Active');

    const subjects = ['All', 'Mathematics', 'History', 'English', 'Natural Science', 'Art'];

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
                        {/* Card 1: Urgent / Active */}
                        <div className="relative flex flex-col gap-0 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-md transition-shadow">
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Due Tomorrow</span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-stretch">
                                {/* Content Side */}
                                <div className="flex flex-1 flex-col justify-between gap-3 z-10">
                                    <div className="flex flex-col gap-1 pr-24">
                                        <p className="text-primary text-sm font-semibold tracking-wide uppercase">Mathematics</p>
                                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight line-clamp-2">Fractions Worksheet</h3>
                                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">Pages 42-45 in workbook</p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-blue-600 transition w-fit active:scale-95">
                                            <Upload className="h-[18px] w-[18px]" />
                                            Submit
                                        </button>
                                        <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-700 text-text-secondary-light dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                {/* Image Side - Hidden on smallest screens if needed, but flex layout handles it */}
                                <div
                                    className="hidden sm:block w-24 h-24 shrink-0 rounded-lg bg-center bg-cover bg-no-repeat shadow-inner"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCOf910pMvPFwPT5V03QEBMjZ4rK8kcu4tP7-bhYd11eN483gPvnrY0CkdobnxO_Sb-3T1SCgnh6XaqpwGdkpCETrX18UsAj6r8eYXQUB2EYY10i4z563fIk14C0DHS04TI48GnoPo7Cn5lHBmG6d7zYlEuDXDKQ7gRdF65OsfAdDjezadmLwjX6YA5ko5a7Pf_eIFqHf4S_vcgQrli3qpiNOfjPKTf8FMtL1TPW3s3ywF9uwL4eEa3mh8fdkADFrDBOpKu6V08Iuo")' }}
                                ></div>
                            </div>
                        </div>

                        {/* Card 2: Draft / In Progress */}
                        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="flex flex-[2_2_0px] flex-col gap-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-orange-500 text-sm font-medium">History</p>
                                        <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded sm:hidden">Due Fri</span>
                                    </div>
                                    <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Nelson Mandela Essay</p>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">Draft Saved • Due Friday</p>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <button className="flex items-center justify-center gap-2 h-8 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium w-fit hover:bg-slate-200 dark:hover:bg-slate-600 transition active:scale-95">
                                        Continue
                                    </button>
                                </div>
                            </div>
                            <div
                                className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 shadow-inner"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAQB8QMM9RqnKVFo3Rl5c90CWaX68gAJjWVqnHr9fMw7XMhNDwEnlwdx1O8-QIuBzbvIqvfMfix4WPOxUATEcgMQq7uvYPHCpZZbCT_seYUeTagW_tKn2QSE4qLAl1XqznyzTQyFHL5cfV86XgeKEQslWb3-9Dj0w9dKhg7zJjmrk6LAuoJtM3x74jBFAN-zAASBofNOWs77wr74NcwPN7tR2a-PNbolbCnpOldYBnjpB8cj2dEdDbYuEQActzAH4sJPAXokdqral4")' }}
                            ></div>
                        </div>

                        {/* Card 3: Standard / Low Urgency */}
                        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 opacity-90 hover:opacity-100 transition-opacity">
                            <div className="flex flex-[2_2_0px] flex-col gap-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-purple-500 text-sm font-medium">Natural Science</p>
                                        <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded sm:hidden">Next Week</span>
                                    </div>
                                    <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Solar System Model</p>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">Project • Due 12 Nov</p>
                                </div>
                                <div className="mt-2">
                                    <button className="flex items-center justify-center gap-2 h-8 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 text-text-secondary-light dark:text-slate-300 text-sm font-medium w-fit hover:bg-slate-200 dark:hover:bg-slate-600 transition active:scale-95">
                                        View Details
                                    </button>
                                </div>
                            </div>
                            <div
                                className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 shadow-inner"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC_j9LadxQPFTI97UvlyWelA5FTzKb5wdmgR3z-IFT9hXLFBKrDihLGbvnZL6p2KDKQg8kGVzCKLea0tXskskD2t7McFb0ZE99V6CHPn5iaQ1OPUEGnpNIhELB0BL-QRxEKia3249pgmz014mdhdlWwCGceHnBQDywOnS-qsuY9wM7cvn98EIOm8X2LkobF_nxOBrc8oYMdXOU62tOvBNA047keOQ7O-4D0P9-zP0xKzdGIm6PpQozmT0JE3cWCzupLILtxsNGYAQo")' }}
                            ></div>
                        </div>
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
