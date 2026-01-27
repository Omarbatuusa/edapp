"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import Image from "next/image"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { HelpPopup } from "@/components/discovery/help-popup"
import { ThemeToggle } from "@/components/discovery/theme-toggle"

export default function DiscoveryPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return

    setLoading(true)

    const protocol = window.location.protocol
    const mainDomain = window.location.host.replace('app.', '').replace('www.', '')

    if (mainDomain.includes('localhost')) {
      // For localhost, redirect to tenant subdomain
      window.location.href = `${protocol}//${code.toLowerCase()}.localhost:3000`
    } else {
      window.location.href = `${protocol}//${code.toLowerCase()}.${mainDomain}`
    }

    setLoading(false)
  }

  if (!mounted) return null

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
      {/* Top Navigation */}
      <header className="flex items-center justify-between p-4 sticky top-0 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-md z-10">
        <a
          href="https://edapp.co.za"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </a>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
            aria-label="Help"
          >
            <span className="material-symbols-outlined text-2xl">help</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
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
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 px-4">
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
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="School code"
              className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base font-medium border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
              autoFocus
            />
          </div>

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
