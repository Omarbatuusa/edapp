"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface TenantData {
    school_name: string;
    school_code: string;
    tenant_slug: string;
}

export default function TenantConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'error'>('loading')

    useEffect(() => {
        async function checkAndRedirect() {
            try {
                // First try lookup by slug
                let res = await fetch(`/v1/tenants/lookup-by-slug?slug=${slug}`)

                // If slug lookup fails, try school code lookup (to handle LIA01 redirect case)
                if (!res.ok) {
                    res = await fetch(`/v1/tenants/lookup-by-code?code=${slug.toUpperCase()}`)
                }

                if (!res.ok) {
                    setStatus('error')
                    return
                }

                const tenant: TenantData = await res.json()
                const currentSlug = slug.toLowerCase()

                // Canonical Domain Check
                if (currentSlug !== tenant.tenant_slug.toLowerCase()) {
                    // Mismatch (e.g. visited lia01.edapp.co.za instead of lia.edapp.co.za)
                    // Force redirect to canonical domain
                    const protocol = window.location.protocol
                    // Handle localhost vs production
                    const host = window.location.host
                    const baseDomain = host.includes('localhost')
                        ? 'localhost:3000'
                        : host.substring(host.indexOf('.') + 1) // removes subdomain part

                    window.location.href = `${protocol}//${tenant.tenant_slug}.${baseDomain}/login`
                    return
                }

                // If correct domain, simplified redirect to /login (Role Selection)
                // We use relative path which Next.js resolves correctly within the current subdomain scope
                router.replace(`/tenant/${tenant.tenant_slug}/login`)

            } catch (err) {
                setStatus('error')
            }
        }
        checkAndRedirect()
    }, [slug, router])

    if (status === 'error') {
        // Fallback to Discovery if school not found
        const handleBack = () => {
            const protocol = window.location.protocol
            const host = window.location.host
            const baseDomain = host.includes('localhost')
                ? 'localhost:3000'
                : host.substring(host.indexOf('.') + 1)
            window.location.href = `${protocol}//app.${baseDomain}`
        }

        return (
            <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col items-center justify-center font-display">
                <h1 className="text-xl font-bold mb-4">School not found</h1>
                <p className="text-slate-500 mb-6">We couldn't find a school with that code or name.</p>
                <button onClick={handleBack} className="text-primary font-medium hover:underline">
                    Find your school
                </button>
            </div>
        )
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
        </div>
    )
}
