'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole, UserRole } from '@/contexts/RoleContext'

interface NavItem {
    label: string
    icon: string
    iconFilled?: string
    href: string
    badge?: number
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
    admin: [
        { label: 'Home', icon: 'home', iconFilled: 'home', href: '' },
        { label: 'People', icon: 'groups', href: '/people' },
        { label: 'Classes', icon: 'school', href: '/classes' },
        { label: 'Reports', icon: 'bar_chart', href: '/reports' },
        { label: 'Menu', icon: 'menu', href: '/menu' },
    ],
    staff: [
        { label: 'Home', icon: 'home', iconFilled: 'home', href: '' },
        { label: 'Classes', icon: 'school', href: '/classes' },
        { label: 'Chat', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', href: '/messages' },
        { label: 'Reports', icon: 'bar_chart', href: '/reports' },
        { label: 'Menu', icon: 'menu', href: '/menu' },
    ],
    parent: [
        { label: 'Home', icon: 'home', iconFilled: 'home', href: '' },
        { label: 'Children', icon: 'child_care', href: '/children' },
        { label: 'Chat', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', href: '/chat', badge: 3 },
        { label: 'Pay', icon: 'payments', href: '/pay', badge: 1 },
        { label: 'Menu', icon: 'menu', href: '/menu' },
    ],
    learner: [
        { label: 'Home', icon: 'home', iconFilled: 'home', href: '' },
        { label: 'Courses', icon: 'menu_book', href: '/courses' },
        { label: 'Grades', icon: 'grade', href: '/grades' },
        { label: 'Chat', icon: 'chat_bubble_outline', iconFilled: 'chat_bubble', href: '/messages' },
        { label: 'Menu', icon: 'menu', href: '/menu' },
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
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-30">
            {/* Centered container matching main content width */}
            <div className="flex items-center justify-around h-16 max-w-2xl lg:max-w-4xl mx-auto px-2">
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
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <div className="relative">
                                <span className={`material-symbols-outlined text-2xl ${isActive ? 'font-medium' : ''}`}>
                                    {isActive && item.iconFilled ? item.iconFilled : item.icon}
                                </span>
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[11px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
