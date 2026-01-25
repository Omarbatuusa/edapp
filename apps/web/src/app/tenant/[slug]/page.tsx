"use client"

import { Button } from "@/components/ui/button"
import { Users, GraduationCap, Baby, Shield } from "lucide-react"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import AppContainer from "@/components/layout/AppContainer"

export default function TenantLoginPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter()
    const { slug } = use(params)
    const [lastRole, setLastRole] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem(`lastRole_${slug}`)
        if (stored) {
            setLastRole(stored)
        }
    }, [slug])

    const handleRoleSelect = async (role: string) => {
        localStorage.setItem(`lastRole_${slug}`, role)
        setLastRole(role)

        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            alert("Firebase API Key is missing. Please configure environment variables.");
            return;
        }

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();

            const response = await apiClient.post('/auth/login', { token });
            console.log("Login Response:", response.data);

            alert(`Welcome back, ${result.user.displayName}! Role: ${response.data.user.role}`);

        } catch (error: any) {
            console.error("Login Failed", error);
            alert(`Login Failed: ${error.message}`);
        }
    }

    const handleApplyNow = () => {
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol
            const isLocalhost = window.location.hostname.includes('localhost')

            if (isLocalhost) {
                window.location.href = `${protocol}//apply-${slug}.localhost:3000`
            } else {
                window.location.href = `${protocol}//apply-${slug}.edapp.co.za`
            }
        }
    }

    const roles = [
        {
            id: 'admin',
            title: 'Admin',
            description: 'School administrators and management',
            icon: Shield,
            color: 'indigo'
        },
        {
            id: 'staff',
            title: 'Staff',
            description: 'Teachers and staff members',
            icon: Users,
            color: 'blue'
        },
        {
            id: 'student',
            title: 'Student',
            description: 'Access your courses and grades',
            icon: GraduationCap,
            color: 'green'
        },
        {
            id: 'parent',
            title: 'Parent',
            description: "View your child's progress",
            icon: Baby,
            color: 'purple'
        }
    ]

    return (
        <AppContainer>
            <div className="w-full max-w-4xl mx-auto space-y-8 fade-in">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gradient">Welcome to {slug.toUpperCase()}</h1>
                    <p className="text-muted-foreground">Select your portal to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {roles.map((role, index) => {
                        const Icon = role.icon
                        const isLastRole = lastRole === role.id

                        return (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)}
                                className={`role-card ${isLastRole ? 'selected' : ''}`}
                                style={{
                                    animationDelay: `${index * 100}ms`
                                }}
                            >
                                {isLastRole && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full slide-in-bottom">
                                        Last used
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className={`
                    p-4 rounded-full transition-colors duration-200
                    ${isLastRole
                                            ? 'bg-primary/10'
                                            : 'bg-gray-100 group-hover:bg-primary/10'
                                        }
                  `}>
                                        <Icon className={`
                      h-8 w-8 transition-colors duration-200
                      ${isLastRole
                                                ? 'text-primary'
                                                : 'text-gray-600 group-hover:text-primary'
                                            }
                    `} />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-lg">{role.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {role.description}
                                        </p>
                                    </div>

                                    <Button
                                        className={`
                      w-full transition-all btn-outline-effect
                      ${isLastRole
                                                ? 'bg-primary hover:bg-primary/90'
                                                : 'bg-gray-900 hover:bg-gray-800'
                                            }
                    `}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRoleSelect(role.id)
                                        }}
                                    >
                                        Login as {role.title}
                                    </Button>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Apply Now Card */}
                <div className="text-center slide-in-bottom">
                    <button
                        onClick={handleApplyNow}
                        className="inline-flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-all duration-200"
                    >
                        Not a current learner or parent? <span className="ml-1 font-semibold">Apply Now →</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center space-y-2 pt-8">
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
