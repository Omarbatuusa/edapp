"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { HelpPopup } from "@/components/discovery/help-popup"

export default function DiscoveryPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/v1/tenants/lookup-by-code?code=${code.toUpperCase()}`)
      if (!res.ok) {
        throw new Error('School not found')
      }
      const data = await res.json()
      // Go directly to role selection - no confirmation step
      router.push(`/tenant/${data.tenant_slug}/login`)
    } catch (err) {
      setError('School not found. Please check the code and try again.')
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <AuthHeader
        variant="discovery"
        onHelp={() => setShowHelp(true)}
      />

      {/* Main Content - Only scrollable element */}
      <main className="app-content">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full">
            {/* Heading */}
            <div className="mb-8 flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Find your school
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 px-4 text-center">
                Enter the unique code provided by your institution.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLookup} className="w-full space-y-5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setError(null)
                  }}
                  placeholder="School code"
                  className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base font-medium border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code}
                className="w-full h-14 bg-primary text-white font-semibold rounded-xl ios-shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Secondary Actions */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-primary font-medium hover:bg-primary/5 active:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                <span>Scan QR Code</span>
              </button>

              <a
                href="https://admin.edapp.co.za"
                className="text-sm font-medium text-slate-400 hover:text-primary transition-colors mt-2"
              >
                EdApp Super Admin
              </a>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />

      {/* Help Popup */}
      <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Decorative Gradients */}
      <div className="fixed top-0 right-0 -z-10 opacity-30 dark:opacity-10 pointer-events-none">
        <div className="h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
      </div>
      <div className="fixed bottom-0 left-0 -z-10 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      </div>
    </div>
  )
}
