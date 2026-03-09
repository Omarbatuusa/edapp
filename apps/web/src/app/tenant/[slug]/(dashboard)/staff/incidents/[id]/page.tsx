'use client';
import { use } from 'react';
import { CaseDetail } from '@/components/safety/CaseDetail';

export default function CaseDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = use(params);
    return <CaseDetail tenantSlug={slug} tenantId={slug} incidentId={id} basePath={`/tenant/${slug}/staff`} />;
}
