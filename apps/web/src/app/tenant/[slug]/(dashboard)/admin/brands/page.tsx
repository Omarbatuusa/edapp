'use client';

import { use } from 'react';
import { BrandList } from '@/components/admin/brand/BrandList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { MOCK_ADMIN_EVENTS } from '@/lib/calendar-events';

interface Props { params: Promise<{ slug: string }> }

export default function BrandsPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="p-4 md:p-6 space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Brands</h1>
                <p className="text-sm text-muted-foreground">View and manage all brands on the platform.</p>
            </div>

            <BrandList tenantSlug={slug} />

            {/* Mobile activity strip — hidden on desktop where wizard sidebar handles it */}
            <div className="space-y-4 lg:hidden">
                <MiniCalendar events={MOCK_ADMIN_EVENTS} />
                <ActivityFeed role="admin" />
            </div>
        </div>
    );
}
