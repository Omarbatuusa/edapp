'use client';

interface SubPageHeaderProps {
    title: string;
    backHref?: string;
    actions?: React.ReactNode;
    /** Show back button in the header (for fullscreen pages without shell SubpageBar) */
    showBackButton?: boolean;
}

export function SubPageHeader({ title, actions, showBackButton }: SubPageHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between gap-3">
                {showBackButton && (
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors -ml-1"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                )}
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
        <div className="app-content-padding pb-20">
            {children}
        </div>
    );
}
