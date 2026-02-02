'use client';

import { useState, useEffect } from 'react';

interface MagicLinkSentProps {
    email: string;
    onResend: () => void;
    onUseOtherMethod: () => void;
    loading?: boolean;
}

export function MagicLinkSent({
    email,
    onResend,
    onUseOtherMethod,
    loading = false
}: MagicLinkSentProps) {
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleResend = () => {
        if (!canResend || loading) return;
        setCountdown(60);
        setCanResend(false);
        onResend();
    };

    return (
        <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                    mark_email_read
                </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-foreground mb-2">
                Check your email
            </h2>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-2">
                We sent a magic link to
            </p>
            <p className="text-base font-semibold text-foreground mb-6">
                {email}
            </p>

            {/* Instructions */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground">
                    Click the link in the email to sign in. The link will expire in 10 minutes.
                </p>
            </div>

            {/* Resend Section */}
            <div className="space-y-3">
                {canResend ? (
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="text-indigo-600 font-medium text-sm hover:underline disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Resend magic link'}
                    </button>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Resend in <span className="font-semibold text-foreground">{countdown}s</span>
                    </p>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <button
                        onClick={onUseOtherMethod}
                        className="text-slate-600 dark:text-slate-400 font-medium text-sm hover:text-foreground transition-colors"
                    >
                        Use a different sign-in method
                    </button>
                </div>
            </div>

            {/* Email Check Reminder */}
            <p className="mt-6 text-xs text-muted-foreground">
                Don't see the email? Check your spam folder.
            </p>
        </div>
    );
}
