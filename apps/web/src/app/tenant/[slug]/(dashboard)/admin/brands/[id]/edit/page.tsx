'use client';

import { use } from 'react';
import { BrandWizard } from '@/components/admin/brand/BrandWizard';

interface Props { params: Promise<{ slug: string; id: string }> }

export default function EditBrandPage({ params }: Props) {
    const { slug, id } = use(params);
    return <BrandWizard tenantSlug={slug} mode="edit" brandId={id} />;
}
