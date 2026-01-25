"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, ArrowLeft } from "lucide-react"
import AppContainer from "@/components/layout/AppContainer"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            alert("Admin login coming soon!")
        } catch (err) {
            setError("Invalid credentials")
        } finally {
            setLoading(false)
        }
    }

    const handleBackToDiscovery = () => {
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol
            const isLocalhost = window.location.hostname.includes('localhost')

            if (isLocalhost) {
                window.location.href = `${protocol}//app.localhost:3000`
            } else {
                window.location.href = `${protocol}//app.edapp.co.za`
            }
        }
    }

    return (
        <AppContainer gradient={false} className="bg-gradient-to-b from-indigo-50 to-indigo-100">
            <div className="w-full max-w-md mx-auto space-y-8 fade-in">
                <div className="card-elevated rounded-2xl bg-white p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                            <Shield className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Platform Admin
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to manage the EdApp platform
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@edapp.co.za"
                                className="input-outline-effect"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-outline-effect"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 slide-in-bottom">{error}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 btn-outline-effect"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>

                <button
                    onClick={handleBackToDiscovery}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to School Discovery</span>
                </button>
            </div>
        </AppContainer>
    )
}
