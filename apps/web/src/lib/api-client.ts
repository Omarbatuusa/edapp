import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    // Pass Host header if doing server-side fetching, or let browser handle it
    // But for multi-tenant, we might need to explicit send a header if proxy doesn't forward it?
    // Nginx forwards Host header.

    // Attach Firebase token if user is authenticated
    if (typeof window !== 'undefined') {
        try {
            const { auth } = await import('@/lib/firebase');
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
    }
    return config;
});

export const apiClient = api;
