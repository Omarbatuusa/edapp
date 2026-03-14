'use client';

import Link from 'next/link';

interface ProfileSection {
    label: string;
    completed: number;
    total: number;
}

interface ProfileCompletionCardProps {
    sections: ProfileSection[];
    editLink?: string;
}

export function ProfileCompletionCard({ sections, editLink }: ProfileCompletionCardProps) {
    const totalCompleted = sections.reduce((sum, s) => sum + s.completed, 0);
    const totalItems = sections.reduce((sum, s) => sum + s.total, 0);
    const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    // SVG circle params
    const size = 56;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="ios-card">
            <div className="flex items-center gap-4 mb-4">
                {/* Progress Ring */}
                <div className="relative flex-shrink-0">
                    <svg width={size} height={size} className="-rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="hsl(var(--admin-surface-alt))"
                            strokeWidth={strokeWidth}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="hsl(var(--admin-primary))"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-500"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[hsl(var(--admin-text-main))]">
                        {percentage}%
                    </span>
                </div>

                <div className="min-w-0">
                    <h3 className="type-card-title text-[hsl(var(--admin-text-main))]">Complete Your Profile</h3>
                    <p className="type-metadata text-[hsl(var(--admin-text-muted))] mt-0.5">
                        {percentage}% Complete
                    </p>
                </div>
            </div>

            {/* Section Breakdown */}
            <div className="space-y-2">
                {sections.map((section) => {
                    const done = section.completed >= section.total;
                    return (
                        <div key={section.label} className="flex items-center gap-2.5">
                            <span className={`material-symbols-outlined text-[16px] flex-shrink-0 ${done ? 'text-green-500' : 'text-[hsl(var(--admin-text-muted)/0.4)]'}`}
                                style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                                {done ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span className="type-muted text-[hsl(var(--admin-text-main))] flex-1 truncate">
                                {section.label}
                            </span>
                            <span className={`type-metadata font-semibold ${done ? 'text-green-500' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                                {section.completed}/{section.total}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* CTA */}
            {editLink && (
                <Link
                    href={editLink}
                    className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[hsl(var(--admin-primary)/0.08)] hover:bg-[hsl(var(--admin-primary)/0.14)] transition-colors"
                >
                    <span className="type-muted font-semibold text-[hsl(var(--admin-primary))]">Continue Setup</span>
                    <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))]">arrow_forward</span>
                </Link>
            )}
        </div>
    );
}
