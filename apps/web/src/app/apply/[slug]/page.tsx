'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Phone, User, ArrowRight } from 'lucide-react';

export default function ApplicantPortalPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [isSignup, setIsSignup] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // TODO: Implement applicant signup/login
            console.log(isSignup ? 'Signup' : 'Login', { email, slug });
            await new Promise(resolve => setTimeout(resolve, 1000));
            setError('Applicant portal authentication not yet implemented');
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-page bg-gradient-to-b from-green-50 to-green-100">
            <div className="app-container">
                <div className="flex flex-col items-center justify-center min-h-screen py-8">
                    {/* Header */}
                    <div className="mb-8 text-center slide-in-bottom">
                        <h1 className="text-3xl font-bold mb-2">Apply to {slug.toUpperCase()}</h1>
                        <p className="text-muted-foreground">
                            {isSignup ? 'Create an account to start your application' : 'Sign in to continue your application'}
                        </p>
                    </div>

                    {/* Form Card */}
                    <Card className="w-full max-w-md card-elevated slide-in-bottom">
                        <CardHeader>
                            <CardTitle>{isSignup ? 'Create Account' : 'Sign In'}</CardTitle>
                            <CardDescription>
                                {isSignup ? 'Enter your details to get started' : 'Access your application dashboard'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {isSignup && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="firstName"
                                                        type="text"
                                                        placeholder="John"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        className="pl-10 input-outline-effect"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="lastName"
                                                        type="text"
                                                        placeholder="Doe"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        className="pl-10 input-outline-effect"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+27 XX XXX XXXX"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="pl-10 input-outline-effect"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 input-outline-effect"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 input-outline-effect"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full btn-outline-effect bg-green-600 hover:bg-green-700"
                                    disabled={loading}
                                >
                                    {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <div className="text-center text-sm">
                                    {isSignup ? (
                                        <p>
                                            Already have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => setIsSignup(false)}
                                                className="text-green-600 hover:underline font-medium"
                                            >
                                                Sign in
                                            </button>
                                        </p>
                                    ) : (
                                        <p>
                                            Don't have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => setIsSignup(true)}
                                                className="text-green-600 hover:underline font-medium"
                                            >
                                                Create one
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Back to Login */}
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <p>
                            Current student or parent?{' '}
                            <button
                                onClick={() => router.push(`/tenant/${slug}/login`)}
                                className="text-primary hover:underline font-medium"
                            >
                                Go to Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
