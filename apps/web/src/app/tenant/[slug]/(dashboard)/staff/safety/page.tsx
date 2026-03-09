'use client';
import { use } from 'react';
import { SafeguardingInbox } from '@/components/safety/SafeguardingInbox';

export default function StaffSafetyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return <SafeguardingInbox tenantSlug={slug} tenantId={slug} basePath={`/tenant/${slug}/staff`} />;
}
