import React from 'react';
import { Users, GraduationCap, School, ShieldCheck } from 'lucide-react';

export type UserRole = 'parent' | 'staff' | 'learner' | 'admin';

interface RoleSelectionProps {
    onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
    const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
        { id: 'parent', label: 'Parent', icon: <Users className="h-8 w-8" /> },
        { id: 'staff', label: 'Staff', icon: <School className="h-8 w-8" /> },
        { id: 'learner', label: 'Learner', icon: <GraduationCap className="h-8 w-8" /> },
        { id: 'admin', label: 'Admin', icon: <ShieldCheck className="h-8 w-8" /> },
    ];

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">I am a...</h2>
                <p className="text-gray-500 dark:text-gray-400">Select your role to continue</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => onRoleSelect(role.id)}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] group"
                    >
                        <div className="mb-3 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {role.icon}
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-200">{role.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
