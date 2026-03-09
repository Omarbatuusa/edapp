'use client';
import { use } from 'react';
import { RollCallUI } from '@/components/safety/RollCallUI';

export default function RollCallPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = use(params);
    return <RollCallUI tenantSlug={slug} tenantId={slug} emergencyId={id} />;
}
