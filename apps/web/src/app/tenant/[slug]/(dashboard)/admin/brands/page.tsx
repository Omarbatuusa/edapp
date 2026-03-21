'use client';

import { use } from 'react';
import Link from 'next/link';
import { BrandList } from '@/components/admin/brand/BrandList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { MOCK_ADMIN_EVENTS } from '@/lib/calendar-events';

interface Props { params: Promise<{ slug: string }> }

export default function BrandsPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="min-h-screen bg-white">
            {/*
              Mobile-only back bar — circular arrow_back + "Brands" title.
              Matches SubpageBar styling. Hidden on desktop (sidebar handles nav).
            */}
            <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-[hsl(var(--admin-border)/0.4)] flex items-center gap-1 px-1 py-1.5">
                <Link
                    href={`/tenant/${slug}/admin`}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] active:scale-[0.92] transition-all flex-shrink-0"
                    aria-label="Back to dashboard"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>
                <span className="text-[17px] font-semibold text-[hsl(var(--admin-text-main))] truncate">
                    Brands
                </span>
            </div>

            {/* Desktop: page heading only */}
            <div className="hidden lg:block px-6 pt-6 pb-2">
                <h1 className="text-[22px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">Brands</h1>
            </div>

            <div className="p-4 md:p-6 space-y-4">
                <BrandList tenantSlug={slug} />

                {/*
                  Mobile activity strip — shows below the brand list on mobile.
                  Hidden on desktop (≥1024px) because the wizard sidebar already
                  shows calendar + tasks + notifications there.
                */}
                <div className="mt-6 space-y-4 lg:hidden">
                    <MiniCalendar events={MOCK_ADMIN_EVENTS} />
                    <ActivityFeed role="admin" />
                </div>
            </div>
        </div>
    );
}
