'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ConsentGateProps {
    tenantName: string;
    onContinue: (consents: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

interface PolicyPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
}

function PolicyPopup({ isOpen, onClose, title, content }: PolicyPopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95 sm:slide-in-from-bottom-0 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl text-muted-foreground">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground leading-relaxed">
                    {content}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl transition-all active:scale-[0.98]"
                    >
                        I understand
                    </button>
                </div>
            </div>
        </div>
    );
}

const POLICY_CONTENT = {
    terms: (
        <div className="space-y-4">
            <p><strong>Effective Date:</strong> 1 January 2026</p>
            <p>By using EdApp, you agree to these Terms of Use which govern your access to our school management platform.</p>
            <h4 className="font-semibold text-foreground mt-4">1. Acceptable Use</h4>
            <p>You agree to use EdApp only for lawful purposes related to school administration, communication, and learning activities. You will not misuse the platform or attempt to gain unauthorized access.</p>
            <h4 className="font-semibold text-foreground mt-4">2. Account Responsibility</h4>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            <h4 className="font-semibold text-foreground mt-4">3. Service Availability</h4>
            <p>We strive for 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be communicated in advance.</p>
            <p className="mt-4 text-xs">For full terms, visit <Link href="/terms" target="_blank" className="text-primary hover:underline">edapp.co.za/terms</Link></p>
        </div>
    ),
    privacy: (
        <div className="space-y-4">
            <p><strong>POPIA Compliant</strong> - Protection of Personal Information Act</p>
            <h4 className="font-semibold text-foreground mt-4">What We Collect</h4>
            <p>We collect personal information necessary for school administration: names, contact details, academic records, attendance data, and communication history.</p>
            <h4 className="font-semibold text-foreground mt-4">How We Use It</h4>
            <p>Your data is used strictly for educational purposes: managing enrollment, tracking attendance, facilitating parent-teacher communication, and academic reporting.</p>
            <h4 className="font-semibold text-foreground mt-4">Data Protection</h4>
            <p>All data is encrypted in transit and at rest. We implement strict access controls and regular security audits. Data is stored in secure South African data centers.</p>
            <h4 className="font-semibold text-foreground mt-4">Your Rights</h4>
            <p>You have the right to access, correct, or request deletion of your personal information at any time.</p>
            <p className="mt-4 text-xs">Full privacy notice at <Link href="/privacy" target="_blank" className="text-primary hover:underline">edapp.co.za/privacy</Link></p>
        </div>
    ),
    childSafety: (
        <div className="space-y-4">
            <p><strong>Keeping learners safe is our priority.</strong></p>
            <h4 className="font-semibold text-foreground mt-4">Community Standards</h4>
            <ul className="list-disc pl-5 space-y-1">
                <li>Treat all users with respect and dignity</li>
                <li>No bullying, harassment, or hate speech</li>
                <li>No sharing of inappropriate content</li>
                <li>Protect learner privacy at all times</li>
            </ul>
            <h4 className="font-semibold text-foreground mt-4">Reporting Concerns</h4>
            <p>Any concerning behavior can be reported to school administration or directly through EdApp's reporting feature. All reports are handled confidentially.</p>
            <h4 className="font-semibold text-foreground mt-4">Content Moderation</h4>
            <p>All communications are subject to school oversight. Inappropriate content will be removed and may result in account suspension.</p>
            <p className="mt-4 text-xs">Full policy at <Link href="/child-safety" target="_blank" className="text-primary hover:underline">edapp.co.za/child-safety</Link></p>
        </div>
    ),
    communications: (
        <div className="space-y-4">
            <p><strong>How your school communicates with you through EdApp.</strong></p>
            <h4 className="font-semibold text-foreground mt-4">Essential Notifications</h4>
            <p>You will receive notifications for:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Emergency alerts (safety, weather, closures)</li>
                <li>Critical academic updates (exams, deadlines)</li>
                <li>Fee reminders and payment confirmations</li>
                <li>Important school announcements</li>
            </ul>
            <h4 className="font-semibold text-foreground mt-4">Quiet Hours</h4>
            <p>Non-urgent notifications respect quiet hours (9pm–6am). Emergency alerts may override this for safety reasons.</p>
            <h4 className="font-semibold text-foreground mt-4">Manage Preferences</h4>
            <p>You can customize notification preferences in Settings after logging in.</p>
        </div>
    )
};

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

    const [activePopup, setActivePopup] = useState<keyof typeof POLICY_CONTENT | null>(null);

    const allRequiredChecked = required.terms && required.privacy && required.childSafety && required.communications;
    const requiredCount = Object.values(required).filter(Boolean).length;

    const handleContinue = () => {
        if (!allRequiredChecked) return;
        onContinue({
            ...required,
            ...optional
        });
    };

    const openPopup = (policy: keyof typeof POLICY_CONTENT, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActivePopup(policy);
    };

    return (
        <>
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
                                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    I agree to the Terms of Use
                                    <button
                                        onClick={(e) => openPopup('terms', e)}
                                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <span className="text-xs font-bold">?</span>
                                    </button>
                                    <span className="text-red-500">*</span>
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
                                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    I've read the Privacy Notice
                                    <button
                                        onClick={(e) => openPopup('privacy', e)}
                                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <span className="text-xs font-bold">?</span>
                                    </button>
                                    <span className="text-red-500">*</span>
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
                                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    I'll follow Child Safety & Community Rules
                                    <button
                                        onClick={(e) => openPopup('childSafety', e)}
                                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <span className="text-xs font-bold">?</span>
                                    </button>
                                    <span className="text-red-500">*</span>
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
                                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    I understand EdApp may send school notices
                                    <button
                                        onClick={(e) => openPopup('communications', e)}
                                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <span className="text-xs font-bold">?</span>
                                    </button>
                                    <span className="text-red-500">*</span>
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

            {/* Policy Popups */}
            <PolicyPopup
                isOpen={activePopup === 'terms'}
                onClose={() => setActivePopup(null)}
                title="Terms of Use"
                content={POLICY_CONTENT.terms}
            />
            <PolicyPopup
                isOpen={activePopup === 'privacy'}
                onClose={() => setActivePopup(null)}
                title="Privacy Notice"
                content={POLICY_CONTENT.privacy}
            />
            <PolicyPopup
                isOpen={activePopup === 'childSafety'}
                onClose={() => setActivePopup(null)}
                title="Child Safety & Community Rules"
                content={POLICY_CONTENT.childSafety}
            />
            <PolicyPopup
                isOpen={activePopup === 'communications'}
                onClose={() => setActivePopup(null)}
                title="Communication Notices"
                content={POLICY_CONTENT.communications}
            />
        </>
    );
}
