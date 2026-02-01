'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ConsentGateProps {
    tenantName: string;
    onContinue: (consents: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ConsentGate({ tenantName, onContinue, onCancel, loading = false }: ConsentGateProps) {
    const [required, setRequired] = useState({
        terms: false,
        privacy: false,
        childSafety: false,
        communications: false
    });

    const [optional, setOptional] = useState({
        notifications: false, // "Recommended" but technically optional to proceed? Prompt says "Required checkbox group" vs "Optional preferences".
        // Actually notifications is listed under "Optional preferences".
        email: false,
        sms: false,
        marketing: false
    });

    const allRequiredChecked = required.terms && required.privacy && required.childSafety && required.communications;

    const handleContinue = () => {
        if (!allRequiredChecked) return;
        onContinue({
            ...required,
            ...optional
        });
    };

    return (
        <div className="w-full max-w-md mx-auto relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-2xl font-bold tracking-tight text-center mb-2 text-foreground">Before you continue</h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
                We need a few confirmations to use EdApp for {tenantName}. You can change your preferences later in Settings.
            </p>

            <div className="surface-card space-y-6">
                {/* Required Section */}
                <div className="space-y-4">
                    <label className="flex gap-3 items-start group cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.terms}
                            onChange={(e) => setRequired({ ...required, terms: e.target.checked })}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-foreground">
                                I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms of Use</Link>.
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5">This covers account rules, acceptable use, and service limits.</p>
                        </div>
                    </label>

                    <label className="flex gap-3 items-start group cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.privacy}
                            onChange={(e) => setRequired({ ...required, privacy: e.target.checked })}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-foreground">
                                I confirm I’ve read the <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Notice</Link>.
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5">It explains how your school and EdApp process personal information under POPIA.</p>
                        </div>
                    </label>

                    <label className="flex gap-3 items-start group cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.childSafety}
                            onChange={(e) => setRequired({ ...required, childSafety: e.target.checked })}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-foreground">
                                I will follow the <Link href="/child-safety" target="_blank" className="text-primary hover:underline">Child Safety & Community Rules</Link>.
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5">Help keep communication respectful and safe for learners.</p>
                        </div>
                    </label>

                    <label className="flex gap-3 items-start group cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.communications}
                            onChange={(e) => setRequired({ ...required, communications: e.target.checked })}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-foreground">
                                I understand EdApp may send important school <Link href="/communications-notices" target="_blank" className="text-primary hover:underline">notices</Link>.
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5">Emergency alerts and critical updates may override quiet hours.</p>
                        </div>
                    </label>
                </div>

                <div className="h-px bg-border/50 my-4" />

                {/* Optional Section */}
                <div className="space-y-4">
                    <label className="flex gap-3 items-start group cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-border text-muted-foreground focus:ring-muted-foreground/20 transition cursor-pointer"
                            checked={optional.notifications}
                            onChange={(e) => setOptional({ ...optional, notifications: e.target.checked })}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-foreground/80">
                                Turn on notifications. (Recommended)
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5">Get updates for messages, attendance, homework, and announcements.</p>
                        </div>
                    </label>

                    <label className="flex gap-3 items-start group cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-border text-muted-foreground focus:ring-muted-foreground/20 transition cursor-pointer"
                            checked={optional.email}
                            onChange={(e) => setOptional({ ...optional, email: e.target.checked })}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-foreground/80">
                                Send me email updates when needed.
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5">For receipts, letters, and important notices.</p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <button
                    onClick={handleContinue}
                    disabled={!allRequiredChecked || loading}
                    className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                    {loading ? 'Processing...' : 'Continue'}
                </button>

                <button
                    onClick={onCancel}
                    className="w-full h-10 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                    Cancel / Sign Out
                </button>
            </div>
        </div>
    );
}
