"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, ArrowRight, ArrowLeft } from "lucide-react"
import Image from "next/image"

interface TenantConfirmationProps {
    tenant: {
        slug: string
        name: string
        logo?: string | null
        campus?: string | null
    }
    onConfirm: () => void
    onChangeSchool: () => void
}

export default function TenantConfirmation({
    tenant,
    onConfirm,
    onChangeSchool
}: TenantConfirmationProps) {
    return (
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="shadow-xl border-2">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center space-y-6">
                        {/* School Logo */}
                        {tenant.logo ? (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-primary/20">
                                <Image
                                    src={tenant.logo}
                                    alt={tenant.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-4 ring-primary/20">
                                <Building2 className="h-12 w-12 text-indigo-600" />
                            </div>
                        )}

                        {/* School Name */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {tenant.name}
                            </h2>
                            {tenant.campus && (
                                <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {tenant.campus}
                                </div>
                            )}
                        </div>

                        {/* Confirmation Text */}
                        <p className="text-sm text-gray-600">
                            Is this your school?
                        </p>

                        {/* Actions */}
                        <div className="w-full space-y-3">
                            <Button
                                onClick={onConfirm}
                                className="w-full h-12 text-base font-semibold"
                            >
                                Continue to Login
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <button
                                onClick={onChangeSchool}
                                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="inline h-4 w-4 mr-1" />
                                Change school
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
