'use client';

import { ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { z, ZodSchema } from 'zod';
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
    /** Optional right-side panel for desktop (calendar, tips, etc.) */
    sidePanel?: ReactNode;
    /** Hide the Cancel/arrow_back in the header */
    hideCancel?: boolean;
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
}: WizardShellProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const {
        draftId, saving, save, clearDraft,
        existingDraft, versionMismatch, resumeDraft, discardDraft,
    } = useWizardAutosave(formType, tenantId);
    const [showDraftBanner, setShowDraftBanner] = useState(false);

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;
    const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100;

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
                const hasUserEdits = Object.keys(prev).some(k => !k.startsWith('_') && prev[k] !== initialData[k] && prev[k] !== undefined && prev[k] !== '');
                return hasUserEdits ? prev : { ...prev, ...initialData };
            });
        }
    }, [initialData]);

    // Scroll to top on step change
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

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
        setTimeout(() => {
            const el = document.querySelector(`[data-field="${firstKey}"], [name="${firstKey}"]`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    }, []);

    const validate = (): boolean => {
        if (!step.schema) return true;
        try {
            step.schema.parse(data);
            setErrors({});
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
            scrollToFirstError(fieldErrors);
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

    return (
        <div className="wizard-sheet">
            {/* ── STICKY HEADER: back + progress bar + saving indicator ── */}
            <div className="wizard-sheet-header">
                <div className="flex items-center gap-3 px-4 py-3">
                    {/* Back / Close button — always show close on step 1 if onCancel exists */}
                    {currentStep > 0 ? (
                        <button type="button" onClick={handleBack} className="wizard-header-btn" aria-label="Go back">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                    ) : onCancel ? (
                        <button type="button" onClick={onCancel} className="wizard-header-btn" aria-label="Close">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    ) : (
                        <div className="w-9" /> /* spacer */
                    )}

                    {/* Step info — centered title + visual pills */}
                    <div className="flex-1 min-w-0 text-center">
                        <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))] truncate">{step.title}</p>
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-[5px] rounded-full transition-all duration-300 ${
                                        i === currentStep
                                            ? 'w-5 bg-[hsl(var(--admin-primary))]'
                                            : i < currentStep
                                            ? 'w-2 bg-[hsl(var(--admin-primary)/0.5)]'
                                            : 'w-2 bg-[hsl(var(--admin-border))]'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Saving indicator / spacer */}
                    <div className="w-9 flex items-center justify-center">
                        {saving && (
                            <div className="w-4 h-4 border-[1.5px] border-[hsl(var(--admin-border))] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                        )}
                    </div>
                </div>

                {/* Progress bar — full width, attached to header bottom */}
                <div className="h-[3px] w-full bg-[hsl(var(--admin-border)/0.3)]">
                    <div
                        className="h-full bg-[hsl(var(--admin-primary))] transition-all duration-400 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <div className="wizard-sheet-body" ref={scrollRef}>
                {/* Draft Resume Banner */}
                {showDraftBanner && (
                    <div className="px-4 pt-4">
                        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-amber-600 text-[18px] flex-shrink-0">drafts</span>
                                <p className="text-[12px] font-semibold text-amber-800 truncate">
                                    {versionMismatch ? 'Older draft found' : 'Resume draft?'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button type="button" onClick={handleDiscardDraft}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
                                    Discard
                                </button>
                                <button type="button" onClick={handleResumeDraft}
                                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
                                    Resume
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="wizard-sheet-content">
                    {/* Illustration — always visible, centered above form */}
                    {step.illustration && (
                        <div className="flex justify-center py-4 lg:py-6">
                            <div className="w-[140px] h-[112px] sm:w-[160px] sm:h-[128px] lg:w-[180px] lg:h-[144px] flex items-center justify-center">
                                {step.illustration}
                            </div>
                        </div>
                    )}

                    {/* Form area */}
                    <div className="wizard-form-area">
                        <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:items-start">
                            {/* Main form — single column mobile, 3/5 desktop */}
                            <div className={`${sidePanel ? 'lg:col-span-3' : 'lg:col-span-5 lg:max-w-2xl lg:mx-auto'}`}>
                                {step.helper && (
                                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mb-5 leading-relaxed">{step.helper}</p>
                                )}
                                <div className="flex flex-col gap-5">
                                    {step.content({ data, onChange: patchData, errors, draftId })}
                                </div>
                            </div>

                            {/* Side panel — below form on mobile/tablet, beside on desktop */}
                            {sidePanel && (
                                <div className="mt-6 lg:mt-0 lg:col-span-2 flex flex-col gap-5">
                                    {sidePanel}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STICKY FOOTER: primary CTA ── */}
            <div className="wizard-sheet-footer">
                {submitError && (
                    <p className="text-[12px] text-red-500 text-center mb-2 px-4">{submitError}</p>
                )}
                <div className="px-4 flex gap-3">
                    {currentStep > 0 && (
                        <button type="button" onClick={handleBack} className="wizard-secondary-btn">
                            Back
                        </button>
                    )}
                    {isLast ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="wizard-primary-btn flex-1"
                        >
                            {submitting && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                            {submitting ? 'Saving...' : submitLabel}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="wizard-primary-btn flex-1"
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
