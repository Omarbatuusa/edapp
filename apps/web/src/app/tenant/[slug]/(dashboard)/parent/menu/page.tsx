'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SubPageHeader, SubPageWrapper } from '@/components/parent/SubPageHeader';

const MENU_ITEMS = [
    {
        section: 'Account',
        items: [
            { icon: 'account_circle', label: 'My Profile', href: '/profile' },
            { icon: 'family_restroom', label: 'My Children', href: '/children' },
            { icon: 'account_balance_wallet', label: 'Account Statement', href: '/accounts' },
        ]
    },
    {
        section: 'School',
        items: [
            { icon: 'calendar_month', label: 'School Calendar', href: '/calendar' },
            { icon: 'campaign', label: 'Announcements', href: '/announcements' },
            { icon: 'article', label: 'School Policies', href: '/policies' },
            { icon: 'call', label: 'Contact School', href: '/contact' },
        ]
    },
    {
        section: 'Academics',
        items: [
            { icon: 'assignment', label: 'Homework', href: '/homework' },
            { icon: 'grade', label: 'Report Cards', href: '/reports' },
            { icon: 'schedule', label: 'Timetable', href: '/timetable' },
        ]
    },
    {
        section: 'Settings',
        items: [
            { icon: 'notifications', label: 'Notifications', href: '/settings/notifications' },
            { icon: 'dark_mode', label: 'Appearance', href: '/settings/appearance' },
            { icon: 'help', label: 'Help & Support', href: '/help' },
            { icon: 'logout', label: 'Sign Out', href: '/logout', danger: true },
        ]
    },
];

export default function MenuPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;

    return (
        <SubPageWrapper>
            <SubPageHeader
                title="Menu"
                backHref={`/tenant/${tenantSlug}/parent`}
            />

            <div className="space-y-6">
                {MENU_ITEMS.map((section) => (
                    <div key={section.section}>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                            {section.section}
                        </h3>
                        <div className="bg-card border border-border rounded-xl overflow-hidden">
                            {section.items.map((item, idx) => (
                                <Link
                                    key={item.label}
                                    href={`/tenant/${tenantSlug}/parent${item.href}`}
                                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors ${idx !== section.items.length - 1 ? 'border-b border-border' : ''
                                        } ${(item as any).danger ? 'text-red-600 dark:text-red-400' : ''}`}
                                >
                                    <span className={`material-symbols-outlined text-xl ${(item as any).danger ? '' : 'text-muted-foreground'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                                    <span className="material-symbols-outlined text-muted-foreground text-lg">chevron_right</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </SubPageWrapper>
    );
}
