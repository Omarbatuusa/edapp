'use client';

import { useParams } from 'next/navigation';
import { ParentHome } from '@/components/parent/ParentHome';

// Mock tenant and user data - in production, this would come from API/context
const MOCK_TENANT = {
    name: 'Lakewood International Academy',
    slug: 'lia',
    logo: undefined,
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
        <div className="app-content-padding space-y-4 pb-20">
            {/* Welcome Header */}
            <div className="max-w-3xl mx-auto">
                <p className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Welcome back</p>
                <h1 className="text-xl font-bold text-[hsl(var(--admin-text-main))] tracking-tight">{MOCK_USER.name}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                        Parent: <span className="font-mono font-semibold text-[hsl(var(--admin-text-sub))]">{MOCK_USER.parentCode}</span>
                    </p>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                        Family: <span className="font-mono font-semibold text-[hsl(var(--admin-text-sub))]">{MOCK_USER.familyCode}</span>
                    </p>
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
