'use client';

import { use } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import TenantsList from '@/components/admin/tenants/TenantsList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { MOCK_ADMIN_EVENTS } from '@/lib/calendar-events';

interface Props { params: Promise<{ slug: string }> }

export default function TenantsPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="flex flex-col min-h-0">
            {/* Page header — iOS large-title style */}
            <div className="px-4 md:px-6 pt-5 pb-3 flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-[26px] font-bold tracking-tight text-[hsl(var(--admin-text-main))] leading-tight">
                        Schools
                    </h1>
                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-0.5 leading-snug">
                        Manage all school tenants on the platform
                    </p>
                </div>
                <Link
                    href={`/tenant/${slug}/admin/tenants/new`}
                    className="flex-shrink-0 h-10 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition-all mt-0.5"
                >
                    <Plus size={15} />
                    <span>New School</span>
                </Link>
            </div>

            <div className="px-4 md:px-6 pb-6 space-y-4">
                <TenantsList slug={slug} showNewButton={false} />

                {/* Mobile activity strip — hidden on desktop */}
                <div className="space-y-4 lg:hidden">
                    <MiniCalendar events={MOCK_ADMIN_EVENTS} />
                    <ActivityFeed role="admin" />
                </div>
            </div>
        </div>
    );
}
