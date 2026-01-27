"use client"

import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { ThemeToggle } from "@/components/discovery/theme-toggle"

export default function TermsPage() {
    const router = useRouter()

    const handleBack = () => {
        router.back()
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* Header - consistent with auth screens */}
            <header className="flex items-center justify-between p-4 sticky top-0 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-md z-10">
                <button
                    onClick={handleBack}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                    aria-label="Back"
                >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 w-full max-w-md mx-auto flex flex-col px-6 py-6">
                {/* Icon */}
                <div className="mb-5 h-14 w-14 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-3xl">gavel</span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-center mb-2">Terms of Use</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
                    Last updated: January 2026
                </p>

                <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                    <div className="p-6 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                    </div>

                    <p className="text-sm text-slate-400 text-center">
                        This is a placeholder for the terms of use content. Complete legal text will be inserted here during the compliance phase.
                    </p>
                </div>
            </main>

            <AuthFooter />
        </div>
    )
}
