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
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <Link
                    href={backHref}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft size={22} className="text-foreground" />
                </Link>
                <h1 className="text-xl font-bold">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
