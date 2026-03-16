'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { z, ZodSchema } from 'zod';
import { StepIndicator } from './StepIndicator';
import { useWizardAutosave } from './useWizardAutosave';

export interface WizardStep {
    title: string;
    helper?: string;
    illustration: ReactNode;
    schema?: ZodSchema;
    content: (props: {
        data: Record<string, any>;
        onChange: (patch: Record<string, any>) => void;
        errors: Record<string, string>;
        draftId: string | null;
    }) => ReactNode;
}

interface WizardShellProps {
    steps: WizardStep[];
    formType: string;
    tenantId?: string;
    submitLabel?: string;
    onComplete: (data: Record<string, any>) => Promise<void>;
    onCancel?: () => void;
    initialData?: Record<string, any>;
    /** Optional right-side panel (replaces illustration on desktop) */
    sidePanel?: ReactNode;
    /** Hide the Cancel/arrow_back in the header (use when parent shell has its own back nav) */
    hideCancel?: boolean;
    /** Show a small illustration above the form on mobile */
    mobileIllustration?: boolean;
}

export function WizardShell({
    steps,
    formType,
    tenantId,
    submitLabel = 'Create',
    onComplete,
    onCancel,
    initialData = {},
    sidePanel,
    hideCancel = false,
    mobileIllustration = false,
}: WizardShellProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const {
        draftId, saving, save, clearDraft,
        existingDraft, versionMismatch, resumeDraft, discardDraft,
    } = useWizardAutosave(formType, tenantId);
    const [showDraftBanner, setShowDraftBanner] = useState(false);

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    // Show draft resume banner if an existing draft is found
    useEffect(() => {
        if (existingDraft && existingDraft.data && Object.keys(existingDraft.data).length > 0) {
            setShowDraftBanner(true);
        }
    }, [existingDraft]);

    // Autosave on data/step change
    useEffect(() => {
        save(currentStep, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, data]);

    // Sync initialData when it changes (e.g., edit mode loading brand data)
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setData(prev => {
                // Only update if data is still default (empty or same)
                const hasUserEdits = Object.keys(prev).some(k => !k.startsWith('_') && prev[k] !== initialData[k] && prev[k] !== undefined && prev[k] !== '');
                return hasUserEdits ? prev : { ...prev, ...initialData };
            });
        }
    }, [initialData]);

    const handleResumeDraft = () => {
        if (existingDraft) {
            setData(existingDraft.data);
            setCurrentStep(existingDraft.current_step);
            resumeDraft();
        }
        setShowDraftBanner(false);
    };

    const handleDiscardDraft = () => {
        discardDraft();
        setShowDraftBanner(false);
    };

    const patchData = useCallback((patch: Record<string, any>) => {
        setData(prev => ({ ...prev, ...patch }));
        // Clear only the changed fields' errors (not all errors)
        setErrors(prev => {
            const next = { ...prev };
            for (const key of Object.keys(patch)) {
                delete next[key];
            }
            return next;
        });
    }, []);

    const scrollToFirstError = useCallback((fieldErrors: Record<string, string>) => {
        const firstKey = Object.keys(fieldErrors)[0];
        if (!firstKey) return;
        // Try to find the field element by data attribute or name
        setTimeout(() => {
            const el = document.querySelector(`[data-field="${firstKey}"], [name="${firstKey}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
    }, []);

    const validate = (): boolean => {
        if (!step.schema) return true;
        try {
            step.schema.parse(data);
            setErrors({});
            setShakeFields(new Set());
            return true;
        } catch (e: any) {
            const fieldErrors: Record<string, string> = {};
            if (e?.errors) {
                for (const err of e.errors) {
                    const path = err.path.join('.');
                    if (path) fieldErrors[path] = err.message;
                }
            }
            setErrors(fieldErrors);
            setShakeFields(new Set(Object.keys(fieldErrors)));
            scrollToFirstError(fieldErrors);
            // Clear shake after animation
            setTimeout(() => setShakeFields(new Set()), 500);
            return false;
        }
    };

    const handleNext = () => {
        if (!validate()) return;
        if (!isLast) {
            setCurrentStep(s => s + 1);
            setErrors({});
        }
    };

    const handleBack = () => {
        setCurrentStep(s => Math.max(0, s - 1));
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            await onComplete(data);
            clearDraft();
        } catch (err: any) {
            setSubmitError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Determine right column content
    const rightContent = sidePanel || step.illustration;
    const showRightPanel = !!rightContent;

    return (
        <div className="min-h-screen bg-[hsl(var(--admin-background))] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[hsl(var(--admin-surface)/0.85)] backdrop-blur-xl border-b border-[hsl(var(--admin-border)/0.5)] px-4 sm:px-6 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    {!hideCancel && onCancel && (
                        <button type="button" onClick={onCancel} className="flex items-center gap-1 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))] text-sm transition-colors">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            <span className="hidden sm:inline">Cancel</span>
                        </button>
                    )}
                    <div className="flex-1">
                        <StepIndicator steps={steps} currentStep={currentStep} />
                    </div>
                    {saving && (
                        <span className="text-[11px] text-[hsl(var(--admin-text-muted))] flex items-center gap-1 flex-shrink-0">
                            <div className="w-3 h-3 border border-[hsl(var(--admin-border))] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                            Saving
                        </span>
                    )}
                </div>
            </div>

            {/* Draft Resume Banner */}
            {showDraftBanner && (
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 mt-4">
                    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-amber-600 text-lg flex-shrink-0">drafts</span>
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-amber-800">
                                    {versionMismatch ? 'Draft found (older version)' : 'Resume previous draft?'}
                                </p>
                                <p className="text-[11px] text-amber-600 truncate">
                                    {versionMismatch
                                        ? 'This draft was created with an older form version.'
                                        : 'Continue where you left off?'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button type="button" onClick={handleDiscardDraft}
                                className="px-3 py-1.5 text-[12px] font-semibold text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
                                Discard
                            </button>
                            <button type="button" onClick={handleResumeDraft}
                                className="px-3 py-1.5 text-[12px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
                                Resume
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
                <div className={`grid grid-cols-1 ${showRightPanel ? 'lg:grid-cols-5' : ''} gap-6 lg:gap-8 items-start`}>
                    {/* Form card */}
                    <div className={`${showRightPanel ? 'lg:col-span-3' : ''} bg-[hsl(var(--admin-surface))] rounded-2xl shadow-sm border border-[hsl(var(--admin-border)/0.5)] p-5 sm:p-6`}>
                        {/* Mobile illustration (small, above title) */}
                        {mobileIllustration && step.illustration && (
                            <div className="lg:hidden flex justify-center mb-4 opacity-60">
                                <div className="h-10 w-auto">
                                    {step.illustration}
                                </div>
                            </div>
                        )}

                        <h2 className="text-lg sm:text-xl font-bold text-[hsl(var(--admin-text-main))] mb-1">{step.title}</h2>
                        {step.helper && <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mb-5">{step.helper}</p>}
                        <div className="flex flex-col gap-5">
                            {step.content({ data, onChange: patchData, errors, draftId })}
                        </div>
                    </div>

                    {/* Right panel: illustration or custom side panel (desktop only) */}
                    {showRightPanel && (
                        <div className="hidden lg:flex lg:col-span-2 flex-col gap-5">
                            {sidePanel ? (
                                sidePanel
                            ) : (
                                <div className="flex items-center justify-center bg-gradient-to-br from-[hsl(var(--admin-primary)/0.05)] to-[hsl(210_100%_50%/0.08)] rounded-2xl p-8 min-h-[280px] border border-[hsl(var(--admin-border)/0.3)]">
                                    {step.illustration}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer nav — sticky with glass effect */}
            <div className="sticky bottom-0 z-20 bg-[hsl(var(--admin-surface)/0.85)] backdrop-blur-xl border-t border-[hsl(var(--admin-border)/0.5)] px-4 sm:px-6 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}>
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="flex items-center gap-1 h-11 px-4 rounded-xl text-[hsl(var(--admin-text-sub))] font-medium text-sm hover:bg-[hsl(var(--admin-surface-alt))] disabled:opacity-0 disabled:pointer-events-none transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back
                    </button>

                    {submitError && (
                        <p className="text-[13px] text-red-500 text-center flex-1 mx-4 truncate">{submitError}</p>
                    )}

                    {isLast ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 h-11 px-6 bg-[hsl(var(--admin-primary))] hover:bg-[hsl(211_100%_45%)] text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-all shadow-sm active:scale-[0.97]"
                        >
                            {submitting && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                            {submitting ? 'Saving...' : submitLabel}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center gap-1 h-11 px-6 bg-[hsl(var(--admin-primary))] hover:bg-[hsl(211_100%_45%)] text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.97]"
                        >
                            Next
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
