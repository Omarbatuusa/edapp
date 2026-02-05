'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShellHeader } from './ShellHeader';
import { AvatarPanel } from '@/components/dashboard/AvatarPanel';
import { EmergencyProvider } from '@/contexts/EmergencyContext';
import { EmergencyBanner } from '@/components/safety/EmergencyBanner';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    MessageSquare,
    Settings,
    Menu,
    X,
    GraduationCap,
    FileText,
    ShieldAlert,
    CreditCard
} from 'lucide-react';

interface ShellProps {
    children: React.ReactNode;
    tenantName: string;
    tenantSlug?: string;
    tenantLogo?: string;
    user?: any;
    role?: string;
}

export function Shell({ children, tenantName, tenantSlug, tenantLogo, user, role = 'admin' }: ShellProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [avatarPanelOpen, setAvatarPanelOpen] = useState(false);

    // Derive tenant slug from name if not provided
    const slug = tenantSlug || tenantName.toLowerCase();

    // Navigation items based on role
    // simplified for now - in full RBAC this would be dynamic
    const navItems = [
        { name: 'Dashboard', href: role || '', icon: LayoutDashboard },
        { name: 'Calendar', href: 'calendar', icon: Calendar },
        { name: 'Messages', href: 'messages', icon: MessageSquare },
        { name: 'Academics', href: 'academics', icon: BookOpen },
        { name: 'Finance', href: 'finance', icon: CreditCard },
        { name: 'People', href: 'people', icon: Users },
        { name: 'Gate Kiosk', href: 'gate', icon: GraduationCap },
        { name: 'Safety', href: 'safety', icon: ShieldAlert },
        { name: 'Reports', href: 'reports', icon: FileText },
        { name: 'Settings', href: 'settings', icon: Settings },
    ];

    return (
        <EmergencyProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col font-display">
                <EmergencyBanner />

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="h-16 flex items-center px-6 border-b border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {tenantName.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-lg tracking-tight truncate max-w-[140px]">
                                {tenantName}
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 space-y-1">
                        <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-3 mt-4">
                            Menu
                        </div>
                        {navItems.map((item) => {
                            const isActive = pathname?.includes(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={`/tenant/${tenantName.toLowerCase()}/${item.href}`}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                        }`}
                                >
                                    <item.icon size={18} className={isActive ? 'text-primary' : 'opacity-70'} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="absolute bottom-4 left-0 w-full px-4">
                        {/* Role Card Mini */}
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <GraduationCap size={16} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{user?.display_name || 'User'}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="lg:pl-64 flex flex-col min-h-screen">
                    <ShellHeader
                        tenantName={tenantName}
                        user={user}
                        onMenuClick={() => setSidebarOpen(true)}
                        onAvatarClick={() => setAvatarPanelOpen(true)}
                    />

                    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </main>
                </div>

                {/* Avatar Panel */}
                <AvatarPanel
                    isOpen={avatarPanelOpen}
                    onClose={() => setAvatarPanelOpen(false)}
                    user={user}
                    tenantName={tenantName}
                    tenantSlug={slug}
                />
            </div>
        </EmergencyProvider>
    );
}
