'use client';

import { use, useEffect } from 'react';

export default function LearnerLoginRedirect({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    useEffect(() => {
        const protocol = window.location.protocol;
        const host = window.location.host;
        let brokerHost = 'auth.edapp.co.za';

        if (host.includes('localhost')) {
            brokerHost = host;
        }

        const returnUrl = encodeURIComponent(window.location.href);

        // Force role=learner
        const brokerUrl = `${protocol}//${brokerHost}/auth-broker/start?tenant=${slug}&role=learner&return_url=${returnUrl}`;

        window.location.href = brokerUrl;
    }, [slug]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8] dark:bg-[#101922]">
            <div className="w-8 h-8 border-2 border-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium">Redirecting to secure login...</p>
        </div>
    );
}
