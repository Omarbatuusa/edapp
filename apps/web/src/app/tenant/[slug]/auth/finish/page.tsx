'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Assuming this exists and has setSession or similar

function AuthFinishContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // In a real app, useAuth would expose a method to set the session token
    // const { setSession } = useAuth(); 

    // For now, we mock the session setting or assume we set a cookie
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handoffCode = searchParams.get('handoff');

        if (!handoffCode) {
            setError('Missing handoff code');
            return;
        }

        async function exchangeCode() {
            try {
                // Exchange code for session token
                const res = await fetch('/v1/auth/handoff/exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: handoffCode })
                });

                if (!res.ok) {
                    throw new Error('Invalid or expired login session');
                }

                const { sessionToken } = await res.json();

                // Save session (e.g., cookie or local storage via AuthContext)
                // document.cookie = `session_token=${sessionToken}; path=/; secure; samesite=strict`;
                localStorage.setItem('session_token', sessionToken); // Simplification for MVP

                // Redirect to Dashboard
                router.replace('/dashboard'); // Or tenant specific dashboard

            } catch (err) {
                setError('Login failed. Please try again.');
            }
        }

        exchangeCode();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error_outline</span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Failed</h1>
                <p className="mt-2 text-slate-500">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-medium"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8] dark:bg-[#101922]">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">Finalizing secure session...</p>
        </div>
    );
}

export default function AuthFinishPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthFinishContent />
        </Suspense>
    );
}
