'use client';
import { use } from 'react';
import { SafeguardingInbox } from '@/components/safety/SafeguardingInbox';

export default function AdminSafetyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return <SafeguardingInbox tenantSlug={slug} tenantId={slug} basePath={`/tenant/${slug}/admin`} />;
}
