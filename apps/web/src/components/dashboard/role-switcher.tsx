'use client'

import { useState, useRef, useEffect } from 'react'
import { useRole, UserRole } from '@/contexts/RoleContext'

const ROLE_CONFIG: Record<UserRole, { label: string; icon: string; color: string }> = {
    admin: { label: 'Admin', icon: 'admin_panel_settings', color: 'bg-purple-500' },
    staff: { label: 'Staff', icon: 'badge', color: 'bg-blue-500' },
    parent: { label: 'Parent', icon: 'family_restroom', color: 'bg-green-500' },
    learner: { label: 'Learner', icon: 'school', color: 'bg-orange-500' },
}

export function RoleSwitcher() {
    const { currentRole, availableRoles, setCurrentRole } = useRole()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const currentConfig = ROLE_CONFIG[currentRole]

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleRoleSelect = (role: UserRole) => {
        setCurrentRole(role)
        setIsOpen(false)
    }

    // Only show switcher if user has multiple roles
    if (availableRoles.length <= 1) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className={`w-6 h-6 rounded-full ${currentConfig.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-sm">{currentConfig.icon}</span>
                </div>
                <span className="text-sm font-medium">{currentConfig.label}</span>
            </div>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
                <div className={`w-6 h-6 rounded-full ${currentConfig.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-sm">{currentConfig.icon}</span>
                </div>
                <span className="text-sm font-medium">{currentConfig.label}</span>
                <span className={`material-symbols-outlined text-slate-400 text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 px-2">Switch role</p>
                    </div>
                    <div className="p-1">
                        {availableRoles.map((role) => {
                            const config = ROLE_CONFIG[role]
                            const isSelected = role === currentRole

                            return (
                                <button
                                    key={role}
                                    onClick={() => handleRoleSelect(role)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isSelected
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-white text-lg">{config.icon}</span>
                                    </div>
                                    <span className="flex-1 text-left font-medium">{config.label}</span>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-primary text-xl">check</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
