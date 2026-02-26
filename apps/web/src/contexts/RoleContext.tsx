'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'admin' | 'staff' | 'parent' | 'learner'

interface RoleContextType {
    currentRole: UserRole
    availableRoles: UserRole[]
    setCurrentRole: (role: UserRole) => void
    isLoading: boolean
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
    const [availableRoles] = useState<UserRole[]>(['admin', 'staff', 'parent', 'learner'])
    const [isLoading, setIsLoading] = useState(true)

    // Load saved role from localStorage on mount
    useEffect(() => {
        // setIsLoading(false)
    }, [tenantSlug])

    // Persist role changes to localStorage
    const setCurrentRole = (role: UserRole) => {
        setCurrentRoleState(role)
        localStorage.setItem(`edapp_role_${tenantSlug}`, role)
    }

    return (
        <RoleContext.Provider value={{ currentRole, availableRoles, setCurrentRole, isLoading }}>
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
