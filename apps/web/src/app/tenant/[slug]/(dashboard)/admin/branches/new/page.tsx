'use client';

import { use } from 'react';
import { BranchWizard } from '@/components/admin/branch/BranchWizard';

interface Props { params: Promise<{ slug: string }> }

export default function NewBranchPage({ params }: Props) {
    const { slug } = use(params);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || undefined : undefined;
    return <BranchWizard tenantSlug={slug} tenantId={tenantId} />;
}
