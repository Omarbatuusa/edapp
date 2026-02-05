'use client';

import { useParams } from 'next/navigation';
import { SubPageHeader, SubPageWrapper } from '@/components/parent/SubPageHeader';
import { MOCK_CHILDREN } from '@/lib/parent';

export default function ChildrenPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;

    return (
        <SubPageWrapper>
            <SubPageHeader
                title="My Children"
                backHref={`/tenant/${tenantSlug}/parent`}
            />

            <div className="space-y-4">
                {MOCK_CHILDREN.map((child) => (
                    <div
                        key={child.id}
                        className="bg-card border border-border rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={child.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&size=64&background=6366f1&color=fff`}
                                alt={child.name}
                                className="w-16 h-16 rounded-xl object-cover border border-border/50"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{child.name}</h3>
                                <p className="text-sm text-muted-foreground">{child.grade} • {child.class}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${child.status === 'present'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : child.status === 'absent'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${child.status === 'present' ? 'bg-emerald-500' : child.status === 'absent' ? 'bg-red-500' : 'bg-amber-500'
                                            }`} />
                                        {child.status === 'present' ? 'At School' : child.status === 'absent' ? 'Absent' : 'Late'}
                                    </span>
                                </div>
                            </div>
                            {/* Live View Button */}
                            <button
                                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                                title="Live View"
                            >
                                <span className="material-symbols-outlined text-xl">videocam</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </SubPageWrapper>
    );
}
