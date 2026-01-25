import {
    ArrowLeft,
    Camera,
    Verified,
    FlaskConical,
    GraduationCap,
    Calendar,
    Mail,
    Phone,
    BadgeCheck,
    CalendarCheck,
    Lock,
    ShieldCheck,
    Bell,
    Globe,
    LogOut,
    ChevronRight
} from 'lucide-react';

interface UserProfileProps {
    onBack: () => void;
    onLogout: () => void;
}

export default function UserProfile({ onBack, onLogout }: UserProfileProps) {
    // Mock data for display
    const user = {
        name: "Thabo Mbeki",
        role: "Staff • Science Dept",
        email: "t.mbeki@edapp.com",
        phone: "+27 82 555 0199",
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-10 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased transition-colors duration-200">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 justify-between border-b border-slate-200/50 dark:border-slate-800/50">
                <button
                    onClick={onBack}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-900 dark:text-white"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Profile</h2>
                <div className="flex w-10 items-center justify-end">
                    <p className="text-primary text-base font-bold leading-normal tracking-wide shrink-0 cursor-pointer hover:text-blue-600 transition-colors">Edit</p>
                </div>
            </div>

            {/* Profile Header Identity */}
            <div className="flex flex-col items-center pt-6 pb-2 px-4">
                <div className="relative group cursor-pointer">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full h-32 w-32 shadow-lg border-4 border-white dark:border-slate-800 transition-transform hover:scale-105"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDbSWYFcETC0O_5OgHCiN1DHzARoUO9MnysMJiefE0q1aazYLcchg0fr_uc6p2Iarn32WECQuZDcwzxWlRPZzVmMl_Pq2W6ltU8JgJ5DNQjXaprJGXcr9mywFs0AFxg19nXWCZsV5VqayvHlpjk6ytdNanD1VDiujrDS2dkP5XJcp1MIZ2JMKn_lvuZS36h6fpX7qz9eIJqs-lz6dcKeu__X46_lXut-3IP_gH4SWNGQ4k_bpsLn1iAkVopG_UbPcOg1735Q_KOLl8")' }}
                    ></div>
                    <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-sm hover:bg-blue-600 transition-colors">
                        <Camera className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4 flex flex-col items-center">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-2xl font-bold leading-tight tracking-tight text-center">{user.name}</h1>
                        <Verified className="text-primary h-5 w-5 fill-current" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{user.role}</p>
                </div>
            </div>

            {/* Quick Stats (Staff Context) */}
            <div className="flex flex-wrap gap-3 px-4 py-6">
                <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                        <FlaskConical className="text-primary h-5 w-5" />
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Dept</p>
                    </div>
                    <p className="text-lg font-bold leading-tight truncate">Science</p>
                </div>
                <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="text-primary h-5 w-5" />
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Class</p>
                    </div>
                    <p className="text-lg font-bold leading-tight truncate">Gr 10B</p>
                </div>
                <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="text-primary h-5 w-5" />
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Leave</p>
                    </div>
                    <p className="text-lg font-bold leading-tight truncate">12 Days</p>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="px-4 mb-2">
                <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight px-1 pb-3">Contact Information</h3>
            </div>
            <div className="mx-4 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">
                {/* Email Item */}
                <div className="flex items-center gap-4 px-4 py-4 justify-between border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 size-10">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col truncate">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Email Address</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
                {/* Phone Item */}
                <div className="flex items-center gap-4 px-4 py-4 justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 size-10">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col truncate">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Mobile</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white truncate">{user.phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Settings Section */}
            <div className="px-4 mb-2">
                <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight px-1 pb-3">Staff Management</h3>
            </div>
            <div className="mx-4 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">
                <button className="flex items-center gap-4 px-4 py-4 justify-between border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group w-full text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shrink-0 size-10">
                            <BadgeCheck className="h-5 w-5" />
                        </div>
                        <p className="text-base font-medium text-slate-900 dark:text-white">Permissions & Roles</p>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-primary transition-colors h-5 w-5" />
                </button>
                <button className="flex items-center gap-4 px-4 py-4 justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group w-full text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shrink-0 size-10">
                            <CalendarCheck className="h-5 w-5" />
                        </div>
                        <p className="text-base font-medium text-slate-900 dark:text-white">Attendance Log</p>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-primary transition-colors h-5 w-5" />
                </button>
            </div>

            {/* Account & Security Section */}
            <div className="px-4 mb-2">
                <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight px-1 pb-3">Account & Security</h3>
            </div>
            <div className="mx-4 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">
                {/* Password */}
                <button className="flex items-center gap-4 px-4 py-4 justify-between border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group w-full text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 size-10">
                            <Lock className="h-5 w-5" />
                        </div>
                        <p className="text-base font-medium text-slate-900 dark:text-white">Change Password</p>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-primary transition-colors h-5 w-5" />
                </button>
                {/* 2FA */}
                <div className="flex items-center gap-4 px-4 py-3 justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 size-10">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-base font-medium text-slate-900 dark:text-white">Two-Factor Auth</p>
                            <p className="text-xs text-slate-500">Secure your account</p>
                        </div>
                    </div>
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input defaultChecked type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            {/* App Settings */}
            <div className="px-4 mb-2">
                <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight px-1 pb-3">App Settings</h3>
            </div>
            <div className="mx-4 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-8">
                <button className="flex items-center gap-4 px-4 py-4 justify-between border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group w-full text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 size-10">
                            <Bell className="h-5 w-5" />
                        </div>
                        <p className="text-base font-medium text-slate-900 dark:text-white">Notifications</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-400">On</p>
                        <ChevronRight className="text-slate-400 group-hover:text-primary transition-colors h-5 w-5" />
                    </div>
                </button>
                <button className="flex items-center gap-4 px-4 py-4 justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group w-full text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 size-10">
                            <Globe className="h-5 w-5" />
                        </div>
                        <p className="text-base font-medium text-slate-900 dark:text-white">Language</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-400">English (SA)</p>
                        <ChevronRight className="text-slate-400 group-hover:text-primary transition-colors h-5 w-5" />
                    </div>
                </button>
            </div>

            {/* Footer Actions */}
            <div className="px-4 flex flex-col items-center gap-6 mt-2">
                <button
                    onClick={onLogout}
                    className="w-full rounded-xl bg-red-50 dark:bg-red-900/10 py-3.5 px-4 text-red-600 dark:text-red-400 font-bold text-base hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                    <LogOut className="h-5 w-5" />
                    Log Out
                </button>
                <div className="flex flex-col items-center gap-2 pb-6">
                    <a className="text-primary text-sm font-medium hover:underline" href="#">Privacy Policy</a>
                    <p className="text-slate-400 text-xs">EdApp Version 2.4.1</p>
                </div>
            </div>
        </div>
    );
}
