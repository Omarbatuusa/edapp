'use client';

import { use } from 'react';
import { LearnerEnrollmentWizard } from '@/components/admin/enrollment/LearnerEnrollmentWizard';

interface Props { params: Promise<{ slug: string }> }

export default function PublicEnrollmentPage({ params }: Props) {
    const { slug } = use(params);
    // For public enrollment, we derive tenantId from slug
    // In a real app, this would be resolved via API or middleware
    return <LearnerEnrollmentWizard tenantSlug={slug} />;
}
