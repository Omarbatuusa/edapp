import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Check, Briefcase } from 'lucide-react';

export default function RoleSwitcher() {
    const { user, activeRole, switchRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user || !user.roles || user.roles.length <= 1) {
        // If only 1 or 0 roles, just show the static label (or nothing special)
        return (
            <div className="flex flex-col">
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {activeRole?.name || 'Staff Portal'}
                </span>
                <h2 className="text-lg font-bold leading-tight tracking-tight">
                    {user?.first_name} {user?.last_name || ''}
                </h2>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col items-start group focus:outline-none"
            >
                <div className="flex items-center gap-1.5 text-xs font-normal text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                    <span>Working as: {activeRole?.name || 'Select Role'}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-tight">
                    {user?.first_name} {user?.last_name || ''}
                </h2>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Context</span>
                    </div>
                    {user.roles.map((role) => (
                        <button
                            key={role.slug}
                            onClick={() => {
                                switchRole(role.slug);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${activeRole?.slug === role.slug ? 'bg-primary/5 text-primary' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${activeRole?.slug === role.slug ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                    <Briefcase className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{role.name}</span>
                                    <span className="text-[10px] text-slate-400 capitalize">{role.scope} Scope</span>
                                </div>
                            </div>
                            {activeRole?.slug === role.slug && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
