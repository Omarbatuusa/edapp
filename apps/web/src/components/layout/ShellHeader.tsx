"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface ShellHeaderProps {
    tenantName?: string
    tenantLogo?: string
    user?: any
    onSearch?: () => void
    onEmergency?: () => void
    notificationsCount?: number
    onMenuClick?: () => void
}

export function ShellHeader({
    tenantName = "EdApp School",
    tenantLogo,
    user,
    onSearch,
    onEmergency,
    notificationsCount = 0,
    onMenuClick
}: ShellHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Derive display values safely
    const displayName = user?.display_name || user?.first_name || "User"
    const displayInitial = displayName.charAt(0)

    return (
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/10 shadow-sm transition-all duration-300">
            <div className="app-container !min-h-[auto] !py-3 !my-0 !rounded-none !shadow-none !border-none flex items-center justify-between">

                {/* Left: Tenant Identity + Search (Mobile) */}
                <div className="flex items-center gap-3">
                    {/* Tenant Logo / Menu Trigger */}
                    <button
                        onClick={onMenuClick}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-black/5">
                            {tenantLogo ? (
                                <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-primary font-bold text-xs">{tenantName.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        <span className="hidden md:block font-semibold text-sm tracking-tight text-foreground/90">
                            {tenantName}
                        </span>
                    </button>

                    {/* Search Icon (Mobile-first) */}
                    <button
                        onClick={onSearch}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground"
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined text-[22px]">search</span>
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 sm:gap-2">

                    {/* Emergency Hub (Shield) - ALWAYS VISIBLE */}
                    <button
                        onClick={onEmergency}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors mr-1"
                        aria-label="Emergency Hub"
                    >
                        <span className="material-symbols-outlined text-[22px] filled">shield</span>
                    </button>

                    {/* Notifications */}
                    <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground">
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        {notificationsCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-1 ring-white"></span>
                        )}
                    </button>

                    {/* User Avatar / Profile */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="ml-1 w-9 h-9 rounded-full bg-secondary overflow-hidden border border-black/5 hover:ring-2 hover:ring-primary/20 transition-all flex items-center justify-center"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 font-medium text-xs">
                                {displayInitial}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}
