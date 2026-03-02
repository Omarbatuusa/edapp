'use client';

import { use } from 'react';
import { StaffWizard } from '@/components/admin/staff/StaffWizard';

interface Props { params: Promise<{ slug: string }> }

export default function NewStaffPage({ params }: Props) {
    const { slug } = use(params);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || undefined : undefined;
    return <StaffWizard tenantSlug={slug} tenantId={tenantId} />;
}
