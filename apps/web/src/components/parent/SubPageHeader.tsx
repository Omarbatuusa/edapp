'use client';

interface SubPageHeaderProps {
    title: string;
    backHref?: string; // kept for backward compat, but back is handled by SubpageBar
    actions?: React.ReactNode;
}

export function SubPageHeader({ title, actions }: SubPageHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-bold flex-1">{title}</h1>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}

/**
 * Wrapper for subpage content with proper bottom padding for nav
 */
export function SubPageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="pb-20">
            {children}
        </div>
    );
}
