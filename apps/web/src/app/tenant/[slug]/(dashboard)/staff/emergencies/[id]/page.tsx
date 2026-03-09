'use client';
import { use } from 'react';
import { EmergencyCommandView } from '@/components/safety/EmergencyCommandView';

export default function EmergencyCommandPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = use(params);
    return <EmergencyCommandView tenantSlug={slug} tenantId={slug} emergencyId={id} basePath={`/tenant/${slug}/staff`} />;
}
