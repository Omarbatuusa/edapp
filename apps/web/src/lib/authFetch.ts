/**
 * authFetch — authenticated fetch wrapper matching api-client.ts token logic.
 *
 * Priority: Firebase getIdToken() → session_token in localStorage
 * On 401: force-refresh Firebase token and retry once.
 * Mirrors the axios interceptors in api-client.ts.
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
    const fbToken = await getFirebaseToken(false);
    if (fbToken) return fbToken;
    return ls('session_token');
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const token = await resolveToken();
    const res = await fetch(input, withAuth(init, token));
    if (res.status !== 401) return res;

    // Retry with force-refreshed Firebase token
    const freshToken = await getFirebaseToken(true);
    if (freshToken) {
        const res2 = await fetch(input, withAuth(init, freshToken));
        if (res2.status !== 401) return res2;
    }

    return res;
}
