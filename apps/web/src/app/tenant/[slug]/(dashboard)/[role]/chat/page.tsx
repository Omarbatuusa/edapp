'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CommunicationHub = dynamic(
    () => import('@/components/communication/CommunicationHub').then(mod => mod.CommunicationHub),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen w-full flex flex-col bg-slate-100 dark:bg-slate-900">
                <div className="animate-pulse p-4 space-y-4">
                    <div className="h-14 bg-slate-300 dark:bg-slate-700 rounded-xl" />
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
                <div className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
                    Loading Communication Hub...
                </div>
            </div>
        )
    }
);

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-400 animate-spin">progress_activity</span>
                    <p className="text-slate-500 mt-2">Loading...</p>
                </div>
            </div>
        }>
            <CommunicationHub officeHours="Mon-Fri, 8 AM - 3 PM" />
        </Suspense>
    );
}
