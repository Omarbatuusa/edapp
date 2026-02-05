"use client"

import Link from "next/link"
import { RoleSwitcher, type UserRoleAssignment } from "@/components/dashboard/RoleSwitcher"

interface ShellHeaderProps {
    tenantName?: string
    tenantLogo?: string
    user?: any
    role?: string
    onSearch?: () => void
    onEmergency?: () => void
    notificationsCount?: number
    onMenuClick?: () => void
    onAvatarClick?: () => void
    onNotificationClick?: () => void
    showChangeSchool?: boolean
    // Role Switcher props
    currentRole?: UserRoleAssignment
    allRoles?: UserRoleAssignment[]
    onRoleSwitch?: (role: UserRoleAssignment) => void
}

export function ShellHeader({
    tenantName = "EdApp School",
    tenantLogo,
    user,
    role = "parent",
    onSearch,
    onEmergency,
    notificationsCount = 0,
    onMenuClick,
    onAvatarClick,
    onNotificationClick,
    showChangeSchool = false,
    currentRole,
    allRoles = [],
    onRoleSwitch
}: ShellHeaderProps) {

    // Derive display values safely
    const displayName = user?.display_name || user?.first_name || "User"
    const displayInitial = displayName.charAt(0)

    // Default role if not provided
    const defaultRole: UserRoleAssignment = currentRole || {
        id: 'default',
        role: role,
        tenant_name: tenantName,
        is_active: true
    }

    const roles = allRoles.length > 0 ? allRoles : [defaultRole]

    return (
        <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-xl border-b border-border/10 transition-shadow duration-300 supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 py-3 flex items-center justify-between max-w-[1600px] mx-auto">

                {/* Left: Tenant Identity */}
                <div className="flex items-center gap-3">
                    {/* Menu Trigger (only for sidebar-enabled roles) */}
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground lg:hidden"
                            aria-label="Open menu"
                        >
                            <span className="material-symbols-outlined text-[22px]">menu</span>
                        </button>
                    )}

                    {/* Tenant Logo & Name */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50">
                            {tenantLogo ? (
                                <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-primary font-bold text-sm">{tenantName.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm tracking-tight text-foreground leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                                {tenantName}
                            </span>
                            {showChangeSchool && (
                                <Link
                                    href="/"
                                    className="text-[11px] text-primary hover:underline font-medium"
                                >
                                    Change school
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Search Icon */}
                    <button
                        onClick={onSearch}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground"
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined text-[22px]">search</span>
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">

                    {/* Role Switcher - Facebook style */}
                    <RoleSwitcher
                        currentRole={defaultRole}
                        allRoles={roles}
                        onSwitch={onRoleSwitch || (() => { })}
                        compact={true}
                    />

                    {/* Emergency Hub (Shield) - ALWAYS VISIBLE */}
                    <button
                        onClick={onEmergency}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        aria-label="Emergency Hub"
                    >
                        <span className="material-symbols-outlined text-[20px]">shield</span>
                    </button>

                    {/* Notifications */}
                    <button
                        onClick={onNotificationClick}
                        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground"
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        {notificationsCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                                {notificationsCount > 9 ? '9+' : notificationsCount}
                            </span>
                        )}
                    </button>

                    {/* User Avatar / Profile */}
                    <button
                        onClick={onAvatarClick}
                        className="ml-0.5 w-9 h-9 rounded-full bg-secondary overflow-hidden border border-border/50 hover:ring-2 hover:ring-primary/20 transition-all flex items-center justify-center"
                        aria-label="Open account menu"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-600 dark:text-indigo-300 font-semibold text-sm">
                                {displayInitial}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}
