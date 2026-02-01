"use client"

import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { useState, useEffect } from "react"
import { ChevronLeft, HelpCircle } from 'lucide-react'
import Image from "next/image"

interface AuthHeaderProps {
    onBack?: () => void
    onHelp?: () => void
    variant?: 'discovery' | 'tenant' // 'discovery' = EdApp only, 'tenant' = School info
    tenantName?: string
    tenantLogo?: string
    transparent?: boolean
}

export function AuthHeader({
    onBack,
    onHelp,
    variant = 'tenant',
    tenantName,
    tenantLogo,
    transparent = false
}: AuthHeaderProps) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`flex items-center justify-between px-4 sticky top-0 z-30 w-full transition-all duration-300 ${scrolled
                ? 'h-14 bg-background/80 backdrop-blur-md shadow-sm'
                : 'h-16 bg-transparent'
                } ${transparent && !scrolled ? 'bg-transparent' : 'bg-background/80 backdrop-blur-md'}`}
        >
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Back Button */}
                {/* On Mobile/Discovery, if no onBack, we show nothing or brand? Spec says: Discovery -> EdApp Only. Tenant Code -> No Chevron. */}
                {variant === 'tenant' && (
                    <div className="flex items-center gap-3 min-w-0">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary/50 text-foreground/80 transition-colors shrink-0"
                                aria-label="Back"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {/* Tenant Logo */}
                        {tenantLogo && (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border/10 shrink-0">
                                <Image
                                    src={tenantLogo}
                                    alt={tenantName || "Logo"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Tenant Name & Change School */}
                        <div className="flex flex-col min-w-0 justify-center">
                            {/* Desktop/Tablet: Show Name + Change school link. Mobile: Truncate Name. */}
                            <h1 className="text-sm font-semibold tracking-tight leading-none text-foreground truncate">
                                {tenantName}
                            </h1>
                            <button
                                onClick={onBack}
                                className="text-[11px] text-primary hover:underline text-left flex items-center gap-0.5 leading-tight mt-0.5 truncate"
                            >
                                Change school <span className="text-[9px]">›</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Discovery Mode (EdApp Only) */}
                {variant === 'discovery' && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-white text-[20px]">school</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight">EdApp</span>
                    </div>
                )}
            </div>

            {/* Right: Help & Theme */}
            <div className="flex items-center justify-end gap-1 shrink-0">
                {onHelp && (
                    <button
                        onClick={onHelp}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary/80 text-muted-foreground transition-colors"
                        aria-label="Help"
                    >
                        <HelpCircle size={20} />
                    </button>
                )}
                <div className="scale-90">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
