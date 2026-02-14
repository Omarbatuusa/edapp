import React from 'react';

interface MessagesLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function MessagesLayout({ children, header, footer, className = '' }: MessagesLayoutProps) {
    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-[#0B1120] text-foreground overflow-hidden h-[100dvh] md:relative md:h-screen md:z-0 ${className}`}>
            {/* Header Area - Stays fixed at top */}
            {header && (
                <div className="shrink-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
                    {header}
                </div>
            )}

            {/* Main Content Area - children manage their own scroll */}
            <div className="flex-1 overflow-hidden relative">
                <div className="h-full w-full flex flex-col">
                    {children}
                </div>
            </div>

            {/* Footer Area - Stays fixed at bottom */}
            {footer && (
                <div className="shrink-0 z-20 bg-background border-t border-border/50 pb-safe">
                    {footer}
                </div>
            )}
        </div>
    );
}

// Helper for sticky section headers within the scroll view
export function StickySectionHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`sticky top-0 z-10 bg-background/95 backdrop-blur shadow-sm px-4 py-2 font-bold text-sm text-muted-foreground ${className}`}>
            {children}
        </div>
    );
}
