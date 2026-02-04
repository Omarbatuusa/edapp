'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { AuthFooter } from '@/components/layout/AuthFooter';
import ConsentGate from '@/components/auth/ConsentGate';
import Image from 'next/image';

export default function TenantConsentPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [tenantName, setTenantName] = useState('your school');
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const tId = searchParams.get('tenantId');
        const uId = searchParams.get('userId');
        const r = searchParams.get('role');
        const slug = params.slug as string;

        setTenantId(tId);
        setUserId(uId);
        setRole(r);

        async function fetchTenantName() {
            if (slug) {
                try {
                    const res = await fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`);
                    if (res.ok) {
                        const data = await res.json();
                        setTenantName(data.school_name);
                    }
                } catch (e) {
                    console.error('Failed to fetch tenant name');
                }
            }
        }
        fetchTenantName();
    }, [searchParams, params.slug]);

    const handleContinue = async (consents: any) => {
        if (!userId || !tenantId) return;

        setLoading(true);
        try {
            const res = await fetch('/v1/policies/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    tenantId,
                    intent: 'app',
                    role,
                    consents
                })
            });

            if (res.ok) {
                const slug = params.slug as string;
                let dest = `/tenant/${slug}/dashboard`;
                if (role === 'learner') dest = `/tenant/${slug}/dashboard/learner`;
                router.push(dest);
            } else {
                alert('Failed to save consent. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300">
            {/* Header with tenant name */}
            <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#f6f7f8]/95 dark:bg-[#101922]/95 backdrop-blur-md z-20 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <div className="flex items-center gap-2">
                    <Image
                        src="/edapp-logo.svg"
                        alt="EdApp"
                        width={24}
                        height={24}
                        className="dark:invert"
                    />
                    <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                        {tenantName}
                    </span>
                </div>
                <div className="w-10" /> {/* Spacer for balance */}
            </header>

            {/* Scrollable content area */}
            <main className="flex-1 overflow-y-auto">
                <div className="flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-10 w-full min-h-full">
                    <ConsentGate
                        tenantName={tenantName}
                        onContinue={handleContinue}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
            </main>

            <AuthFooter />
        </div>
    );
}
