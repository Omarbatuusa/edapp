
export interface PolicyDocument {
    key: string;
    title: string;
    version: string;
    content: string; // Markdown
    effective_date: string;
    is_tenant_specific: boolean;
}

export async function fetchPolicies(tenantSlug?: string): Promise<PolicyDocument[]> {
    let url = '/v1/policies/public';
    if (tenantSlug) {
        // First resolve slug to ID via existing tenant lookup API if needed, 
        // or backend can handle slug directly. For now, assuming backend wants ID.
        // Actually, the requirement says "tenant-scoped pages".
        // Let's modify the backend to accept slug or handle logic here.
        // For simplicity in Milestone 1, let's assume we can pass the slug to a wrapper 
        // or we lookup the tenant ID first.

        // Simpler: Backend endpoint accepts `tenantId`. 
        // We'll need to lookup tenant first to get ID.
        try {
            const tenantRes = await fetch(`/v1/tenants/lookup-by-slug?slug=${tenantSlug}`);
            if (tenantRes.ok) {
                const tenant = await tenantRes.json();
                url += `?tenantId=${tenant.id}`;
            }
        } catch (e) {
            console.error('Failed to lookup tenant for policies', e);
        }
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch policies');
    return res.json();
}
