'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { EmergencyHub } from '@/components/safety/EmergencyHub';

export default function EmergencyPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const role = params.role as string || 'parent';

    return (
        <EmergencyHub
            tenantSlug={tenantSlug}
            role={role}
        />
    );
}
