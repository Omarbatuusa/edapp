"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Ensure this path is correct based on previous steps
import { useState, use } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ApplicantPortalPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        grade: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleNext = () => {
        setStep(step + 1)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        alert(`Application Submitted for ${slug.toUpperCase()}!\nData: ${JSON.stringify(formData, null, 2)}`)
        // API call would go here
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-10">
            <div className="w-full max-w-2xl">
                <Link href={`/`} className="flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Apply to {slug.toUpperCase()}</CardTitle>
                        <CardDescription>
                            {step === 1 ? "Student Information" : "Guardian Information"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">First Name</label>
                                            <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Last Name</label>
                                            <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="grade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Grade Applying For</label>
                                        <Input id="grade" name="grade" placeholder="Grade 8" value={formData.grade} onChange={handleChange} required />
                                    </div>

                                    <Button type="button" className="w-full" onClick={handleNext}>Next: Guardian Details</Button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label htmlFor="parentName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Parent/Guardian Name</label>
                                        <Input id="parentName" name="parentName" placeholder="Jane Doe" value={formData.parentName} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="parentEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                                        <Input id="parentEmail" name="parentEmail" type="email" placeholder="jane@example.com" value={formData.parentEmail} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="parentPhone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number</label>
                                        <Input id="parentPhone" name="parentPhone" type="tel" placeholder="+27 00 000 0000" value={formData.parentPhone} onChange={handleChange} required />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)}>Back</Button>
                                        <Button type="submit" className="w-2/3">Submit Application</Button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
