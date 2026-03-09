'use client';
import { use } from 'react';
import { EmergencyHubPage } from '@/components/safety/EmergencyHubPage';

export default function StaffEmergenciesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return <EmergencyHubPage tenantSlug={slug} tenantId={slug} role="staff" basePath={`/tenant/${slug}/staff`} />;
}
