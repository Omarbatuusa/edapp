'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function DashboardPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { currentRole: role, isLoading: loading } = useRole();

    useEffect(() => {
        if (!loading && role) {
            router.replace(`/tenant/${slug}/${role}`);
        }
    }, [role, loading, slug, router]);

    return (
        <div className="flex items-center justify-center h-full min-h-[50vh]">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
