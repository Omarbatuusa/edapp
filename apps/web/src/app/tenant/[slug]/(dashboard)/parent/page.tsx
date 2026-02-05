'use client';

import { useParams } from 'next/navigation';
import { ParentHome } from '@/components/parent/ParentHome';

// Mock tenant and user data - in production, this would come from API/context
const MOCK_TENANT = {
    name: 'Lakewood International Academy',
    slug: 'lia',
    logo: undefined, // Will use initials fallback
};

const MOCK_USER = {
    name: 'Marge Simpson',
    parentCode: 'PAR-2026-0042',
    familyCode: 'FAM-SIMPSON-01',
};

export default function ParentDashboard() {
    const params = useParams();
    const tenantSlug = params.slug as string;

    return (
        <div className="space-y-4 pb-20">
            {/* Welcome Header + Codes */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">Welcome back</p>
                    <h1 className="text-xl font-bold">{MOCK_USER.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <p className="text-xs text-muted-foreground">
                            Parent: <span className="font-mono text-foreground">{MOCK_USER.parentCode}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Family: <span className="font-mono text-foreground">{MOCK_USER.familyCode}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Parent Home Content */}
            <ParentHome
                tenantSlug={tenantSlug}
                tenantName={MOCK_TENANT.name}
                tenantLogo={MOCK_TENANT.logo}
            />
        </div>
    );
}
