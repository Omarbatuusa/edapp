import React from 'react';

interface AdminFooterProps {
    version?: string;
}

export function AdminFooter({ version = '1.0.0' }: AdminFooterProps) {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full mt-auto border-t border-[hsl(var(--admin-border)/0.5)] py-4 px-6 flex items-center justify-center">
            <p className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))] tracking-wide">
                © edAPP • v{version} • {year}
            </p>
        </footer>
    );
}

export default AdminFooter;
