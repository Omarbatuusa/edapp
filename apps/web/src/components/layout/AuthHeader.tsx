"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, CircleHelp } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation"
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
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleChangeSchool = () => {
        router.push('/')
    }

    // Determine which logo to use based on theme
    const edAppLogo = mounted && resolvedTheme === 'dark' ? '/edapp-logo-white.png' : '/edapp-logo.png'

    return (
        <header
            className="flex items-center justify-between px-4 shrink-0 z-30 w-full h-14 bg-background border-b border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {variant === 'tenant' && (
                    <div className="flex items-center gap-3 min-w-0">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary/50 text-foreground/80 transition-colors shrink-0"
                                aria-label="Back"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {/* Tenant Logo + Name — tappable to switch school */}
                        <button
                            type="button"
                            onClick={handleChangeSchool}
                            className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
                            aria-label="Change school"
                        >
                            {tenantLogo && (
                                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-border/10 shrink-0">
                                    <Image
                                        src={tenantLogo}
                                        alt={tenantName || "Logo"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-1 min-w-0">
                                <span className="text-sm font-semibold tracking-tight leading-none text-foreground truncate">
                                    {tenantName}
                                </span>
                                <span className="material-symbols-outlined text-[12px] text-muted-foreground shrink-0">expand_more</span>
                            </div>
                        </button>
                    </div>
                )}

                {/* Discovery / Platform Admin Mode - edAPP Logo Only */}
                {(variant === 'discovery' || variant === 'platform-admin') && (
                    <a
                        href="https://edapp.co.za"
                        className="flex items-center hover:opacity-80 transition-opacity"
                        title="Go to EdApp"
                    >
                        <Image
                            src={edAppLogo}
                            alt="edAPP"
                            width={120}
                            height={32}
                            className="object-contain h-8 w-auto"
                            priority
                        />
                    </a>
                )}
            </div>

            {/* Right: Help icon */}
            <div className="flex items-center justify-end gap-1 shrink-0">
                {onHelp && (
                    <button
                        type="button"
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
