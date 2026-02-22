'use client';

import { use } from 'react';
import { MainBranchWizard } from '@/components/admin/branch/MainBranchWizard';

interface Props { params: Promise<{ slug: string }> }

export default function NewMainBranchPage({ params }: Props) {
    const { slug } = use(params);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || undefined : undefined;
    return <MainBranchWizard tenantSlug={slug} tenantId={tenantId} />;
}
