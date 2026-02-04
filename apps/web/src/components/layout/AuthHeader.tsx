"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, CircleHelp } from 'lucide-react'
import Image from "next/image"
import { useTheme } from "next-themes"

interface AuthHeaderProps {
    onBack?: () => void
    onHelp?: () => void
    variant?: 'discovery' | 'tenant' | 'platform-admin'
    tenantName?: string
    tenantLogo?: string
    tenantSlug?: string
    transparent?: boolean
}

export function AuthHeader({
    onBack,
    onHelp,
    variant = 'tenant',
    tenantName,
    tenantLogo,
    tenantSlug,
    transparent = false
}: AuthHeaderProps) {
    const [scrolled, setScrolled] = useState(false)
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        // Listen for scroll on app-content instead of window
        const content = document.querySelector('.app-content')
        if (!content) return

        const handleScroll = () => {
            setScrolled(content.scrollTop > 0)
        }
        content.addEventListener('scroll', handleScroll, { passive: true })
        return () => content.removeEventListener('scroll', handleScroll)
    }, [])

    const handleChangeSchool = () => {
        // Navigate to main app domain
        window.location.href = 'https://app.edapp.co.za'
    }

    // Determine which logo to use based on theme
    const edAppLogo = mounted && resolvedTheme === 'dark' ? '/edapp-logo-white.png' : '/edapp-logo.png'

    return (
        <header
            className={`flex items-center justify-between px-4 shrink-0 z-30 w-full transition-all duration-300 ${scrolled
                ? 'h-14 bg-background/95 backdrop-blur-md shadow-sm'
                : 'h-16 bg-background/80 backdrop-blur-md'
                }`}
        >
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {variant === 'tenant' && (
                    <div className="flex items-center gap-3 min-w-0">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary/50 text-foreground/80 transition-colors shrink-0"
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
                            <h1 className="text-sm font-semibold tracking-tight leading-none text-foreground truncate">
                                {tenantName}
                            </h1>
                            <button
                                onClick={handleChangeSchool}
                                className="text-[11px] text-primary hover:underline text-left flex items-center gap-0.5 leading-tight mt-0.5 truncate"
                            >
                                Change school <span className="text-[9px]">›</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Discovery / Platform Admin Mode - edAPP Logo Only */}
                {(variant === 'discovery' || variant === 'platform-admin') && (
                    <div className="flex items-center">
                        <Image
                            src={edAppLogo}
                            alt="edAPP"
                            width={120}
                            height={32}
                            className="object-contain h-8 w-auto"
                            priority
                        />
                    </div>
                )}
            </div>

            {/* Right: Help icon */}
            <div className="flex items-center justify-end gap-1 shrink-0">
                {onHelp && (
                    <button
                        onClick={onHelp}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary/80 text-muted-foreground transition-colors"
                        aria-label="Help"
                    >
                        <CircleHelp size={20} />
                    </button>
                )}
            </div>
        </header>
    )
}
