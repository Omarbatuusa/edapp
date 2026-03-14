import React from 'react';

interface AppFooterProps {
    version?: string;
    className?: string;
}

export function AppFooter({ version = '1.0.0', className = '' }: AppFooterProps) {
    const year = new Date().getFullYear();

    return (
        <footer className={`w-full mt-auto border-t border-[hsl(var(--admin-border)/0.5)] py-4 px-6 flex items-center justify-center ${className}`}>
            <p className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))] tracking-wide">
                © edAPP • v{version} • {year}
            </p>
        </footer>
    );
}
