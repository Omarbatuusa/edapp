'use client';
import { use } from 'react';
import { EmergencyBroadcastWizard } from '@/components/safety/EmergencyBroadcastWizard';

export default function NewEmergencyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return <EmergencyBroadcastWizard tenantSlug={slug} tenantId={slug} />;
}
