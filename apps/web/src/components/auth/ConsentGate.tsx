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
        notifications: false,
        email: false
    });

    const allRequiredChecked = required.terms && required.privacy && required.childSafety && required.communications;
    const requiredCount = Object.values(required).filter(Boolean).length;

    const handleContinue = () => {
        if (!allRequiredChecked) return;
        onContinue({
            ...required,
            ...optional
        });
    };

    return (
        <div className="w-full max-w-lg mx-auto relative z-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-2">
                    Before you continue
                </h1>
                <p className="text-sm text-muted-foreground">
                    We need a few confirmations to use EdApp for {tenantName}.
                </p>
            </div>

            {/* Required Section */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Required
                    </h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${allRequiredChecked
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                        {requiredCount}/4 completed
                    </span>
                </div>

                <div className="space-y-3">
                    {/* Terms */}
                    <label className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${required.terms
                            ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                        }`}>
                        <input
                            type="checkbox"
                            className="mt-0.5 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.terms}
                            onChange={(e) => setRequired({ ...required, terms: e.target.checked })}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">
                                I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms of Use</Link>
                                <span className="text-red-500 ml-0.5">*</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Account rules, acceptable use, and service limits.</p>
                        </div>
                    </label>

                    {/* Privacy */}
                    <label className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${required.privacy
                            ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                        }`}>
                        <input
                            type="checkbox"
                            className="mt-0.5 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.privacy}
                            onChange={(e) => setRequired({ ...required, privacy: e.target.checked })}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">
                                I've read the <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Notice</Link>
                                <span className="text-red-500 ml-0.5">*</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">How your school and EdApp process data under POPIA.</p>
                        </div>
                    </label>

                    {/* Child Safety */}
                    <label className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${required.childSafety
                            ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                        }`}>
                        <input
                            type="checkbox"
                            className="mt-0.5 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.childSafety}
                            onChange={(e) => setRequired({ ...required, childSafety: e.target.checked })}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">
                                I'll follow the <Link href="/child-safety" target="_blank" className="text-primary hover:underline">Child Safety & Community Rules</Link>
                                <span className="text-red-500 ml-0.5">*</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Keep communication respectful and safe for learners.</p>
                        </div>
                    </label>

                    {/* Communications */}
                    <label className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${required.communications
                            ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                        }`}>
                        <input
                            type="checkbox"
                            className="mt-0.5 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 transition cursor-pointer"
                            checked={required.communications}
                            onChange={(e) => setRequired({ ...required, communications: e.target.checked })}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">
                                I understand EdApp may send school <Link href="/communications-notices" target="_blank" className="text-primary hover:underline">notices</Link>
                                <span className="text-red-500 ml-0.5">*</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Emergency alerts may override quiet hours.</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Optional Section */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Optional Preferences
                </h2>

                <div className="space-y-3">
                    <label className="flex gap-3 p-3 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <input
                            type="checkbox"
                            className="mt-0.5 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-slate-600 focus:ring-slate-600/20 transition cursor-pointer"
                            checked={optional.notifications}
                            onChange={(e) => setOptional({ ...optional, notifications: e.target.checked })}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                Enable push notifications
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">Recommended</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Messages, attendance, homework updates.</p>
                        </div>
                    </label>

                    <label className="flex gap-3 p-3 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <input
                            type="checkbox"
                            className="mt-0.5 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-slate-600 focus:ring-slate-600/20 transition cursor-pointer"
                            checked={optional.email}
                            onChange={(e) => setOptional({ ...optional, email: e.target.checked })}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground/80">
                                Email updates when needed
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Receipts, letters, and important notices.</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Action Buttons - Sticky on mobile */}
            <div className="sticky bottom-0 left-0 right-0 bg-[#f6f7f8] dark:bg-[#101922] py-4 -mx-4 px-4 sm:relative sm:mx-0 sm:px-0 sm:bg-transparent sm:py-0">
                <div className="space-y-3 max-w-lg mx-auto">
                    {!allRequiredChecked && (
                        <p className="text-xs text-center text-amber-600 dark:text-amber-400 mb-2">
                            Please accept all required items to continue
                        </p>
                    )}
                    <button
                        onClick={handleContinue}
                        disabled={!allRequiredChecked || loading}
                        className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full h-10 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                    >
                        Cancel and sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
