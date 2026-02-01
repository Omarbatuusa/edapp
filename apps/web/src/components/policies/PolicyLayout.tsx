'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { fetchPolicies, PolicyDocument } from '@/lib/policies-api';

interface PolicyLayoutProps {
    policyKey: string;
    fallbackTitle: string;
    fallbackContent: string; // Markdown
}

export default function PolicyLayout({ policyKey, fallbackTitle, fallbackContent }: PolicyLayoutProps) {
    const [policy, setPolicy] = useState<PolicyDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        async function load() {
            try {
                // Extract tenant slug from hostname if present
                const hostname = window.location.hostname;
                let tenantSlug = null;
                if (!hostname.startsWith('app.') && !hostname.startsWith('www.') && !hostname.startsWith('localhost')) {
                    tenantSlug = hostname.split('.')[0];
                }

                const policies = await fetchPolicies(tenantSlug || undefined);
                const match = policies.find(p => p.key === policyKey);
                setPolicy(match || null);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [policyKey]);

    const title = policy ? policy.title : fallbackTitle;
    const content = policy ? policy.content : fallbackContent;
    const version = policy ? policy.version : 'Draft';
    const effectiveDate = policy ? new Date(policy.effective_date).toLocaleDateString() : new Date().toLocaleDateString();

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            <AuthHeader />

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-[#15202b] rounded-2xl shadow-sm p-8 md:p-12 border border-slate-200 dark:border-slate-800">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ) : (
                        <article className="prose prose-slate dark:prose-invert max-w-none">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>

                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                                <span>Version {version}</span>
                                <span>&bull;</span>
                                <span>Effective: {effectiveDate}</span>
                            </div>

                            <ReactMarkdown>{content}</ReactMarkdown>
                        </article>
                    )}
                </div>
            </main>

            <AuthFooter />
        </div>
    );
}
