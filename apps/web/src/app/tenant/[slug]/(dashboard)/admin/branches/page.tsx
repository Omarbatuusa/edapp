'use client';

import { use } from 'react';
import { BranchList } from '@/components/admin/branch/BranchList';

interface Props { params: Promise<{ slug: string }> }

export default function BranchesPage({ params }: Props) {
    const { slug } = use(params);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || undefined : undefined;
    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Branch Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage all campuses and branches</p>
            </div>
            <BranchList tenantSlug={slug} tenantId={tenantId} />
        </div>
    );
}
