import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getRbacContext } from '../services/api';

interface Role {
    slug: string;
    name: string;
    scope: string;
    tenant_id: string | null;
}

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string; // Keep string for back-compat or detailed role slug
    role_id?: string; // Explicit ID for simpler checks
    tenant_id: string;
    phase?: string;
    grade?: string;
    capabilities?: string[]; // New RBAC field
    roles?: Role[]; // Assigned roles
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    hasCapability: (cap: string) => boolean;
    activeRole: Role | null;
    switchRole: (roleSlug: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [activeRole, setActiveRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadContext = async (currentToken: string, currentUser: User) => {
        try {
            // Fetch latest RBAC context
            const rbac = await getRbacContext();
            const updatedUser = {
                ...currentUser,
                capabilities: rbac.capabilities,
                roles: rbac.roles
            };
            setUser(updatedUser);
            // Optionally store simplified user back to local storage
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));

            // Set default active role if not set
            if (!activeRole && rbac.roles && rbac.roles.length > 0) {
                const defaultRole = rbac.roles.find((r: Role) =>
                    ['staff', 'platform_admin', 'tenant_admin', 'admin', 'principal', 'educator'].includes(r.slug)
                ) || rbac.roles[0];

                setActiveRole(defaultRole);
                localStorage.setItem('active_role', JSON.stringify(defaultRole));
            }
        } catch (err) {
            console.error("Failed to load RBAC context", err);
            // Fallback: keep existing user data
            setUser(currentUser);
        }
    };

    useEffect(() => {
        // Load from localStorage on mount
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Attempt to restore active role from local state or default?
            // For now, let loadContext handle it or rely on user interaction
            if (parsedUser.roles && parsedUser.roles.length > 0) {
                setActiveRole(parsedUser.roles[0]);
            }

            // Refresh RBAC in background
            loadContext(storedToken, parsedUser).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (newToken: string, newUser: User) => {
        setToken(newToken);
        localStorage.setItem('auth_token', newToken);

        // Immediately try to fetch full context before settling user state
        // This ensures subsequent redirects have capabilities
        try {
            // We need to set token temporarily for the API call if standard auth header relies on localStorage or state
            // But our api.ts reads from localStorage. So we set it above.
            const rbac = await getRbacContext();
            const fullUser = {
                ...newUser,
                capabilities: rbac.capabilities,
                roles: rbac.roles
            };
            setUser(fullUser);
            localStorage.setItem('auth_user', JSON.stringify(fullUser));

            if (rbac.roles && rbac.roles.length > 0) {
                setActiveRole(rbac.roles[0]);
            }
        } catch (e) {
            console.error("Login RBAC fetch failed", e);
            setUser(newUser);
            localStorage.setItem('auth_user', JSON.stringify(newUser));
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setActiveRole(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/';
    };

    const hasCapability = (cap: string) => {
        return user?.capabilities?.includes(cap) ?? false;
    };

    const switchRole = (roleSlug: string) => {
        const found = user?.roles?.find(r => r.slug === roleSlug);
        if (found) {
            setActiveRole(found);
            localStorage.setItem('active_role', JSON.stringify(found));
            // Reload page to force full re-render with new context/API headers?
            // Or relying on React State update is enough if API calls are triggered by effects.
            // For safety in this complex app, a reload might be cleaner but jarring.
            // Let's rely on state.
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading, hasCapability, activeRole, switchRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
