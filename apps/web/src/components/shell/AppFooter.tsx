import React from 'react';

interface AppFooterProps {
    version?: string;
    className?: string;
}

export function AppFooter({ version = '1.0.0', className = '' }: AppFooterProps) {
    const year = new Date().getFullYear();

    return (
        <footer className={`w-full mt-auto py-1.5 px-4 flex items-center justify-center ${className}`}>
            <p className="text-[9px] font-medium text-[hsl(var(--admin-text-muted)/0.6)] tracking-wide">
                © edAPP · v{version} · {year}
            </p>
        </footer>
    );
}
