"use client"

import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { useState, useEffect } from "react"

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
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`flex items-center justify-between px-4 sticky top-0 z-30 w-full transition-all duration-300 ${scrolled
                ? 'h-14 bg-white/95 dark:bg-[#101922]/95 backdrop-blur-md shadow-sm'
                : 'h-16 bg-transparent'
                } ${transparent ? 'bg-transparent' : ''}`}
        >
            {/* Left: Back button */}
            <div className="w-10 flex items-center justify-center">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        aria-label="Back"
                    >
                        <span className="material-symbols-outlined text-2xl">chevron_left</span>
                    </button>
                )}
            </div>

            {/* Center: Optional title - fade in on scroll if needed, or always show if requested */}
            <div className={`flex-1 text-center transition-opacity duration-300 ${showTitle || scrolled ? 'opacity-100' : 'opacity-0'}`}>
                {title && (
                    <span className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                        {title}
                    </span>
                )}
            </div>

            {/* Right: Theme toggle + Help */}
            <div className="w-10 flex items-center justify-end gap-1">
                <div className={scrolled ? 'scale-90 transition-transform' : ''}>
                    <ThemeToggle />
                </div>
                {onHelp && (
                    <button
                        onClick={onHelp}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        aria-label="Help"
                    >
                        <span className="material-symbols-outlined text-2xl">help_outline</span>
                    </button>
                )}
            </div>
        </header>
    )
}
