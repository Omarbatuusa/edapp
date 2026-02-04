'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { HelpPopup } from '@/components/discovery/help-popup';
import ConsentGate from '@/components/auth/ConsentGate';

const DEFAULT_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuC96FXTYpIW1fqA_8czdGZvU6P_lFoVuIZZ1lhBzMSykuIEyQEElOa0-AB8eFKKQhEUUcNKGDznJwQTXAVT5Q6tSK6xbDteUL38WpifPHGqw5jvjvBAxtZr8tnMiFQ1Iazh_k1yw89QLWwMV4gDr5e0nBFuStsd9n1pq7B9u8kideTnBdlz3T3EuCJ9JcF7qnH9S-Xca5wX-eyf59mdPPU-dTyFFV0Hjr1Dh710MQq_kKGssRnXVxovzURFa0Z67wQZZcrGd7RAU1w";

export default function TenantConsentPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [tenantName, setTenantName] = useState('your school');
    const [tenantLogo, setTenantLogo] = useState(DEFAULT_LOGO);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    const slug = params.slug as string;

    useEffect(() => {
        const tId = searchParams.get('tenantId');
        const uId = searchParams.get('userId');
        const r = searchParams.get('role');

        setTenantId(tId);
        setUserId(uId);
        setRole(r);

        async function fetchTenantDetails() {
            if (slug) {
                try {
                    const res = await fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`);
                    if (res.ok) {
                        const data = await res.json();
                        setTenantName(data.school_name || 'your school');
                        setTenantLogo(data.logo_url || DEFAULT_LOGO);
                    }
                } catch (e) {
                    console.error('Failed to fetch tenant details');
                }
            }
        }
        fetchTenantDetails();
    }, [searchParams, slug]);

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
                let dest = `/tenant/${slug}/dashboard`;
                if (role === 'learner') dest = `/tenant/${slug}/learner`;
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

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-background">
            {/* Header - Same as login page */}
            <AuthHeader
                variant="tenant"
                tenantName={tenantName}
                tenantLogo={tenantLogo}
                tenantSlug={slug}
                onBack={handleBack}
                onHelp={() => setShowHelp(true)}
            />

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto app-content">
                <div className="flex flex-col items-center px-4 py-8 min-h-full">
                    <ConsentGate
                        tenantName={tenantName}
                        onContinue={handleContinue}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
            </main>

            {/* Footer */}
            <AuthFooter />

            {/* Help Popup */}
            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
