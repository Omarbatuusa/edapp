"use client"

import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, LogOut, Users, GraduationCap, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.push('/admin/login')
    }

    return (
        <ProtectedRoute redirectTo="/admin/login">
            <div className="app-page bg-gradient-to-b from-indigo-50 to-white min-h-screen">
                <div className="app-container py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                                <Shield className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                    Platform Admin
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Welcome back, {user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="flex items-center space-x-2"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </div>

                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="card-elevated hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <CardTitle>Tenants</CardTitle>
                                </div>
                                <CardDescription>Manage schools and institutions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" variant="outline">
                                    View Tenants
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <GraduationCap className="h-6 w-6 text-green-600" />
                                    </div>
                                    <CardTitle>Applications</CardTitle>
                                </div>
                                <CardDescription>Review pending applications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" variant="outline">
                                    View Applications
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Settings className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <CardTitle>Settings</CardTitle>
                                </div>
                                <CardDescription>Platform configuration</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" variant="outline">
                                    Configure
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* User Info */}
                    <Card className="mt-8 card-elevated">
                        <CardHeader>
                            <CardTitle>Session Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm font-medium">{user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">User ID:</span>
                                <span className="text-sm font-mono">{user?.uid}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Email Verified:</span>
                                <span className="text-sm font-medium">
                                    {user?.emailVerified ? '✅ Yes' : '❌ No'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}
