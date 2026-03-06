'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    is_main_branch: boolean;
    school_logo_url?: string;
}

interface TenantData {
    id: string;
    school_name: string;
    tenant_slug: string;
    branches: Branch[];
}

interface TenantContextValue {
    tenantDisplayName: string;
    tenantLogoUrl: string | null;
    branches: Branch[];
    scope: string | null;        // selected branch_id or null = "All"
    scopeLabel: string;          // display label for the chip
    setScope: (branchId: string | null) => void;
    loading: boolean;
}

const TenantContext = createContext<TenantContextValue>({
    tenantDisplayName: '',
    tenantLogoUrl: null,
    branches: [],
    scope: null,
    scopeLabel: 'All campuses',
    setScope: () => {},
    loading: true,
});

export const useTenant = () => useContext(TenantContext);

export function TenantProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
    const [data, setData] = useState<TenantData | null>(null);
    const [scope, setScopeState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load saved scope from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`edapp_scope_${slug}`);
        if (saved) setScopeState(saved);
    }, [slug]);

    // Fetch tenant data from public endpoint (no auth needed)
    useEffect(() => {
        let cancelled = false;
        fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`)
            .then(r => {
                if (!r.ok) throw new Error('Tenant not found');
                return r.json();
            })
            .then(tenant => {
                if (!cancelled) setData(tenant);
            })
            .catch(() => {
                // Fallback handled by defaults
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [slug]);

    const setScope = useCallback((branchId: string | null) => {
        setScopeState(branchId);
        if (branchId) {
            localStorage.setItem(`edapp_scope_${slug}`, branchId);
        } else {
            localStorage.removeItem(`edapp_scope_${slug}`);
        }
    }, [slug]);

    // Derive display values
    const tenantDisplayName = data?.school_name || `${slug.charAt(0).toUpperCase()}${slug.slice(1)} School`;
    const tenantLogoUrl = data?.branches?.find(b => b.is_main_branch)?.school_logo_url || null;
    const branches = data?.branches || [];

    const scopeLabel = scope
        ? branches.find(b => b.id === scope)?.branch_name || 'Campus'
        : branches.length > 1
            ? 'All campuses'
            : branches[0]?.branch_name || 'Main campus';

    return (
        <TenantContext.Provider value={{
            tenantDisplayName,
            tenantLogoUrl,
            branches,
            scope,
            scopeLabel,
            setScope,
            loading,
        }}>
            {children}
        </TenantContext.Provider>
    );
}
