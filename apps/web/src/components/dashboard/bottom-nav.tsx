'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole, UserRole } from '@/contexts/RoleContext'

interface NavItem {
    label: string
    icon: string
    href: string
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
    admin: [
        { label: 'Home', icon: 'home', href: '' },
        { label: 'People', icon: 'groups', href: '/people' },
        { label: 'Classes', icon: 'school', href: '/classes' },
        { label: 'Settings', icon: 'settings', href: '/settings' },
    ],
    staff: [
        { label: 'Home', icon: 'home', href: '' },
        { label: 'Classes', icon: 'school', href: '/classes' },
        { label: 'Reports', icon: 'bar_chart', href: '/reports' },
        { label: 'Messages', icon: 'chat', href: '/messages' },
    ],
    parent: [
        { label: 'Home', icon: 'home', href: '' },
        { label: 'Children', icon: 'child_care', href: '/children' },
        { label: 'Payments', icon: 'payments', href: '/payments' },
        { label: 'Messages', icon: 'chat', href: '/messages' },
    ],
    learner: [
        { label: 'Home', icon: 'home', href: '' },
        { label: 'Courses', icon: 'menu_book', href: '/courses' },
        { label: 'Grades', icon: 'grade', href: '/grades' },
        { label: 'Profile', icon: 'person', href: '/profile' },
    ],
}

interface BottomNavProps {
    tenantSlug: string
}

export function BottomNav({ tenantSlug }: BottomNavProps) {
    const { currentRole } = useRole()
    const pathname = usePathname()
    const basePath = `/tenant/${tenantSlug}/dashboard`

    const navItems = NAV_ITEMS[currentRole] || NAV_ITEMS.parent

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#101922]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 md:hidden">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const fullHref = `${basePath}${item.href}`
                    const isActive = item.href === ''
                        ? pathname === basePath
                        : pathname.startsWith(fullHref)

                    return (
                        <Link
                            key={item.label}
                            href={fullHref}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                    ? 'text-primary'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-2xl ${isActive ? 'font-medium' : ''}`}>
                                {item.icon}
                            </span>
                            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
