'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TenantLoginRedirect({ params }: { params: Promise<{ slug: string, role: string }> }) {
    const { slug, role } = use(params);
    const router = useRouter();

    useEffect(() => {
        // Construct Broker URL
        // In local dev: host logic might need adjustment but sticking to standard auth.edapp.co.za pattern
        // The middleware should have already intercepted auth.edapp.co.za requests.

        const protocol = window.location.protocol;
        const host = window.location.host;
        let brokerHost = 'auth.edapp.co.za';

        if (host.includes('localhost')) {
            // Keep on localhost for dev
            brokerHost = host;
        }

        const returnUrl = encodeURIComponent(window.location.href);
        const brokerUrl = `${protocol}//${brokerHost}/auth-broker/start?tenant=${slug}&role=${role || 'staff'}&return_url=${returnUrl}`;

        // Push to Broker
        window.location.href = brokerUrl;

    }, [slug, role, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8] dark:bg-[#101922]">
            <div className="w-8 h-8 border-2 border-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium">Redirecting to secure login...</p>
        </div>
    );
}
