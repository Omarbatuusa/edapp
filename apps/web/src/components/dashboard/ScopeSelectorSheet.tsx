'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    is_main_branch: boolean;
}

interface ScopeSelectorSheetProps {
    isOpen: boolean;
    onClose: () => void;
    branches: Branch[];
    currentScope: string | null;
    onSelect: (branchId: string | null) => void;
    /** Optional tenant name shown at the top of the sheet */
    tenantName?: string;
}

export function ScopeSelectorSheet({
    isOpen,
    onClose,
    branches,
    currentScope,
    onSelect,
    tenantName,
}: ScopeSelectorSheetProps) {
    const panelRef = useRef<HTMLDivElement>(null);

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

    const handleSelect = (branchId: string | null) => {
        onSelect(branchId);
        onClose();
    };

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
                aria-label="Select campus"
            >
                {/* Handle + Header */}
                <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-border/50">
                    <div className="w-10 h-1 rounded-full bg-border mb-3" />
                    <div className="flex items-center justify-between w-full">
                        <h2 className="text-lg font-semibold">Select Campus</h2>
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

                {/* Branch list */}
                <div className="flex-1 overflow-y-auto p-2">
                    {/* Tenant info header */}
                    {tenantName && (
                        <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-[hsl(var(--admin-surface-alt)/0.5)]">
                            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] text-xl">school</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{tenantName}</p>
                                <p className="text-xs text-muted-foreground">Select a campus to filter data</p>
                            </div>
                        </div>
                    )}
                    {/* All campuses option */}
                    {branches.length > 1 && (
                        <button
                            type="button"
                            onClick={() => handleSelect(null)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${currentScope === null
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-secondary/50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentScope === null
                                ? 'bg-primary text-white'
                                : 'bg-secondary text-muted-foreground'
                                }`}>
                                <span className="material-symbols-outlined text-xl">apartment</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">All campuses</p>
                                <p className="text-xs text-muted-foreground">{branches.length} branches</p>
                            </div>
                            {currentScope === null && (
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                            )}
                        </button>
                    )}

                    {/* Individual branches */}
                    {branches.map(branch => (
                        <button
                            type="button"
                            key={branch.id}
                            onClick={() => handleSelect(branch.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${currentScope === branch.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-secondary/50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentScope === branch.id
                                ? 'bg-primary text-white'
                                : 'bg-secondary text-muted-foreground'
                                }`}>
                                <span className="material-symbols-outlined text-xl">
                                    {branch.is_main_branch ? 'home' : 'location_on'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{branch.branch_name}</p>
                                <p className="text-xs text-muted-foreground">{branch.branch_code}{branch.is_main_branch ? ' · Main' : ''}</p>
                            </div>
                            {currentScope === branch.id && (
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
