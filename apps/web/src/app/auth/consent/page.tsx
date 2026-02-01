'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { AuthHeader } from '@/components/layout/AuthHeader';
import ConsentGate from '@/components/auth/ConsentGate';

export default function ConsentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tenantName, setTenantName] = useState('your school'); // Placeholder, ideally fetch from query or session

    // In a real app, we would fetch the tenant details from the session or query param
    // For now, let's try to get it from localStorage or query param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get('tenantName');
        if (name) setTenantName(name);
    }, []);

    const handleContinue = async (consents: any) => {
        setLoading(true);
        try {
            // Get user info from localStorage (since we are mocking auth flow a bit for this demo)
            // In production, this would be strictly session based
            const userId = localStorage.getItem('mock_user_id') || 'user-123';
            const tenantId = localStorage.getItem('mock_tenant_id') || 'tenant-123';
            const role = localStorage.getItem('mock_user_role') || 'learner';

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
                // Determine destination based on role
                let dest = '/dashboard'; // default
                if (role === 'learner') dest = '/student/dashboard';
                // etc.

                // For now, just go to root or dashboard
                router.push(dest);
            } else {
                alert('Failed to save consent. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Sign out logic
        router.push('/');
    };

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300">
            <AuthHeader />

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 w-full">
                <ConsentGate
                    tenantName={tenantName}
                    onContinue={handleContinue}
                    onCancel={handleCancel}
                    loading={loading}
                />
            </main>

            <AuthFooter />
        </div>
    );
}
