'use client';

import { use } from 'react';
import { BrandList } from '@/components/admin/brand/BrandList';

interface Props { params: Promise<{ slug: string }> }

export default function BrandsPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Brand Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage school brands and their connected branches</p>
            </div>
            <BrandList tenantSlug={slug} />
        </div>
    );
}
