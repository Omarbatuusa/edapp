'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';

// Allowed return URL patterns for security
const ALLOWED_RETURN_PATTERNS = [
    /^https:\/\/[a-z0-9-]+\.edapp\.co\.za\/auth\/finish$/,          // {tenant}.edapp.co.za/auth/finish
    /^https:\/\/apply-[a-z0-9-]+\.edapp\.co\.za\/auth\/finish$/,    // apply-{tenant}.edapp.co.za/auth/finish
    /^https:\/\/admin\.edapp\.co\.za\/auth\/finish$/,               // admin.edapp.co.za/auth/finish
    /^http:\/\/[a-z0-9-]+\.localhost:\d+\/auth\/finish$/,           // localhost dev
];

function validateReturnUrl(url: string | null): boolean {
    if (!url) return false;
    try {
        const decoded = decodeURIComponent(url);
        return ALLOWED_RETURN_PATTERNS.some(pattern => pattern.test(decoded));
    } catch {
        return false;
    }
}

function BrokerStartContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const tenant = searchParams.get('tenant');
        const role = searchParams.get('role');
        const intent = searchParams.get('intent');
        const returnUrl = searchParams.get('return');

        // Basic validation
        if (!tenant) {
            // Invalid request, redirect to main app discovery
            window.location.href = 'https://app.edapp.co.za';
            return;
        }

        // Validate return URL if provided
        if (returnUrl && !validateReturnUrl(returnUrl)) {
            setError('Invalid return URL');
            return;
        }

        // If valid, forward to the login page with all params
        router.replace(`/auth-broker/login?${searchParams.toString()}`);

    }, [searchParams, router]);

    if (error) {
        return (
            <div className="app-shell">
                <AuthHeader variant="discovery" />
                <main className="app-content">
                    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">error</span>
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-2">Can't continue</h2>
                        <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
                            Please restart sign-in from your application.
                        </p>
                        <button
                            onClick={() => window.location.href = 'https://app.edapp.co.za'}
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Go to EdApp
                        </button>
                    </div>
                </main>
                <AuthFooter />
            </div>
        );
    }

    return (
        <div className="app-shell">
            <AuthHeader variant="discovery" />
            <main className="app-content">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-muted-foreground font-medium animate-pulse">Initializing secure session...</p>
                </div>
            </main>
            <AuthFooter />
        </div>
    );
}

export default function BrokerStartPage() {
    return (
        <Suspense fallback={
            <div className="app-shell">
                <AuthHeader variant="discovery" />
                <main className="app-content">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                </main>
                <AuthFooter />
            </div>
        }>
            <BrokerStartContent />
        </Suspense>
    );
}

