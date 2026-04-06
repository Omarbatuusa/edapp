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
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const [platformLogoUrl, setPlatformLogoUrl] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
        // Fetch platform logo from settings API
        fetch('/v1/admin/platform-settings/platform_logo')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.value?.file_key) {
                    fetch(`/v1/storage/read-url?key=${encodeURIComponent(data.value.file_key)}`)
                        .then(r => r.ok ? r.json() : null)
                        .then(urlData => { if (urlData?.url) setPlatformLogoUrl(urlData.url) })
                        .catch(() => {})
                }
            })
            .catch(() => {})
    }, [])

    const handleChangeSchool = () => {
        window.location.href = 'https://app.edapp.co.za'
    }

    // Determine which logo to use: platform custom logo > theme-based static
    const staticLogo = mounted && resolvedTheme === 'dark' ? '/edapp-logo-white.png' : '/edapp-logo.png'
    const edAppLogo = platformLogoUrl || staticLogo

    return (
        <header
            className="flex items-center justify-between px-4 shrink-0 z-30 w-full h-14 bg-white dark:bg-[hsl(0,0%,11%)] border-b border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
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

                        {/* Tenant Logo */}
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

                        {/* Tenant Name & Change School */}
                        <div className="flex flex-col min-w-0 justify-center">
                            <h1 className="text-sm font-semibold tracking-tight leading-none text-foreground truncate">
                                {tenantName}
                            </h1>
                            <button
                                type="button"
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
