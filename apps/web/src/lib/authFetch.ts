/**
 * authFetch — authenticated fetch for admin API calls.
 *
 * Token priority:
 *   1. session_token (localStorage) — admin session JWT, carries user role.
 *      Always preferred for admin.edapp.co.za where role-gated endpoints are used.
 *   2. Firebase ID token — fallback when no session token exists.
 *
 * On 401: retry with a force-refreshed Firebase token once, then show
 * session-expired modal only if the JWT's own exp claim has passed
 * (prevents premature logout from parallel requests during server restarts).
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

/** Decode JWT exp without a library. Returns true if expired or undecodable. */
function isJwtExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

/** Debounce guard — prevents multiple parallel 401s from firing the modal twice. */
let _sessionExpiredFiredAt = 0;

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const sessionToken = ls('session_token');
    const token = sessionToken || await getFirebaseToken(false);
    const res = await fetch(input, withAuth(init, token));
    if (res.status !== 401) return res;

    // On 401: try a force-refreshed Firebase token once
    const freshToken = await getFirebaseToken(true);
    if (freshToken) {
        const res2 = await fetch(input, withAuth(init, freshToken));
        if (res2.status !== 401) return res2;
    }

    // Unrecoverable 401 — if the original request used a session token, clear it.
    // Only dispatch the session-expired event if:
    //  a) the JWT's own exp claim has passed (genuine expiry), OR
    //  b) the token was already expired when decoded (server restart / secret rotation)
    // Debounce so parallel requests don't fire the modal multiple times.
    if (sessionToken && typeof window !== 'undefined') {
        localStorage.removeItem('session_token');
        const now = Date.now();
        if (now - _sessionExpiredFiredAt > 5_000 && isJwtExpired(sessionToken)) {
            _sessionExpiredFiredAt = now;
            window.dispatchEvent(new CustomEvent('edapp:session-expired'));
        }
    }

    return res;
}
