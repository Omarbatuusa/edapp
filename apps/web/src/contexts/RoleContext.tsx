'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getNavConfig } from '@/config/navigation'

export type UserRole = 'admin' | 'staff' | 'parent' | 'learner'

interface RoleContextType {
    /** Simplified 4-bucket role (admin | staff | parent | learner) */
    currentRole: UserRole
    /** The full 31-value role string (e.g. 'tenant_admin', 'class_teacher') */
    fullRole: string
    availableRoles: UserRole[]
    setCurrentRole: (role: UserRole) => void
    isLoading: boolean
    /** Returns the dashboard base path for the current full role */
    getDashboardPath: () => string
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

interface RoleProviderProps {
    children: ReactNode
    tenantSlug: string
    initialRole?: UserRole
}

export function RoleProvider({ children, tenantSlug, initialRole }: RoleProviderProps) {
    const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
        if (typeof window !== 'undefined') {
            const savedRole = localStorage.getItem(`edapp_role_${tenantSlug}`)
            if (savedRole && ['admin', 'staff', 'parent', 'learner'].includes(savedRole)) {
                return savedRole as UserRole
            }
        }
        return initialRole || 'parent'
    })

    const [fullRole, setFullRole] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('user_role') || localStorage.getItem(`edapp_role_${tenantSlug}`) || initialRole || 'parent'
        }
        return initialRole || 'parent'
    })

    const [availableRoles] = useState<UserRole[]>(['admin', 'staff', 'parent', 'learner'])
    const [isLoading, setIsLoading] = useState(true)

    // Load saved role from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('user_role') || localStorage.getItem(`edapp_role_${tenantSlug}`)
            if (stored) setFullRole(stored)
        }
    }, [tenantSlug])

    // Persist role changes to localStorage
    const setCurrentRole = (role: UserRole) => {
        setCurrentRoleState(role)
        localStorage.setItem(`edapp_role_${tenantSlug}`, role)
    }

    const getDashboardPath = () => {
        const navConfig = getNavConfig(fullRole)
        return navConfig.getBasePath(tenantSlug)
    }

    return (
        <RoleContext.Provider value={{ currentRole, fullRole, availableRoles, setCurrentRole, isLoading, getDashboardPath }}>
            {children}
        </RoleContext.Provider>
    )
}

export const useRole = () => {
    const context = useContext(RoleContext)
    if (!context) {
        throw new Error('useRole must be used within RoleProvider')
    }
    return context
}
