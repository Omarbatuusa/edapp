'use client';

import { use } from 'react';
import { BrandList } from '@/components/admin/brand/BrandList';

interface Props { params: Promise<{ slug: string }> }

export default function BrandsPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="p-4 md:p-6 space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Brand Management</h1>
                <p className="text-sm text-muted-foreground">Manage school brands and their connected branches.</p>
            </div>
            <BrandList tenantSlug={slug} />
        </div>
    );
}
