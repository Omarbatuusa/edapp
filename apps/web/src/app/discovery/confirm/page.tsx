'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function ConfirmPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const [tenant, setTenant] = useState<any>(null);

    useEffect(() => {
        // Get tenant from session storage
        const stored = sessionStorage.getItem('tenant');
        if (stored) {
            setTenant(JSON.parse(stored));
        } else if (slug) {
            // Fallback: fetch tenant by slug
            router.push('/discovery');
        }
    }, [slug, router]);

    const handleContinue = () => {
        if (tenant) {
            // In production, redirect to tenant subdomain
            // For local testing, redirect to tenant login page
            router.push(`/tenant/${tenant.slug}/login`);
        }
    };

    const handleChangeSchool = () => {
        sessionStorage.removeItem('tenant');
        router.push('/discovery');
    };

    if (!tenant) {
        return (
            <div className="app-page">
                <div className="app-container flex items-center justify-center min-h-screen">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-page">
            <div className="app-container">
                <div className="flex flex-col items-center justify-center min-h-screen py-8">
                    {/* Tenant Card */}
                    <Card className="w-full max-w-md card-elevated slide-in-bottom">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Confirm Your School</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* School Logo */}
                            <div className="flex justify-center">
                                {tenant.logo ? (
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                                        <Image
                                            src={tenant.logo}
                                            alt={tenant.name}
                                            width={96}
                                            height={96}
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-12 w-12 text-primary" />
                                    </div>
                                )}
                            </div>

                            {/* School Info */}
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">{tenant.name}</h2>
                                {tenant.campus && (
                                    <div className="flex items-center justify-center text-muted-foreground">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span>{tenant.campus}</span>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Code: <span className="font-mono font-bold">{tenant.slug.toUpperCase()}</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Button
                                    onClick={handleContinue}
                                    className="w-full btn-outline-effect"
                                    size="lg"
                                >
                                    Continue to Login
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <Button
                                    onClick={handleChangeSchool}
                                    variant="ghost"
                                    className="w-full"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Change School
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
