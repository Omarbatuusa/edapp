"use client"

import { ThemeToggle } from "@/components/discovery/theme-toggle"

interface AuthHeaderProps {
    onBack?: () => void
    onHelp?: () => void
    title?: string
    showTitle?: boolean
    transparent?: boolean
}

export function AuthHeader({
    onBack,
    onHelp,
    title,
    showTitle = false,
    transparent = false
}: AuthHeaderProps) {
    return (
        <header
            className={`flex items-center justify-between px-4 py-3 sticky top-0 z-10 w-full max-w-[480px] mx-auto ${transparent
                    ? 'bg-transparent'
                    : 'bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-md'
                }`}
        >
            {/* Left: Back button */}
            {onBack ? (
                <button
                    onClick={onBack}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    aria-label="Back"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </button>
            ) : (
                <div className="w-10 h-10" /> /* Spacer */
            )}

            {/* Center: Optional title */}
            {showTitle && title && (
                <div className="flex-1 text-center">
                    <span className="text-sm font-semibold tracking-wide uppercase opacity-50">
                        {title}
                    </span>
                </div>
            )}

            {/* Right: Theme toggle + Help */}
            <div className="flex items-center gap-1">
                <ThemeToggle />
                {onHelp && (
                    <button
                        onClick={onHelp}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        aria-label="Help"
                    >
                        <span className="material-symbols-outlined text-2xl">help</span>
                    </button>
                )}
            </div>
        </header>
    )
}
