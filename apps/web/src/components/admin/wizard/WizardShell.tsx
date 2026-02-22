'use client';

import { ReactNode, useState, useEffect } from 'react';
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
    formType: 'MAIN_BRANCH' | 'BRANCH' | 'BRAND';
    tenantId?: string;
    submitLabel?: string;
    onComplete: (data: Record<string, any>) => Promise<void>;
    onCancel?: () => void;
    initialData?: Record<string, any>;
}

export function WizardShell({
    steps,
    formType,
    tenantId,
    submitLabel = 'Create',
    onComplete,
    onCancel,
    initialData = {},
}: WizardShellProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const { draftId, saving, save, clearDraft } = useWizardAutosave(formType, tenantId);

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    // Autosave on data/step change
    useEffect(() => {
        save(currentStep, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, data]);

    const patchData = (patch: Record<string, any>) => {
        setData(prev => ({ ...prev, ...patch }));
        setErrors({});
    };

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
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Cancel
                        </button>
                    )}
                    <div className="flex-1">
                        <StepIndicator steps={steps} currentStep={currentStep} />
                    </div>
                    {saving && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <div className="w-3 h-3 border border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                            Saving...
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    {/* Form */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{step.title}</h2>
                        {step.helper && <p className="text-sm text-slate-500 mb-6">{step.helper}</p>}
                        <div className="flex flex-col gap-5">
                            {step.content({ data, onChange: patchData, errors, draftId })}
                        </div>
                    </div>

                    {/* Illustration (desktop only) */}
                    <div className="hidden lg:flex lg:col-span-2 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 min-h-[280px]">
                        {step.illustration}
                    </div>
                </div>
            </div>

            {/* Footer nav */}
            <div className="sticky bottom-0 z-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-0 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back
                    </button>

                    {submitError && (
                        <p className="text-sm text-red-500 text-center flex-1 mx-4">{submitError}</p>
                    )}

                    {isLast ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-colors shadow-sm shadow-blue-200"
                        >
                            {submitting && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                            {submitting ? 'Creating...' : submitLabel}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center gap-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm shadow-blue-200"
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
