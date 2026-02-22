'use client';

import { useState } from 'react';

interface Step {
    title: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="mb-6">
            {/* Mobile collapse toggle */}
            <button
                type="button"
                onClick={() => setCollapsed(c => !c)}
                className="flex items-center gap-2 w-full mb-3 sm:hidden"
            >
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-xs font-medium text-blue-600">{steps[currentStep]?.title}</span>
                <span className="material-symbols-outlined text-slate-400 text-sm ml-auto">
                    {collapsed ? 'expand_more' : 'expand_less'}
                </span>
            </button>

            {/* Steps */}
            <div className={`${collapsed ? 'hidden' : 'flex'} sm:flex flex-wrap gap-1 sm:gap-0 items-center`}>
                {steps.map((step, idx) => {
                    const done = idx < currentStep;
                    const active = idx === currentStep;
                    const future = idx > currentStep;

                    return (
                        <div key={idx} className="flex items-center">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                active
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                    : done
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                    active ? 'bg-white text-blue-600' : done ? 'bg-blue-600 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-500'
                                }`}>
                                    {done ? '✓' : idx + 1}
                                </span>
                                <span className="hidden sm:inline">{step.title}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`hidden sm:block h-px w-4 mx-1 ${done ? 'bg-blue-300 dark:bg-blue-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
