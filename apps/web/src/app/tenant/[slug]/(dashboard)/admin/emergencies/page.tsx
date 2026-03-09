'use client';
import { use } from 'react';
import { EmergencyHubPage } from '@/components/safety/EmergencyHubPage';

export default function AdminEmergenciesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return <EmergencyHubPage tenantSlug={slug} tenantId={slug} role="tenant_admin" basePath={`/tenant/${slug}/admin`} />;
}
