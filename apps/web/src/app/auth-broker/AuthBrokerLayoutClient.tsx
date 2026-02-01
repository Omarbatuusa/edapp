'use client';

import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"

export default function AuthBrokerLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    const handleBack = () => {
        if (typeof window !== 'undefined') window.history.back();
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300">
            <AuthHeader onBack={handleBack} />

            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">
                {children}
            </main>

            <AuthFooter />
        </div>
    )
}
