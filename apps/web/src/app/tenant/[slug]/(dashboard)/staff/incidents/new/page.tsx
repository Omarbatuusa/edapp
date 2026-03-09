'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { IncidentReportWizard } from '@/components/safety/IncidentReportWizard';

export default function NewIncidentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const searchParams = useSearchParams();
    const category = searchParams.get('category') || undefined;
    return <IncidentReportWizard tenantSlug={slug} tenantId={slug} preSelectedCategory={category} />;
}
