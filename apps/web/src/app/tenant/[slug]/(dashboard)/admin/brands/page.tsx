'use client';

import { use } from 'react';
import Link from 'next/link';
import { BrandList } from '@/components/admin/brand/BrandList';

interface Props { params: Promise<{ slug: string }> }

export default function BrandsPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="pb-24">
            {/* Back navigation bar */}
            <div className="sticky top-0 z-20 bg-[hsl(var(--admin-background)/0.80)] backdrop-blur-[20px] border-b border-[hsl(var(--admin-border)/0.5)] px-4 py-2.5 flex items-center gap-3">
                <Link
                    href={`/tenant/${slug}/admin`}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.92]"
                    aria-label="Back to dashboard"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>
                <h1 className="text-[17px] font-semibold text-[hsl(var(--admin-text-main))] truncate flex-1">
                    Brands
                </h1>
            </div>

            <div className="p-4 md:p-6 space-y-4">
                <BrandList tenantSlug={slug} />
            </div>
        </div>
    );
}
