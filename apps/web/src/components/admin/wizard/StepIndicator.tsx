'use client';

interface Step {
    title: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    const progress = steps.length > 1 ? currentStep / (steps.length - 1) : 1;

    return (
        <div className="flex flex-col gap-2">
            {/* Step pills row */}
            <div className="flex items-center gap-1">
                {steps.map((step, idx) => {
                    const done = idx < currentStep;
                    const active = idx === currentStep;

                    return (
                        <div key={idx} className="flex items-center">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                                active
                                    ? 'bg-[hsl(var(--admin-primary))] text-white shadow-sm'
                                    : done
                                    ? 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]'
                                    : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))]'
                            }`}>
                                <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                    active
                                        ? 'bg-white text-[hsl(var(--admin-primary))]'
                                        : done
                                        ? 'bg-[hsl(var(--admin-primary))] text-white'
                                        : 'bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]'
                                }`}>
                                    {done ? (
                                        <span className="material-symbols-outlined text-[12px]">check</span>
                                    ) : idx + 1}
                                </span>
                                <span className="hidden sm:inline">{step.title}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-px w-3 sm:w-5 mx-0.5 transition-colors duration-200 ${done ? 'bg-[hsl(var(--admin-primary)/0.4)]' : 'bg-[hsl(var(--admin-border))]'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="h-[2px] w-full bg-[hsl(var(--admin-border)/0.5)] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[hsl(var(--admin-primary))] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            {/* Mobile: current step label */}
            <p className="sm:hidden text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wide">
                Step {currentStep + 1} of {steps.length} — {steps[currentStep]?.title}
            </p>
        </div>
    );
}
