import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    // Pass Host header if doing server-side fetching, or let browser handle it
    // But for multi-tenant, we might need to explicit send a header if proxy doesn't forward it?
    // Nginx forwards Host header.

    // Also attach Token if exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const apiClient = api;
