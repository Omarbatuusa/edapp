'use client';

import { use } from 'react';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

export default function EnrollmentSuccessPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8] dark:bg-[#101922] p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Application Submitted</h1>
                <p className="text-sm text-slate-500 mb-6">
                    Your enrollment application has been successfully submitted. You will receive a confirmation email shortly.
                    The school will review your application and contact you regarding the next steps.
                </p>
                <Link
                    href={`/tenant/${slug}/apply/new`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                    Submit Another Application
                </Link>
            </div>
        </div>
    );
}
