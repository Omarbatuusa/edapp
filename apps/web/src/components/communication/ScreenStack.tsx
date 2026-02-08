import React, { useEffect } from 'react';

export const SCREEN_TRANSITION = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1,
} as const;

export function ScreenStackBase({ children }: { children: React.ReactNode }) {
    return (
        <div className="absolute inset-0 flex flex-col bg-background z-0 animate-in fade-in duration-300">
            {children}
        </div>
    );
}

interface ScreenStackDetailProps {
    children: React.ReactNode;
    onBack: () => void;
    title?: string;
    actionIcon?: string;
    onAction?: () => void;
}

export function ScreenStackDetail({ children, onBack, title = "Details", actionIcon, onAction }: ScreenStackDetailProps) {
    // Lock body scroll when detail view is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col bg-background z-50 h-[100dvh] animate-in slide-in-from-right duration-300">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 h-14 flex items-center px-4 shrink-0 justify-between">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-foreground">
                            {title === "New Message" ? "close" : "chevron_left"}
                        </span>
                    </button>
                    <div className="font-bold text-lg truncate flex-1 text-center px-2">
                        {title}
                    </div>
                    {actionIcon && onAction ? (
                        <button
                            onClick={onAction}
                            className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full hover:bg-secondary/80 transition-colors"
                        >
                            <span className="material-symbols-outlined text-foreground">
                                {actionIcon}
                            </span>
                        </button>
                    ) : (
                        <div className="w-8"></div> // Spacer for balance
                    )}
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-24">
                    {children}
                </div>
            </div>
        </div>
    );
}
