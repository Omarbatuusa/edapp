'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Shield, Building2 } from 'lucide-react';
import { ROLE_METADATA, getRoleMetadata, type RoleMetadata } from '@/lib/roles';

export interface UserRoleAssignment {
    id: string;
    role: string;
    tenant_id?: string;
    tenant_name?: string;
    tenant_slug?: string;
    branch_id?: string;
    branch_name?: string;
    is_active: boolean;
}

interface RoleSwitcherProps {
    currentRole: UserRoleAssignment;
    allRoles: UserRoleAssignment[];
    onSwitch: (role: UserRoleAssignment) => void;
    compact?: boolean;
}

export function RoleSwitcher({ currentRole, allRoles, onSwitch, compact = false }: RoleSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentMeta = getRoleMetadata(currentRole.role);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false);
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSwitch = (role: UserRoleAssignment) => {
        if (role.id !== currentRole.id) {
            onSwitch(role);
        }
        setIsOpen(false);
    };

    // Group roles by tenant
    const rolesByTenant = allRoles.reduce((acc, role) => {
        const key = role.tenant_id || 'platform';
        if (!acc[key]) {
            acc[key] = {
                tenantName: role.tenant_name || 'Platform',
                tenantSlug: role.tenant_slug,
                roles: []
            };
        }
        acc[key].roles.push(role);
        return acc;
    }, {} as Record<string, { tenantName: string; tenantSlug?: string; roles: UserRoleAssignment[] }>);

    const hasSingleRole = allRoles.length === 1;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => !hasSingleRole && setIsOpen(!isOpen)}
                disabled={hasSingleRole}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl transition-all
                    ${hasSingleRole
                        ? 'cursor-default'
                        : 'hover:bg-secondary/60 active:scale-[0.98]'
                    }
                    ${isOpen ? 'bg-secondary/60' : ''}
                `}
            >
                {/* Role Icon Badge */}
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-white
                    ${currentMeta?.color || 'bg-slate-500'}
                `}>
                    <span className="material-symbols-outlined text-lg">
                        {currentMeta?.icon || 'person'}
                    </span>
                </div>

                {/* Role Info */}
                {!compact && (
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                            {currentMeta?.shortName || currentRole.role}
                        </span>
                        {currentRole.branch_name && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {currentRole.branch_name}
                            </span>
                        )}
                    </div>
                )}

                {/* Dropdown Arrow */}
                {!hasSingleRole && (
                    <ChevronDown
                        size={16}
                        className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="
                    absolute top-full right-0 mt-2 w-72
                    bg-background/95 backdrop-blur-xl
                    border border-border/50 rounded-2xl shadow-xl
                    overflow-hidden z-50
                    animate-in fade-in slide-in-from-top-2 duration-200
                ">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border/50">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Switch Role
                        </h3>
                    </div>

                    {/* Role List */}
                    <div className="max-h-80 overflow-y-auto py-2">
                        {Object.entries(rolesByTenant).map(([tenantKey, { tenantName, roles }]) => (
                            <div key={tenantKey}>
                                {/* Tenant Header (only if multiple tenants) */}
                                {Object.keys(rolesByTenant).length > 1 && (
                                    <div className="px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Building2 size={12} />
                                        <span className="font-medium">{tenantName}</span>
                                    </div>
                                )}

                                {/* Roles in this tenant */}
                                {roles.map((role) => {
                                    const meta = getRoleMetadata(role.role);
                                    const isActive = role.id === currentRole.id;

                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => handleSwitch(role)}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 text-left
                                                transition-colors
                                                ${isActive
                                                    ? 'bg-primary/10'
                                                    : 'hover:bg-secondary/50'
                                                }
                                            `}
                                        >
                                            {/* Role Icon */}
                                            <div className={`
                                                w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0
                                                ${meta?.color || 'bg-slate-500'}
                                            `}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {meta?.icon || 'person'}
                                                </span>
                                            </div>

                                            {/* Role Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {meta?.displayName || role.role}
                                                </p>
                                                {role.branch_name && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {role.branch_name}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-muted-foreground/70 truncate">
                                                    {meta?.description}
                                                </p>
                                            </div>

                                            {/* Active Indicator */}
                                            {isActive && (
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-border/50 bg-secondary/30">
                        <p className="text-[10px] text-muted-foreground text-center">
                            <Shield size={10} className="inline mr-1" />
                            Role switches are logged for security
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
