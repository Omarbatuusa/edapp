'use client';

import { useParams } from 'next/navigation';
import { ParentHome } from '@/components/parent/ParentHome';

export default function ParentDashboard() {
    const params = useParams();
    const tenantSlug = params.slug as string;

    return (
        <div className="space-y-4">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">Welcome back</p>
                    <h1 className="text-xl font-bold">Marge Simpson</h1>
                </div>
            </div>

            {/* Parent Home Content */}
            <ParentHome tenantSlug={tenantSlug} />
        </div>
    );
}
