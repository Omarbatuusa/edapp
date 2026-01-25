import { get } from './api';
import type { Tenant } from '../utils/mockData';

export async function searchTenant(code: string): Promise<Tenant | null> {
    try {
        if (!code) return null;
        // Call Real Backend
        const tenant = await get(`/tenants/search?code=${encodeURIComponent(code)}`);
        return tenant as Tenant;
    } catch (error) {
        console.error("Failed to search tenant:", error);
        return null;
    }
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
    try {
        if (!domain) return null;
        const tenant = await get(`/tenants/search?domain=${encodeURIComponent(domain)}`);
        return tenant as Tenant;
    } catch (error) {
        console.error("Failed to get tenant by domain:", error);
        return null;
    }
}
