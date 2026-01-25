import { useState, useEffect } from 'react';
import {
    Bell,
    Menu,
    LogOut,
    User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSwitcher from './RoleSwitcher';
import DisciplineDashboard from './discipline/DisciplineDashboard';
import HomeworkAssignments from './HomeworkAssignments';
import { getDashboardTabs, type DashboardTab } from '../config/DashboardConfig';

interface StaffDashboardProps {
    onLogout: () => void;
}

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
    const { user, activeRole } = useAuth();
    // Get tabs based on the active role's scope (default to 'class' if undefined)
    const tabs = getDashboardTabs(activeRole?.scope || 'class');

    // Initialize activeTab. Ensure it exists in the current tabs, otherwise default to first.
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'home');

    // Effect to reset active tab if the role (and thus tabs) changes and current tab is invalid
    useEffect(() => {
        const currentTabExists = tabs.find(t => t.id === activeTab);
        if (!currentTabExists && tabs.length > 0) {
            setActiveTab(tabs[0].id);
        }
    }, [activeRole, tabs, activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'discipline':
                return <DisciplineDashboard />;
            case 'assignments':
                return <HomeworkAssignments onBack={() => setActiveTab('home')} />;
            case 'home':
                return (
                    <div className="p-6 text-center text-slate-500">
                        <h2 className="text-xl font-bold mb-2">Welcome {user?.first_name}</h2>
                        <p className="mb-4">You are working as: <span className="font-semibold text-primary">{activeRole?.name}</span></p>
                        <p className="text-sm">Select a module from the menu below.</p>
                        {tabs.some(t => t.id === 'discipline') && (
                            <button
                                onClick={() => setActiveTab('discipline')}
                                className="mt-4 px-6 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/30"
                            >
                                Open Discipline
                            </button>
                        )}
                        {tabs.some(t => t.id === 'assignments') && (
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className="mt-4 ml-2 px-6 py-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30"
                            >
                                Assignments
                            </button>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                            <Menu className="h-8 w-8 opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 capitalize">{activeTab.replace('-', ' ')} Module</h3>
                        <p className="text-sm">Coming Soon</p>
                    </div>
                );
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200">
            {/* Top App Bar */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 border-b border-gray-200/50 dark:border-white/10 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="bg-indigo-600 rounded-full size-12 border-[3px] border-white dark:border-slate-800 shadow-md flex items-center justify-center text-white">
                            <span className="font-bold text-lg">{user?.first_name?.charAt(0) || 'S'}</span>
                        </div>
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-[2.5px] border-white dark:border-slate-800 shadow-sm z-10"></div>
                    </div>

                    {/* Role Switcher */}
                    <RoleSwitcher />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center size-10 rounded-full bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                    <button className="relative flex items-center justify-center rounded-full size-10 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-slate-900 dark:text-white transition hover:bg-slate-100 dark:hover:bg-[#232f48]">
                        <Bell className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 pb-[env(safe-area-inset-bottom,20px)] pt-2 px-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300">
                <div className="flex justify-around items-center h-16 pb-2 max-w-md mx-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        // Special styling for the center item (often Discipline or main action) if we wanted, 
                        // but dynamic lists make "center" testing harder. 
                        // For now, consistent styling for all, slightly highlighted for active.
                        // OR: We can stick to the "Bubble" style for the active item.

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center justify-center transition-all duration-200 
                                    ${isActive
                                        ? 'text-primary transform -translate-y-1'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <div className={`p-2 rounded-2xl mb-1 ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                                    <Icon className={`h-6 w-6 ${isActive ? 'fill-primary/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
