'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, GraduationCap, Hash, AlertCircle, Clock } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RoleLoginPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const role = params.role as string;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
    const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

    // Learner login state
    const [studentNumber, setStudentNumber] = useState('');
    const [pin, setPin] = useState('');

    // Email login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isLearner = role === 'learner';

    // Calculate remaining lockout time
    const getRemainingTime = () => {
        if (!lockedUntil) return 0;
        const remaining = Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000));
        return remaining;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLearnerLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/v1/auth/learner/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentNumber, pin, tenantSlug: slug }),
            });

            const data = await response.json();

            if (data.locked) {
                setLockedUntil(new Date(data.lockedUntil));
                setError('Account temporarily locked due to too many failed attempts');
                // Start countdown timer
                const interval = setInterval(() => {
                    const remaining = getRemainingTime();
                    if (remaining <= 0) {
                        setLockedUntil(null);
                        setError('');
                        clearInterval(interval);
                    }
                }, 1000);
                return;
            }

            if (!data.success) {
                setAttemptsRemaining(data.attemptsRemaining);
                setError(data.message || 'Invalid student number or PIN');
                return;
            }

            // Sign in with custom token
            await signInWithCustomToken(auth, data.customToken);

            // Redirect to dashboard
            router.push(`/tenant/${slug}/dashboard`);
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            // Verify with backend for tenant isolation
            const response = await fetch('/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, tenantSlug: slug }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Authentication failed');
            }

            // Redirect to dashboard
            router.push(`/tenant/${slug}/dashboard`);
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const getRoleTitle = () => {
        const titles: Record<string, string> = {
            admin: 'Admin Login',
            staff: 'Staff Login',
            parent: 'Parent/Guardian Login',
            learner: 'Learner Login',
        };
        return titles[role] || 'Login';
    };

    const getRoleDescription = () => {
        const descriptions: Record<string, string> = {
            admin: 'Enter your admin credentials',
            staff: 'Enter your staff credentials',
            parent: 'Enter your parent/guardian credentials',
            learner: 'Enter your student number and PIN',
        };
        return descriptions[role] || 'Enter your credentials';
    };

    return (
        <div className="app-page">
            <div className="app-container">
                <div className="flex flex-col items-center justify-center min-h-screen py-8">
                    {/* Back Button */}
                    <div className="w-full max-w-md mb-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="hover:bg-muted"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to roles
                        </Button>
                    </div>

                    {/* Login Card */}
                    <Card className="w-full max-w-md card-elevated slide-in-bottom">
                        <CardHeader>
                            <CardTitle>{getRoleTitle()}</CardTitle>
                            <CardDescription>{getRoleDescription()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLearner ? (
                                // Learner Login Form
                                <form onSubmit={handleLearnerLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="studentNumber">Student Number</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="studentNumber"
                                                type="text"
                                                placeholder="Enter student number"
                                                value={studentNumber}
                                                onChange={(e) => setStudentNumber(e.target.value)}
                                                className="pl-10 input-outline-effect"
                                                disabled={loading || !!lockedUntil}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pin">PIN</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="pin"
                                                type="password"
                                                placeholder="Enter 4-6 digit PIN"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="pl-10 input-outline-effect"
                                                maxLength={6}
                                                disabled={loading || !!lockedUntil}
                                            />
                                        </div>
                                    </div>

                                    {/* Lockout Timer */}
                                    {lockedUntil && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Clock className="h-5 w-5 text-destructive mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-destructive">Account Locked</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Too many failed attempts. Try again in {formatTime(getRemainingTime())}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {error && !lockedUntil && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-destructive">{error}</p>
                                                    {attemptsRemaining !== null && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full btn-outline-effect"
                                        disabled={loading || !studentNumber || !pin || !!lockedUntil}
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            className="text-sm text-primary hover:underline"
                                            onClick={() => alert('Contact your teacher for PIN reset')}
                                        >
                                            Need help?
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // Email Login Form
                                <form onSubmit={handleEmailLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 input-outline-effect"
                                                disabled={loading}
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
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 input-outline-effect"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                                <p className="text-sm text-destructive">{error}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full btn-outline-effect"
                                        disabled={loading || !email || !password}
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>

                                    <div className="text-center space-y-2">
                                        <button
                                            type="button"
                                            className="text-sm text-primary hover:underline block w-full"
                                            onClick={() => alert('Password reset via email')}
                                        >
                                            Forgot password?
                                        </button>
                                        <p className="text-xs text-muted-foreground">
                                            Or sign in with magic link (coming soon)
                                        </p>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
