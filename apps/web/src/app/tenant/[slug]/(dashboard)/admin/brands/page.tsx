'use client';

import { use } from 'react';
import Link from 'next/link';
import { BrandList } from '@/components/admin/brand/BrandList';

interface Props { params: Promise<{ slug: string }> }

export default function BrandsPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="min-h-screen bg-white">
            {/* Sticky nav bar — pure white, no blur */}
            <div className="sticky top-0 z-20 bg-white border-b border-[hsl(var(--admin-border)/0.5)] px-2 py-2 flex items-center">
                <Link
                    href={`/tenant/${slug}/admin`}
                    className="flex items-center gap-1 px-2 py-2 rounded-xl text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary)/0.06)] active:scale-[0.95] transition-all"
                    aria-label="Back to dashboard"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    <span className="text-[15px] font-semibold">Brands</span>
                </Link>
            </div>

            <div className="p-4 md:p-6 space-y-4">
                <BrandList tenantSlug={slug} />
            </div>
        </div>
    );
}
