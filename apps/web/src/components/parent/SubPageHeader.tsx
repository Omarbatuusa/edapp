'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface SubPageHeaderProps {
    title: string;
    backHref: string;
    actions?: React.ReactNode;
}

export function SubPageHeader({ title, backHref, actions }: SubPageHeaderProps) {
    return (
        <div className="mb-6">
            {/* Header row with back button and title */}
            <div className="flex items-center gap-3">
                <Link
                    href={backHref}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft size={22} className="text-foreground" />
                </Link>
                <h1 className="text-xl font-bold flex-1">{title}</h1>
                {/* Actions on desktop */}
                {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}
            </div>
            {/* Actions on mobile - shown below title */}
            {actions && <div className="flex sm:hidden items-center gap-2 mt-3 pl-12">{actions}</div>}
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
