import React from 'react';

export const SCREEN_TRANSITION = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1,
} as const;

export function ScreenStackBase({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-slate-50 dark:bg-[#0B1120]">
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
    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-slate-50 dark:bg-[#0B1120]">
            {/* Header */}
            <header className="shrink-0 bg-background/80 backdrop-blur-md border-b border-border/50 h-14 flex items-center px-4 justify-between">
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

            {/* Content - relative for fixed children to work */}
            <div className="flex-1 overflow-y-auto relative">
                <div className="p-4 pb-24">
                    {children}
                </div>
            </div>
        </div>
    );
}
