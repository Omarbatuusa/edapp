"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { HelpPopup } from "@/components/discovery/help-popup"

// Default logo for tenants without custom logo
const DEFAULT_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuC96FXTYpIW1fqA_8czdGZvU6P_lFoVuIZZ1lhBzMSykuIEyQEElOa0-AB8eFKKQhEUUcNKGDznJwQTXAVT5Q6tSK6xbDteUL38WpifPHGqw5jvjvBAxtZr8tnMiFQ1Iazh_k1yw89QLWwMV4gDr5e0nBFuStsd9n1pq7B9u8kideTnBdlz3T3EuCJ9JcF7qnH9S-Xca5wX-eyf59mdPPU-dTyFFV0Hjr1Dh710MQq_kKGssRnXVxovzURFa0Z67wQZZcrGd7RAU1w"

interface TenantData {
  school_name: string;
  school_code: string;
  tenant_slug: string;
  logo_url?: string;
  main_branch?: {
    branch_name: string;
    is_main_branch: boolean;
  };
}

type Step = 'search' | 'confirm'

export default function DiscoveryPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('search')
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [tenant, setTenant] = useState<TenantData | null>(null)

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
      setTenant(data)
      setStep('confirm')
    } catch (err) {
      setError('School not found. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!tenant) return

    // iOS-style transition: Use client-side routing
    router.push(`/tenant/${tenant.tenant_slug}/login`)
  }

  const handleBack = () => {
    setStep('search')
    setCode("")
    setTenant(null)
    setError(null)
  }

  if (!mounted) return null

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300">
      {/* Top Navigation */}
      <AuthHeader
        variant="discovery"
        onBack={step === 'confirm' ? handleBack : undefined}
        onHelp={() => setShowHelp(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">

        {step === 'search' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center text-center">
              {/* Note: Header already has EdApp logo in discovery variant, do we need it here too? 
                  The mockups often show a large logo in body. 
                  Prompt says: "Tenant discovery has a clean 'EdApp only' header... Header should show: EdApp logo + EdApp title only".
                  If header has it, maybe remove from body to avoid duplication? 
                  The prompt doesn't explicitly say "remove from body", but "header should show". 
                  Let's keep the body logo for the "Search" state as it feels empty otherwise. 
              */}
              <div className="mb-5 h-14 w-14 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="EdApp Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                />
              </div>
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
        )}

        {step === 'confirm' && tenant && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 w-full flex flex-col items-center">
            {/* Tenant Logo */}
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg mb-6">
              <Image
                src={tenant.logo_url || DEFAULT_LOGO}
                alt={tenant.school_name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Tenant Name & Branch */}
            <h1 className="text-2xl font-bold tracking-tight text-center">
              {tenant.school_name}
            </h1>
            {tenant.main_branch && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-center">
                Branch: {tenant.main_branch.branch_name}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 text-center">
              {tenant.school_code}
            </p>

            {/* Actions */}
            <div className="w-full mt-10 space-y-3 max-w-sm">
              {/* Primary: Continue to Login */}
              <button
                onClick={handleContinue}
                className="w-full h-14 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ios-shadow"
              >
                <span>Continue to Login</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>

              {/* Secondary: Change school */}
              <button
                onClick={handleBack}
                className="w-full h-12 text-primary font-medium active:opacity-60 transition-opacity"
              >
                Change school
              </button>
            </div>
          </div>
        )}

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

