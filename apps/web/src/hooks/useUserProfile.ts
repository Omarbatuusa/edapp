'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { getNavConfig } from '@/config/navigation';
import type { UserRoleAssignment } from '@/components/dashboard/RoleSwitcher';

interface UserProfile {
    id: string;
    email: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    roles: UserRoleAssignment[];
}

export function useUserProfile(tenantSlug: string) {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        apiClient.get('/users/me')
            .then(res => {
                if (!cancelled) setProfile(res.data);
            })
            .catch(() => {
                // Auth might not be ready yet — fallback to localStorage
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    // Find current role assignment for this tenant
    const currentRoleStr = typeof window !== 'undefined'
        ? localStorage.getItem(`edapp_role_${tenantSlug}`) || localStorage.getItem('user_role') || ''
        : '';

    const allRoles = profile?.roles?.filter(r => r.is_active) || [];
    const tenantRoles = allRoles.filter(r => r.tenant_slug === tenantSlug);

    const currentRole = tenantRoles.find(r => r.role === currentRoleStr)
        || tenantRoles[0]
        || (allRoles.length > 0 ? allRoles[0] : null);

    const switchRole = useCallback((role: UserRoleAssignment) => {
        // Update localStorage
        localStorage.setItem('user_role', role.role);
        if (role.tenant_slug) {
            localStorage.setItem(`edapp_role_${role.tenant_slug}`, role.role);
        }

        // Navigate to the new role's dashboard
        const slug = role.tenant_slug || tenantSlug;
        const navConfig = getNavConfig(role.role);
        const basePath = navConfig.getBasePath(slug);
        router.push(basePath);
    }, [router, tenantSlug]);

    return {
        profile,
        currentRole,
        allRoles,
        tenantRoles,
        switchRole,
        loading,
        displayName: profile?.display_name || profile?.first_name || null,
        displayEmail: profile?.email || null,
    };
}
