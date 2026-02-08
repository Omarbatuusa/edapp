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
    // Attach Firebase token if user is authenticated
    if (typeof window !== 'undefined') {
        try {
            const { auth } = await import('@/lib/firebase');
            if (auth) {
                const user = auth.currentUser;
                if (user) {
                    const token = await user.getIdToken();
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
    }
    return config;
});

export const apiClient = api;
