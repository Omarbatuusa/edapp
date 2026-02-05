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
        <header className="sticky top-0 z-40 w-full bg-background border-b border-border/40">
            <div className="px-4 py-3 flex items-center justify-between max-w-2xl lg:max-w-4xl mx-auto">

                {/* Left: Tenant Identity - Matches Login Header Style */}
                <div className="flex items-center gap-3">
                    {/* Tenant Logo */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-border/50 shrink-0">
                        {tenantLogo ? (
                            <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-primary font-bold text-sm">{tenantName.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>

                    {/* School Name + Change School (inline) */}
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm leading-tight text-foreground truncate max-w-[140px] sm:max-w-[200px]">
                            {tenantName}
                        </span>
                        {showChangeSchool && (
                            <Link href="/" className="text-xs text-primary hover:underline">
                                Change school
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Search Icon - Compact */}
                    <button
                        onClick={onSearch}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/60 transition-colors text-muted-foreground"
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </button>

                    {/* Role Switcher */}
                    <RoleSwitcher
                        currentRole={defaultRole}
                        allRoles={roles}
                        onSwitch={onRoleSwitch || (() => { })}
                        compact={true}
                    />

                    {/* Emergency Hub (Shield) */}
                    <button
                        onClick={onEmergency}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        aria-label="Emergency Hub"
                    >
                        <span className="material-symbols-outlined text-[18px]">shield</span>
                    </button>

                    {/* Notifications - Fixed badge positioning */}
                    <button
                        onClick={onNotificationClick}
                        className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/60 transition-colors text-muted-foreground"
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        {notificationsCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
                                {notificationsCount > 9 ? '9+' : notificationsCount}
                            </span>
                        )}
                    </button>

                    {/* User Avatar */}
                    <button
                        onClick={onAvatarClick}
                        className="w-8 h-8 rounded-full bg-secondary overflow-hidden border border-border/50 hover:ring-2 hover:ring-primary/20 transition-all flex items-center justify-center shrink-0"
                        aria-label="Open account menu"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-600 dark:text-indigo-300 font-semibold text-xs">
                                {displayInitial}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}
