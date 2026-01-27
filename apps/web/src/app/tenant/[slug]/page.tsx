"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { HelpPopup } from "@/components/discovery/help-popup"

// Mock Tenant Data (In production, fetch from API)
const MOCK_TENANT = {
    name: "University of Excellence",
    campus: "Main Campus • London",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC96FXTYpIW1fqA_8czdGZvU6P_lFoVuIZZ1lhBzMSykuIEyQEElOa0-AB8eFKKQhEUUcNKGDznJwQTXAVT5Q6tSK6xbDteUL38WpifPHGqw5jvjvBAxtZr8tnMiFQ1Iazh_k1yw89QLWwMV4gDr5e0nBFuStsd9n1pq7B9u8kideTnBdlz3T3EuCJ9JcF7qnH9S-Xca5wX-eyf59mdPPU-dTyFFV0Hjr1Dh710MQq_kKGssRnXVxovzURFa0Z67wQZZcrGd7RAU1w"
}

export default function TenantConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const [showHelp, setShowHelp] = useState(false)

    const handleContinue = () => {
        router.push(`/tenant/${slug}/login`)
    }

    const handleChangeSchool = () => {
        // Navigate back to discovery via full URL redirect
        const protocol = window.location.protocol
        const isLocalhost = window.location.hostname.includes('localhost')
        window.location.href = isLocalhost
            ? `${protocol}//localhost:3000`
            : `${protocol}//app.edapp.co.za`
    }

    const handleApplyNow = () => {
        const protocol = window.location.protocol
        const isLocalhost = window.location.hostname.includes('localhost')
        const applyUrl = isLocalhost
            ? `${protocol}//apply-${slug}.localhost:3000`
            : `${protocol}//apply-${slug}.edapp.co.za`
        window.location.href = applyUrl
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* Header - consistent */}
            <header className="flex items-center justify-between p-4 sticky top-0 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-md z-10">
                <button
                    onClick={handleChangeSchool}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                    aria-label="Back"
                >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                        aria-label="Help"
                    >
                        <span className="material-symbols-outlined text-2xl">help_outline</span>
                    </button>
                </div>
            </header>

            {/* Main Content - centered */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">
                {/* Tenant Logo */}
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg mb-6">
                    <Image
                        src={MOCK_TENANT.logoUrl}
                        alt={MOCK_TENANT.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Tenant Name & Campus */}
                <h1 className="text-2xl font-bold tracking-tight text-center">
                    {MOCK_TENANT.name}
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center italic">
                    {MOCK_TENANT.campus}
                </p>

                {/* Actions */}
                <div className="w-full mt-10 space-y-3 max-w-sm">
                    {/* Primary: Continue to Login */}
                    <button
                        onClick={handleContinue}
                        className="w-full h-14 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center"
                    >
                        Continue to Login
                    </button>

                    {/* Secondary: Change school */}
                    <button
                        onClick={handleChangeSchool}
                        className="w-full h-12 text-primary font-medium active:opacity-60 transition-opacity"
                    >
                        Change school
                    </button>
                </div>

                {/* Apply Now Link */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-400">
                        Not current learner or parent?{' '}
                        <button
                            onClick={handleApplyNow}
                            className="text-primary font-medium hover:underline"
                        >
                            Apply Now
                        </button>
                    </p>
                </div>
            </main>

            <AuthFooter />

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
