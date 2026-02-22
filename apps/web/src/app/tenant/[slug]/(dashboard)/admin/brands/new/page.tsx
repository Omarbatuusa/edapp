'use client';

import { use } from 'react';
import { BrandWizard } from '@/components/admin/brand/BrandWizard';

interface Props { params: Promise<{ slug: string }> }

export default function NewBrandPage({ params }: Props) {
    const { slug } = use(params);
    return <BrandWizard tenantSlug={slug} />;
}
