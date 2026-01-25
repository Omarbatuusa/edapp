import {
    Bell,
    CheckCircle,
    XCircle,
    CreditCard,
    MessageCircle,
    UserX,
    CalendarDays,
    Calculator,
    FileText,
    Megaphone,
    Home,
    GraduationCap,
    Menu,
    TriangleAlert,
    LifeBuoy
} from 'lucide-react';
import SchoolLifeFeed from './SchoolLifeFeed';
import { useAuth } from '../context/AuthContext';

interface ParentDashboardProps {
    onOpenHub?: () => void;
    onOpenAssignments?: () => void;
    onOpenEmergency?: () => void;
    onOpenSilentHelp?: () => void;
    onOpenProfile?: () => void;
    visibleModules?: string[];
}

export default function ParentDashboard({
    onOpenHub,
    onOpenAssignments,
    onOpenEmergency,
    onOpenSilentHelp,
    onOpenProfile,
    visibleModules = ['academics', 'discipline', 'attendance', 'finance', 'communication'] // Default all
}: ParentDashboardProps) {
    const { user } = useAuth();
    const hasModule = (mod: string) => visibleModules.includes(mod);

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200">
            {/* Top App Bar */}
            {/* Top App Bar */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 border-b border-gray-200/50 dark:border-white/10 shadow-sm transition-all duration-300">
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onOpenProfile}
                >
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt pointer-events-none"></div>
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-[3px] border-white dark:border-slate-800 shadow-md transform group-hover:scale-[1.02] transition-transform duration-200"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDbSWYFcETC0O_5OgHCiN1DHzARoUO9MnysMJiefE0q1aazYLcchg0fr_uc6p2Iarn32WECQuZDcwzxWlRPZzVmMl_Pq2W6ltU8JgJ5DNQjXaprJGXcr9mywFs0AFxg19nXWCZsV5VqayvHlpjk6ytdNanD1VDiujrDS2dkP5XJcp1MIZ2JMKn_lvuZS36h6fpX7qz9eIJqs-lz6dcKeu__X46_lXut-3IP_gH4SWNGQ4k_bpsLn1iAkVopG_UbPcOg1735Q_KOLl8")' }}
                            >
                            </div>
                            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-[2.5px] border-white dark:border-slate-800 shadow-sm z-10"></div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-normal text-text-secondary-light dark:text-text-secondary-dark">Welcome back</span>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">{user ? `${user.first_name} ${user.last_name || ''}` : 'Thabo M.'}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Demo Trigger: School Wide Alert */}
                    {hasModule('communication') && (
                        <button
                            onClick={onOpenEmergency}
                            className="flex items-center justify-center size-10 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/40 transition"
                        >
                            <TriangleAlert className="h-5 w-5" />
                        </button>
                    )}
                    {/* Demo Trigger: Silent Help */}
                    {hasModule('discipline') && (
                        <button
                            onClick={onOpenSilentHelp}
                            className="flex items-center justify-center size-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
                        >
                            <LifeBuoy className="h-5 w-5" />
                        </button>
                    )}

                    <button className="relative flex items-center justify-center rounded-full size-10 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-slate-900 dark:text-white transition hover:bg-slate-100 dark:hover:bg-[#232f48]">
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-2 right-2 flex size-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-2.5 bg-red-500"></span>
                        </span>
                    </button>
                </div>
            </header>

            {/* Main Content Scroll Area */}
            <main className="flex flex-col gap-6 pt-4">
                {/* Child Status Carousel */}
                <section className="flex flex-col gap-3">
                    <div className="px-4 flex justify-between items-end">
                        <h3 className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">My Children</h3>
                    </div>
                    <div className="flex overflow-x-auto hide-scrollbar px-4 gap-4 snap-x snap-mandatory pb-2">
                        {/* Child 1: Present */}
                        <div className="snap-center flex flex-col gap-0 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark min-w-[280px] overflow-hidden shadow-sm">
                            <div
                                className="relative h-28 w-full bg-cover bg-center"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBUvWGhdnFTHnNWhmy7HMx3D1aVyZ9IjyL49OYMImFj-sanAvzCBAKi4Uf3voBKTl9wmAo-YIDBk7uymO5-eIuX5xOiaiYwysK_QSUocZQ1oicjCGrwcG-JqhKPLRLk861Zy-wu1YLscP6BwIBHZqiA5tToD4dDXPB-OkQ5sTwkVSkMfy-ZSrfwLdN67fIe64YQ9mDRHNvZpMRNy-raPT9Ky4KP4M05HfH3eOwxCT6NQ8SA6OhCa23w6nPIhfMLuWBQQ95oQiwuagI")' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-3 left-3 text-white">
                                    <p className="text-lg font-bold">Zola M.</p>
                                    <p className="text-xs opacity-90">Grade 5 • St. Marks</p>
                                </div>
                                <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                    <CheckCircle className="h-3.5 w-3.5" /> Present
                                </div>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Last seen: 07:45 AM at Gate 2</div>
                                <button className="text-primary text-xs font-bold">View Profile</button>
                            </div>
                        </div>
                        {/* Child 2: Absent */}
                        <div className="snap-center flex flex-col gap-0 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark min-w-[280px] overflow-hidden shadow-sm">
                            <div
                                className="relative h-28 w-full bg-cover bg-center"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDV6SWXMcMvwG7daVg4ryYHTGmj2dFLeqTgl14DPqrBLq3jW2l0Wt0NinWQapThji4xOGzVA4rxIeejlNYWtX3HLnK_XjKG8OYyqra15OjPvjZzKAvGwg7Z7it0BbyI61EN4eIBZMZkaRs7wcyTQI1ZNGRgK9cyA3IYLoIjnIG56WLEG5cD-6gjTFHwYIYcEttw7I0ie0sIAybTMYtWKtPvJQAdj6-JmIsR-YuO3xWylkndeWkORYP9uhjC0fzWkfl25K4eZoPWn8g")' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-3 left-3 text-white">
                                    <p className="text-lg font-bold">Lefu K.</p>
                                    <p className="text-xs opacity-90">Grade 8 • St. Marks</p>
                                </div>
                                <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                    <XCircle className="h-3.5 w-3.5" /> Absent
                                </div>
                            </div>
                            <div className="p-3 flex justify-between items-center bg-red-500/5 dark:bg-red-500/10">
                                <div className="text-xs text-red-600 dark:text-red-400 font-medium">Please verify absence</div>
                                <button className="text-primary text-xs font-bold">Report</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Action Grid */}
                <section className="px-4">
                    <div className="grid grid-cols-2 gap-3">
                        {hasModule('finance') && (
                            <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-primary text-white p-4 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                                <CreditCard className="contents-inherit h-8 w-8" />
                                <span className="text-sm font-bold">Pay Fees</span>
                            </button>
                        )}
                        {hasModule('communication') && (
                            <button
                                onClick={onOpenHub}
                                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-4 active:scale-95 transition-transform hover:border-primary/50 group"
                            >
                                <MessageCircle className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Message</span>
                            </button>
                        )}
                        {hasModule('attendance') && (
                            <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-4 active:scale-95 transition-transform hover:border-primary/50 group">
                                <UserX className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Report Absence</span>
                            </button>
                        )}
                        <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-4 active:scale-95 transition-transform hover:border-primary/50 group">
                            <CalendarDays className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Calendar</span>
                        </button>
                    </div>
                </section>

                {/* Priority Cards: Homework */}
                <section className="flex flex-col px-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Homework Due</h3>
                        <a className="text-xs font-medium text-primary cursor-pointer" onClick={onOpenAssignments}>View All</a>
                    </div>
                    <div className="flex flex-col gap-3">
                        {/* Homework Item 1 */}
                        <div className="flex items-center gap-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-3 shadow-sm">
                            <div className="flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0 size-12">
                                <Calculator className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <p className="text-base font-bold truncate">Maths Worksheet</p>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Zola M. • Ch 4. Algebra</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Tomorrow</span>
                            </div>
                        </div>
                        {/* Homework Item 2 */}
                        <div className="flex items-center gap-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-3 shadow-sm">
                            <div className="flex items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0 size-12">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <p className="text-base font-bold truncate">History Essay</p>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Lefu K. • The Cold War</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Friday</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Announcements Section */}
                <section className="flex flex-col px-4 gap-2">
                    <h3 className="text-lg font-bold">Announcements</h3>
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-4 text-white shadow-md">
                        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/10 blur-xl"></div>
                        <div className="relative z-10 flex gap-3">
                            <div className="shrink-0 bg-white/20 p-2 rounded-lg h-fit">
                                <Megaphone className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="font-bold text-base">Early Closure on Friday</h4>
                                <p className="text-sm text-white/90 leading-relaxed">School closes at 12:00 PM for Staff Development. Please arrange transport.</p>
                                <p className="text-xs text-white/60 mt-1">Posted 2 hours ago</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Community Feed */}
                <SchoolLifeFeed />
            </main>

            {/* Bottom Navigation */}
            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 pb-[env(safe-area-inset-bottom,20px)] pt-2 px-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300">
                <div className="flex justify-around items-center h-16 pb-2 max-w-md mx-auto">
                    <button className="flex flex-col items-center gap-1.5 p-1 text-primary w-16 group">
                        <Home className="h-6 w-6 stroke-[2.5px] group-active:scale-95 transition-transform" />
                        <span className="text-[10px] font-bold">Home</span>
                    </button>
                    <button
                        onClick={onOpenAssignments}
                        className="flex flex-col items-center gap-1.5 p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition w-16 group"
                    >
                        <GraduationCap className="h-6 w-6 stroke-[2px] group-hover:stroke-[2.5px] group-active:scale-95 transition-all" />
                        <span className="text-[10px] font-medium">Academics</span>
                    </button>
                    <div className="relative -mt-6">
                        <button className="flex flex-col items-center justify-center size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 active:scale-95 transition-transform group">
                            <CreditCard className="h-6 w-6 stroke-[2.5px]" />
                        </button>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 absolute -bottom-4 left-1/2 -translate-x-1/2 w-max mt-1">Pay</span>
                    </div>
                    <button
                        onClick={onOpenHub}
                        className="flex flex-col items-center gap-1.5 p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition w-16 group"
                    >
                        <MessageCircle className="h-6 w-6 stroke-[2px] group-hover:stroke-[2.5px] group-active:scale-95 transition-all" />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition w-16 group">
                        <Menu className="h-6 w-6 stroke-[2px] group-hover:stroke-[2.5px] group-active:scale-95 transition-all" />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </div>
            </nav>
            {/* Safe Area Spacer */}
            <div className="h-8"></div>
        </div>
    );
}
