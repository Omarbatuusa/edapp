'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface LinkedTenant {
    id: string;
    access_level: string;
    source_tenant: {
        id: string;
        school_name: string;
        tenant_slug: string;
        tenant_type: string;
        area_label: string | null;
        logo_file_id: string | null;
    } | null;
    target_tenant: {
        id: string;
        school_name: string;
        tenant_slug: string;
        tenant_type: string;
        area_label: string | null;
        logo_file_id: string | null;
    } | null;
}

interface LinkedTenantSwitcherProps {
    isOpen: boolean;
    onClose: () => void;
    currentTenantSlug: string;
}

const TYPE_LABELS: Record<string, string> = {
    school: 'School',
    main_branch: 'Main Branch',
    branch: 'Branch',
    campus: 'Campus',
};

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function LinkedTenantSwitcher({ isOpen, onClose, currentTenantSlug }: LinkedTenantSwitcherProps) {
    const [linkedTenants, setLinkedTenants] = useState<LinkedTenant[]>([]);
    const [loading, setLoading] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        fetch('/v1/auth/my-linked-tenants', { headers: getAuthHeaders() })
            .then(res => res.ok ? res.json() : [])
            .then(data => setLinkedTenants(Array.isArray(data) ? data : []))
            .catch(() => setLinkedTenants([]))
            .finally(() => setLoading(false));
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSwitch = (tenant: { id: string; tenant_slug: string }) => {
        // Update localStorage context
        localStorage.setItem('admin_tenant_slug', tenant.tenant_slug);
        localStorage.setItem('admin_tenant_id', tenant.id);
        // Full page navigation to clear all stale tenant state
        window.location.href = `/tenant/${tenant.tenant_slug}/admin`;
    };

    // Deduplicate target tenants (user might have grants via multiple sources)
    const targets = linkedTenants
        .filter(lt => lt.target_tenant)
        .map(lt => lt.target_tenant!)
        .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Bottom sheet */}
            <div
                ref={panelRef}
                className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Switch school"
            >
                {/* Handle + Header */}
                <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-border/50">
                    <div className="w-10 h-1 rounded-full bg-border mb-3" />
                    <div className="flex items-center justify-between w-full">
                        <h2 className="text-lg font-semibold">Switch School</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/60 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : targets.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-2">
                            <span className="material-symbols-outlined text-3xl text-muted-foreground">link_off</span>
                            <p className="text-sm text-muted-foreground">No linked schools found</p>
                        </div>
                    ) : (
                        targets.map(tenant => {
                            const isCurrent = tenant.tenant_slug === currentTenantSlug;
                            return (
                                <button
                                    key={tenant.id}
                                    type="button"
                                    onClick={() => !isCurrent && handleSwitch(tenant)}
                                    disabled={isCurrent}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                                        isCurrent
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-secondary/50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        isCurrent ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                                    }`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {tenant.tenant_type === 'main_branch' ? 'corporate_fare' : tenant.tenant_type === 'branch' ? 'domain_add' : 'school'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{tenant.school_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {TYPE_LABELS[tenant.tenant_type] || tenant.tenant_type}
                                            {tenant.area_label ? ` \u00b7 ${tenant.area_label}` : ''}
                                        </p>
                                    </div>
                                    {isCurrent && (
                                        <span className="material-symbols-outlined text-primary flex-shrink-0">check_circle</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}

/**
 * Hook to check whether the user has any linked tenants.
 * Returns true if the user has at least one linked tenant grant.
 */
export function useHasLinkedTenants(): boolean {
    const [has, setHas] = useState(false);
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
        if (!token) return;
        fetch('/v1/auth/my-linked-tenants', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : [])
            .then(data => setHas(Array.isArray(data) && data.length > 0))
            .catch(() => {});
    }, []);
    return has;
}
