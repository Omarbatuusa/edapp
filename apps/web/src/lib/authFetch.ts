/**
 * authFetch — authenticated fetch for admin API calls.
 *
 * Token priority:
 *   1. session_token (localStorage) — admin session JWT, carries user role.
 *      Always preferred for admin.edapp.co.za where role-gated endpoints are used.
 *   2. Firebase ID token — fallback when no session token exists.
 *
 * On 401: retry with a force-refreshed Firebase token once.
 */

function ls(key: string): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
}

function withAuth(init: RequestInit, token: string | null): RequestInit {
    const existing = (init.headers as Record<string, string>) || {};
    const headers: Record<string, string> = { ...existing };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const tid = ls('admin_tenant_id');
    if (tid) headers['x-tenant-id'] = tid;
    return { ...init, headers };
}

async function getFirebaseToken(forceRefresh = false): Promise<string | null> {
    try {
        const { auth } = await import('@/lib/firebase');
        if (auth?.currentUser) return await auth.currentUser.getIdToken(forceRefresh);
    } catch { /* Firebase unavailable or not signed in */ }
    return null;
}

async function resolveToken(): Promise<string | null> {
    // Prefer session_token — it carries the admin role needed for permission checks.
    const sessionToken = ls('session_token');
    if (sessionToken) return sessionToken;
    // Fallback: Firebase ID token (e.g. learner/parent flows without admin login)
    return getFirebaseToken(false);
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const token = await resolveToken();
    const res = await fetch(input, withAuth(init, token));
    if (res.status !== 401) return res;

    // On 401: try a force-refreshed Firebase token once
    const freshToken = await getFirebaseToken(true);
    if (freshToken) {
        const res2 = await fetch(input, withAuth(init, freshToken));
        if (res2.status !== 401) return res2;
    }

    return res;
}
