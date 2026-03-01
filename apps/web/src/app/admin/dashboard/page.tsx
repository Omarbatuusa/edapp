"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Legacy admin dashboard — redirects to the new admin UI.
 * The real admin dashboard lives at /tenant/[slug]/admin/ using AdminShell.
 */
export default function AdminDashboardRedirect() {
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const sessionToken = localStorage.getItem('session_token')
            const userRole = localStorage.getItem('user_role')

            if (sessionToken && userRole) {
                // Has session — redirect to new admin UI
                const slug = localStorage.getItem('admin_tenant_slug') || 'edapp'
                router.replace(`/tenant/${slug}/admin`)
            } else {
                // No session — redirect to login
                router.replace('/admin/login')
            }
        }
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Redirecting...</p>
            </div>
        </div>
    )
}
