import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import type { UserRole } from './RoleSelection';

import { post } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginFormProps {
    role: UserRole;
    schoolName: string;
    schoolLogo?: string;
    tenantId: string;
    onBack: () => void;
    onLoginSuccess: () => void;
}

export default function LoginForm({ role, schoolName, schoolLogo, tenantId, onBack, onLoginSuccess }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let payload: any = { tenantId };

            if (role === 'learner') {
                payload.studentNumber = studentNumber;
                payload.pin = pin;
            } else {
                payload.email = email;
                payload.password = password;
            }

            const data = await post('/auth/login', payload);

            // Login success: save token and user
            login(data.token, data.user);

            setLoading(false);
            onLoginSuccess();
        } catch (err: any) {
            console.error("Login failed", err);
            // Context-aware error message
            if (role === 'learner') {
                setError('Invalid Student Number or PIN');
            } else {
                setError('Invalid Email or Password');
            }
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-100px)] py-6 px-6 flex flex-col justify-start overflow-y-auto">
            <button
                onClick={onBack}
                className="mb-6 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
                ← Back
            </button>

            <div className="mb-8 text-center flex flex-col items-center">
                {schoolLogo ? (
                    <img src={schoolLogo} alt={schoolName} className="h-16 w-auto mb-4" />
                ) : null}

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {role === 'parent' ? 'Parent' : role.charAt(0).toUpperCase() + role.slice(1)} Login
                </h2>
                {!schoolLogo && (
                    <p className="text-sm text-primary font-medium bg-primary/10 inline-block px-2 py-0.5 rounded-md">
                        {schoolName}
                    </p>
                )}
                {schoolLogo && <p className="text-gray-500 dark:text-gray-400">{schoolName}</p>}
            </div>

            {error && (
                <div className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/20 py-2 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                {role === 'learner' ? (
                    // --- STUDENT NUMBER ---
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                            Student Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={studentNumber}
                                onChange={(e) => setStudentNumber(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Student Number (e.g. STU001)"
                                required
                            />
                        </div>
                    </div>
                ) : (
                    // --- EMAIL (Admin/Staff/Parent) ---
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Email or Mobile Number"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                        {role === 'learner' ? 'PIN' : 'Password'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={role === 'learner' ? pin : password}
                            onChange={(e) => role === 'learner' ? setPin(e.target.value) : setPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder={role === 'learner' ? "Enter your PIN" : "Enter your password"}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <a href="#" className="text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors">
                        Forgot {role === 'learner' ? 'PIN' : 'Password'}?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                    {loading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        <>
                            <span>Log In</span>
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 bg-background-light dark:bg-background-dark text-sm text-gray-400 dark:text-gray-500">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {/* Google SVG */}
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-white">Google</span>
                </button>
                <button className="flex items-center justify-center h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="h-5 w-5 mr-2 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.15 4.09-.65 1.03.35 2.37 1.15 3.05 2.16-2.73 1.67-2.28 5.76.44 7.04-.6 1.55-1.47 3.08-2.66 3.68zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.18 2.3-2.15 4.35-3.74 4.25z"></path>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-white">Apple</span>
                </button>
            </div>
        </div>
    );
}
