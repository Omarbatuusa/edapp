'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface SessionUser {
    userId: string;
    role: string;
    tenantSlug?: string;
}

interface AuthContextType {
    user: User | null;
    sessionUser: SessionUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    isConfigured: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if Firebase is properly configured
    const isConfigured = auth !== null;

    // On mount: check localStorage for session token data
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const sessionToken = localStorage.getItem('session_token');
            const userId = localStorage.getItem('user_id');
            const userRole = localStorage.getItem('user_role');

            if (sessionToken && userId) {
                setSessionUser({
                    userId,
                    role: userRole || 'unknown',
                });
            }
        }
    }, []);

    useEffect(() => {
        // If auth is not configured, stop loading and skip subscription
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isAuthenticated = !!(user || sessionUser);

    const login = async (email: string, password: string) => {
        if (!auth) {
            throw new Error('Firebase authentication is not configured');
        }
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        // Clear Firebase auth
        if (auth) {
            try {
                await signOut(auth);
            } catch {
                // Firebase may not be signed in
            }
        }

        // Clear session token and all related localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('session_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_role');

            // Clear all edapp_role_* keys
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('edapp_role_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        setSessionUser(null);
    };

    const resetPassword = async (email: string) => {
        if (!auth) {
            throw new Error('Firebase authentication is not configured');
        }
        await sendPasswordResetEmail(auth, email);
    };

    return (
        <AuthContext.Provider value={{ user, sessionUser, isAuthenticated, loading, isConfigured, login, logout, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
