"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Shield } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import TenantConfirmation from "@/components/discovery/TenantConfirmation"
import AppContainer from "@/components/layout/AppContainer"

export default function DiscoveryPage() {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [confirmedTenant, setConfirmedTenant] = useState<any>(null)

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase()
        setCode(value)
        setError("")
    }

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!code.trim()) {
            setError("Please enter your school code")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await apiClient.post('/discovery/validate-code', { code })

            if (response.data.success) {
                setConfirmedTenant(response.data.tenant)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Unable to find school. Please check your code and try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmTenant = () => {
        if (!confirmedTenant) return

        const tenantSlug = confirmedTenant.slug

        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol
            const isLocalhost = window.location.hostname.includes('localhost')

            if (isLocalhost) {
                window.location.href = `${protocol}//${tenantSlug}.localhost:3000`
            } else {
                window.location.href = `${protocol}//${tenantSlug}.edapp.co.za`
            }
        }
    }

    const handleChangeSchool = () => {
        setConfirmedTenant(null)
        setCode("")
        setError("")
    }

    const handleQRScan = () => {
        alert("QR Scanner coming soon!")
    }

    const handleAdminLogin = () => {
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol
            const isLocalhost = window.location.hostname.includes('localhost')

            if (isLocalhost) {
                window.location.href = `${protocol}//admin.localhost:3000`
            } else {
                window.location.href = `${protocol}//admin.edapp.co.za`
            }
        }
    }

    if (confirmedTenant) {
        return (
            <AppContainer>
                <TenantConfirmation
                    tenant={confirmedTenant}
                    onConfirm={handleConfirmTenant}
                    onChangeSchool={handleChangeSchool}
                />
            </AppContainer>
        )
    }

    return (
        <AppContainer>
            <div className="w-full max-w-md mx-auto space-y-8 fade-in">
                {/* Main Discovery Card */}
                <div className="card-elevated rounded-2xl bg-white p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Find your school
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your school code or scan QR code
                        </p>
                    </div>

                    <form onSubmit={handleContinue} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                School Code
                            </label>
                            <Input
                                type="text"
                                value={code}
                                onChange={handleCodeChange}
                                placeholder="e.g. LIA"
                                className="text-center text-lg font-semibold uppercase tracking-wider input-outline-effect"
                                maxLength={10}
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-600 slide-in-bottom">{error}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold btn-outline-effect"
                        >
                            {loading ? "Finding school..." : "Continue"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">or</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleQRScan}
                            className="w-full h-12 text-base font-semibold"
                        >
                            <QrCode className="mr-2 h-5 w-5" />
                            Scan QR Code
                        </Button>
                    </form>
                </div>

                {/* Platform Admin Entry Card */}
                <button
                    onClick={handleAdminLogin}
                    className="w-full rounded-xl bg-white p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-indigo-300"
                >
                    <div className="flex items-center justify-center space-x-3">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">
                            Platform Admin
                        </span>
                    </div>
                </button>

                {/* Footer */}
                <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">
                        v1.0.0 • Development
                    </p>
                    <div className="flex justify-center space-x-4 text-xs text-gray-500">
                        <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
                        <span>•</span>
                        <a href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </AppContainer>
    )
}
