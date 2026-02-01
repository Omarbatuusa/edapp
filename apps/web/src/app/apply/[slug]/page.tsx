'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Phone, User, ArrowRight } from 'lucide-react';
import { AuthFooter } from "@/components/layout/AuthFooter";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { HelpPopup } from "@/components/discovery/help-popup";

export default function ApplicantPortalPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [isSignup, setIsSignup] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showHelp, setShowHelp] = useState(false);

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

    const handleBack = () => {
        router.push(`/tenant/${slug}/login`);
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300">
            <AuthHeader
                onBack={handleBack}
                onHelp={() => setShowHelp(true)}
            />

            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">

                {/* Header Text */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">
                        Apply to {slug ? slug.toUpperCase() : 'School'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isSignup ? 'Create an account to start your application' : 'Sign in to continue your application'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {isSignup && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number (Optional)"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="text-center text-sm pt-2">
                        {isSignup ? (
                            <p className="text-slate-500">
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
                            <p className="text-slate-500">
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

                <div className="mt-8 text-center text-sm text-slate-400">
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
            </main>

            <AuthFooter />
            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
