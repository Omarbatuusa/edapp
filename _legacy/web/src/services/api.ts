const getBaseUrl = () => {
    // In production, API is often at api.edapp.co.za or /api if proxied.
    // For Vultr deployment, we rely on VITE_API_URL if set, or fallback.
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/v1';
    }

    // Production (Standard Convention)
    return '/v1';
};

export const API_BASE_URL = getBaseUrl();

export async function get(endpoint: string) {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Context/Tenant Header from Active Role
    const activeRoleJson = localStorage.getItem('active_role');
    if (activeRoleJson) {
        try {
            const activeRole = JSON.parse(activeRoleJson);
            if (activeRole.tenant_id) {
                headers['x-tenant-id'] = activeRole.tenant_id;
            }
        } catch (e) {
            console.warn("Failed to parse active_role for header", e);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function post(endpoint: string, data: any) {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Context/Tenant Header from Active Role
    const activeRoleJson = localStorage.getItem('active_role');
    if (activeRoleJson) {
        try {
            const activeRole = JSON.parse(activeRoleJson);
            if (activeRole.tenant_id) {
                headers['x-tenant-id'] = activeRole.tenant_id;
            }
        } catch (e) {
            console.warn("Failed to parse active_role for header", e);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Behavior Summary
export async function getBehaviorSummary() {
    return get('/behaviour/summary');
}

export async function getRbacContext() {
    return get('/rbac/me');
}
