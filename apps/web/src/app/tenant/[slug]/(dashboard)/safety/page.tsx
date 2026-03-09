'use client';
import { use } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { EmergencyHubPage } from '@/components/safety/EmergencyHubPage';

export default function SafetyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { fullRole } = useRole();
    const roleCategory = fullRole.includes('admin') || fullRole.includes('principal') || fullRole.includes('smt') || fullRole.includes('deputy')
        ? 'admin' : fullRole.includes('parent') || fullRole.includes('guardian') || fullRole.includes('learner') || fullRole.includes('student')
        ? 'parent' : 'staff';
    const basePath = roleCategory === 'admin' ? `/tenant/${slug}/admin` : roleCategory === 'parent' ? `/tenant/${slug}/parent` : `/tenant/${slug}/staff`;
    return <EmergencyHubPage tenantSlug={slug} tenantId={slug} role={fullRole} basePath={basePath} />;
}
