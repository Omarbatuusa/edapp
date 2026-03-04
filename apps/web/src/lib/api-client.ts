import axios from 'axios';

// Get API URL that works with multi-tenant subdomains
// If env variable is set and matches current origin pattern, use it
// Otherwise, use relative URL to current origin
const getApiBaseUrl = () => {
    // Server-side: use env variable or default
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || '/v1';
    }

    // Client-side: use relative URL to avoid CORS issues with subdomains
    // This assumes nginx proxies /v1/* to the API backend
    return '/v1';
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        let token: string | null = null;

        // 1. Try Firebase client SDK (direct Firebase login on same domain)
        try {
            const { auth } = await import('@/lib/firebase');
            if (auth?.currentUser) {
                token = await auth.currentUser.getIdToken();
            }
        } catch {
            // Firebase not available or not signed in on this domain
        }

        // 2. Fallback: session_token from handoff auth flow
        //    (user logged in via auth broker on different subdomain)
        if (!token) {
            token = localStorage.getItem('session_token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// 401 response interceptor — refresh token or silently reject.
// Only redirect to login for core auth endpoints (/auth/*).
// Other 401s (e.g. chat, translate, missing endpoints) just reject
// so the UI can handle errors gracefully without logging the user out.
let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (typeof window !== 'undefined') {
                // Try refreshing Firebase token if Firebase user exists
                try {
                    const { auth } = await import('@/lib/firebase');
                    if (auth?.currentUser) {
                        const newToken = await auth.currentUser.getIdToken(true);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                } catch {
                    // Firebase refresh failed
                }

                // Only clear session + redirect for core auth endpoints
                const url = originalRequest?.url || '';
                const isAuthEndpoint = url.includes('/auth/') || url.includes('/login');

                if (isAuthEndpoint && !isRedirecting) {
                    isRedirecting = true;
                    localStorage.removeItem('session_token');
                    localStorage.removeItem('user_id');
                    localStorage.removeItem('user_role');

                    const pathMatch = window.location.pathname.match(/\/tenant\/([^/]+)/);
                    const tenantSlug = pathMatch?.[1];
                    if (tenantSlug) {
                        window.location.href = `/tenant/${tenantSlug}/login`;
                    }
                }
            }
        }

        return Promise.reject(error);
    },
);

export const apiClient = api;
