'use client';

import { use } from 'react';
import { TenantWizard } from '@/components/admin/tenants/TenantWizard';

interface Props { params: Promise<{ slug: string }> }

export default function NewTenantPage({ params }: Props) {
    const { slug } = use(params);
    return <TenantWizard tenantSlug={slug} />;
}
