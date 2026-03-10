'use client';

import { useParams } from 'next/navigation';
import { ParentHome } from '@/components/parent/ParentHome';
import { SafetyQuickAccess } from '@/components/dashboard/SafetyQuickAccess';

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
        <div className="app-content-padding max-w-7xl mx-auto space-y-6 pb-20">
            {/* Welcome Header — matches admin page title sizing */}
            <div>
                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))]">Welcome back</p>
                <h1 className="text-3xl font-bold text-[hsl(var(--admin-text-main))] tracking-tight leading-tight">{MOCK_USER.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">
                        Parent: <span className="font-mono font-semibold text-[hsl(var(--admin-text-main))]">{MOCK_USER.parentCode}</span>
                    </p>
                    <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">
                        Family: <span className="font-mono font-semibold text-[hsl(var(--admin-text-main))]">{MOCK_USER.familyCode}</span>
                    </p>
                </div>
            </div>

            <SafetyQuickAccess />

            <ParentHome
                tenantSlug={tenantSlug}
                tenantName={MOCK_TENANT.name}
                tenantLogo={MOCK_TENANT.logo}
            />
        </div>
    );
}
