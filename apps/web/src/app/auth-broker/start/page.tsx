'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function BrokerStartContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tenant = searchParams.get('tenant');
        const role = searchParams.get('role');
        const intent = searchParams.get('intent');

        // Basic validation
        if (!tenant) {
            // Invalid request, maybe redirect to main app discovery?
            window.location.href = 'https://app.edapp.co.za';
            return;
        }

        // If we have valid params, we can show the loading state 
        // or immediately redirect to the specific login form (email/google etc)
        // For now, let's just forward to the login page within the broker
        // passing all params along.

        router.replace(`/auth-broker/login?${searchParams.toString()}`);

    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium animate-pulse">Initializing secure session...</p>
        </div>
    );
}

export default function BrokerStartPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-600 rounded-full animate-spin"></div></div>}>
            <BrokerStartContent />
        </Suspense>
    );
}
