import React from 'react';

interface MessagesLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function MessagesLayout({ children, header, footer, className = '' }: MessagesLayoutProps) {
    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-background text-foreground overflow-hidden md:relative md:h-full md:z-0 ${className}`}>
            {/* Header Area - Stays fixed at top */}
            {header && (
                <div className="shrink-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
                    {header}
                </div>
            )}

            {/* Main Scrollable Content Area */}
            {/* 100dvh handling for mobile browsers to avoid address bar issues */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative overscroll-contain no-scrollbar">
                <div className="min-h-full w-full">
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
