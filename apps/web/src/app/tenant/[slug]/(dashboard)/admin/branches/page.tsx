'use client';

import { use } from 'react';
import { BranchList } from '@/components/admin/branch/BranchList';

interface Props { params: Promise<{ slug: string }> }

export default function BranchesPage({ params }: Props) {
    const { slug } = use(params);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || undefined : undefined;
    return (
        <div className="p-4 md:p-6 space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Branch Management</h1>
                <p className="text-sm text-muted-foreground">Manage all campuses and branches.</p>
            </div>
            <BranchList tenantSlug={slug} tenantId={tenantId} />
        </div>
    );
}
