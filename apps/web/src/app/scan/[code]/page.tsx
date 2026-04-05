'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ScanRedirectPage() {
    const params = useParams();
    const code = (params.code as string || '').toUpperCase();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!code) { setError('No school code provided.'); setLoading(false); return; }

        fetch(`/v1/tenants/lookup-by-code?code=${encodeURIComponent(code)}`)
            .then(r => {
                if (!r.ok) throw new Error('School not found');
                return r.json();
            })
            .then(tenant => {
                const slug = tenant.tenant_slug;
                if (!slug) throw new Error('Invalid school data');
                // Redirect to tenant portal
                window.location.href = `https://${slug}.edapp.co.za`;
            })
            .catch(() => {
                setError('School not found. Please check the QR code and try again.');
                setLoading(false);
            });
    }, [code]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-sm w-full text-center">
                {loading ? (
                    <>
                        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-lg font-semibold text-slate-700">Finding your school...</p>
                        <p className="text-sm text-slate-400 mt-1">Code: {code}</p>
                    </>
                ) : error ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-red-400">error</span>
                        </div>
                        <p className="text-lg font-semibold text-slate-700">{error}</p>
                        <a href="https://app.edapp.co.za" className="mt-4 inline-block text-primary font-medium underline">
                            Back to EdApp
                        </a>
                    </>
                ) : null}
            </div>
        </div>
    );
}
