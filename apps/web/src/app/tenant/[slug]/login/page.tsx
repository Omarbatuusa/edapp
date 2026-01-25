'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, GraduationCap, User } from 'lucide-react';

const roles = [
    {
        id: 'admin',
        name: 'Admin',
        icon: Shield,
        description: 'School administrators',
        color: 'bg-purple-500',
    },
    {
        id: 'staff',
        name: 'Staff',
        icon: Users,
        description: 'Teachers and staff members',
        color: 'bg-blue-500',
    },
    {
        id: 'parent',
        name: 'Parent/Guardian',
        icon: User,
        description: 'Parents and guardians',
        color: 'bg-green-500',
    },
    {
        id: 'learner',
        name: 'Learner',
        icon: GraduationCap,
        description: 'Students',
        color: 'bg-orange-500',
    },
];

export default function TenantLoginPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [lastRole, setLastRole] = useState<string | null>(null);

    useEffect(() => {
        // Get last selected role from localStorage
        const stored = localStorage.getItem(`lastRole_${slug}`);
        if (stored) {
            setLastRole(stored);
        }
    }, [slug]);

    const handleRoleSelect = (roleId: string) => {
        setSelectedRole(roleId);
        // Save to localStorage
        localStorage.setItem(`lastRole_${slug}`, roleId);
        // Navigate to role-specific login
        router.push(`/tenant/${slug}/login/${roleId}`);
    };

    return (
        <div className="app-page">
            <div className="app-container">
                <div className="flex flex-col items-center justify-center min-h-screen py-8">
                    {/* Header */}
                    <div className="mb-8 text-center slide-in-bottom">
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Select your role to continue
                        </p>
                    </div>

                    {/* Role Cards Grid */}
                    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {roles.map((role, index) => {
                            const Icon = role.icon;
                            const isLastUsed = role.id === lastRole;
                            const isSelected = role.id === selectedRole;

                            return (
                                <Card
                                    key={role.id}
                                    className={`
                                        role-card cursor-pointer transition-all duration-200
                                        ${isSelected ? 'selected' : ''}
                                        ${isLastUsed ? 'ring-2 ring-primary ring-offset-2' : ''}
                                        slide-in-bottom
                                    `}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => handleRoleSelect(role.id)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className={`p-3 rounded-lg ${role.color} bg-opacity-10`}>
                                                <Icon className={`h-6 w-6 ${role.color.replace('bg-', 'text-')}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-lg">{role.name}</h3>
                                                    {isLastUsed && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                            Last used
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {role.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Not a current learner or parent?{' '}
                            <button
                                onClick={() => router.push(`/apply/${slug}`)}
                                className="text-primary hover:underline font-medium"
                            >
                                Apply Now
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
