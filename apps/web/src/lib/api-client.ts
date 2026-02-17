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

export const apiClient = api;
