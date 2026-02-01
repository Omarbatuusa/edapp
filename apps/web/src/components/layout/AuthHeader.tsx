"use client"

import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { useState, useEffect } from "react"
import { ChevronLeft, HelpCircle } from 'lucide-react'

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
                ? 'h-14 bg-background/80 backdrop-blur-md border-b border-border/5' // Minimal border
                : 'h-16 bg-transparent'
                } ${transparent ? 'bg-transparent' : ''}`}
        >
            {/* Left: Back button or Minimal Brand */}
            <div className="w-10 flex items-center justify-center">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary/50 text-foreground/80 transition-colors"
                        aria-label="Back"
                    >
                        <ChevronLeft size={24} />
                    </button>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-xs">EA</span>
                    </div>
                )}
            </div>

            {/* Center: Title (Fade-in) */}
            <div className={`flex-1 text-center transition-opacity duration-300 ${showTitle || scrolled ? 'opacity-100' : 'opacity-0'}`}>
                {title && (
                    <span className="text-sm font-semibold tracking-wide text-foreground/90">
                        {title}
                    </span>
                )}
            </div>

            {/* Right: Help & Theme */}
            <div className="flex items-center justify-end gap-2">
                {onHelp && (
                    <button
                        onClick={onHelp}
                        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary/50 text-muted-foreground transition-colors"
                        aria-label="Help"
                    >
                        <HelpCircle size={20} />
                    </button>
                )}
                <div className={scrolled ? 'scale-90 transition-transform' : ''}>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
