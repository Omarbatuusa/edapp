"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { HelpPopup } from "@/components/discovery/help-popup"

// Mock Tenant Data (In production, fetch from API)
const MOCK_TENANT = {
    name: "University of Excellence",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC96FXTYpIW1fqA_8czdGZvU6P_lFoVuIZZ1lhBzMSykuIEyQEElOa0-AB8eFKKQhEUUcNKGDznJwQTXAVT5Q6tSK6xbDteUL38WpifPHGqw5jvjvBAxtZr8tnMiFQ1Iazh_k1yw89QLWwMV4gDr5e0nBFuStsd9n1pq7B9u8kideTnBdlz3T3EuCJ9JcF7qnH9S-Xca5wX-eyf59mdPPU-dTyFFV0Hjr1Dh710MQq_kKGssRnXVxovzURFa0Z67wQZZcrGd7RAU1w"
}

export default function ApplicantPortalPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const [showHelp, setShowHelp] = useState(false)

    const handleStartApplication = () => {
        // Navigate to application form
        alert(`Starting application for ${slug}`)
    }

    const handleViewDrafts = () => {
        // Navigate to saved drafts
        alert("View saved drafts")
    }

    const handleBack = () => {
        const protocol = window.location.protocol
        const isLocalhost = window.location.hostname.includes('localhost')
        window.location.href = isLocalhost
            ? `${protocol}//${slug}.localhost:3000`
            : `${protocol}//${slug}.edapp.co.za`
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            <AuthHeader
                onBack={handleBack}
                onHelp={() => setShowHelp(true)}
            />

            <main className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center px-6 py-8">
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Tenant Logo & Name */}
                    <div className="text-center mb-10">
                        <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ios-shadow-lg border-4 border-white dark:border-slate-800 mb-4">
                            <Image
                                src={MOCK_TENANT.logoUrl}
                                alt={MOCK_TENANT.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Apply to {MOCK_TENANT.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                            Start your application journey
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        {/* Primary: Start Application */}
                        <button
                            onClick={handleStartApplication}
                            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-semibold py-4 rounded-xl ios-shadow active:scale-[0.98] transition-all text-base"
                        >
                            <span className="material-symbols-outlined text-xl">edit_note</span>
                            Start an application
                        </button>

                        {/* Secondary: View Drafts */}
                        <button
                            onClick={handleViewDrafts}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium py-4 rounded-xl ios-shadow active:scale-[0.98] transition-all text-base"
                        >
                            <span className="material-symbols-outlined text-xl text-slate-400">draft</span>
                            View saved drafts
                        </button>
                    </div>

                    {/* Help Link */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setShowHelp(true)}
                            className="text-sm text-slate-400 hover:text-primary transition-colors"
                        >
                            Need help with your application?
                        </button>
                    </div>
                </div>
            </main>

            <AuthFooter />

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
