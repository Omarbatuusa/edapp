"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button" // Assuming I'll create this later or now
import { Input } from "@/components/ui/input" // Assuming I'll create this later or now


export default function DiscoveryPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // 1. Resolve host from code? 
    // Usually user enters "LIA" -> we check DB -> get host "lia.edapp.co.za"
    // But API takes "host".
    // We need an endpoint to lookup by SCHOOL CODE too, not just host.
    // But TenantsService has findBySlug logic mostly? 
    // For now, let's assume code IS the slug (subdomain).

    // Simulating redirect to the subdomain
    // In local dev, we can't easily switch subdomain without hosts file.
    // But we will simulate logic.

    if (code) {
      // Just redirect to that domain
      const protocol = window.location.protocol;
      const mainDomain = window.location.host.replace('app.', '').replace('www.', '');

      // If localhost, we can't append subdomain easily unless mapped.
      // For demonstration, we'll just alert or log.
      if (mainDomain.includes('localhost')) {
        alert(`Redirecting to http://${code}.localhost:3000 (Requires hosts file setup)`);
        // router.push(...) won't work across domains easily
      } else {
        window.location.href = `${protocol}//${code}.${mainDomain}`;
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Find your school</h1>
          <p className="mt-2 text-sm text-gray-600">Enter your school code or domain</p>
        </div>

        <form onSubmit={handleLookup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">School Code</label>
            {/* Fallback to standard input until Shadcn components installed properly */}
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. LIA"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  )
}
