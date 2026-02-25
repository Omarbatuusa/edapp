'use client';

import React, { useState } from 'react';

interface MasterDetailLayoutProps {
    /** Left panel (list) */
    master: React.ReactNode;
    /** Right panel (detail view) */
    detail: React.ReactNode;
    /** Show empty state when no detail selected */
    emptyDetail?: React.ReactNode;
    /** Whether a detail item is currently selected */
    hasSelection?: boolean;
    /** Callback to clear selection (back button on mobile) */
    onClearSelection?: () => void;
    /** Master width ratio on desktop — default 40% */
    masterRatio?: number;
}

/**
 * Reusable master-detail split layout.
 * 
 * - Mobile: shows either master or detail (with back button)
 * - Tablet+: side-by-side with configurable ratio
 */
export function MasterDetailLayout({
    master,
    detail,
    emptyDetail,
    hasSelection = false,
    onClearSelection,
    masterRatio = 40,
}: MasterDetailLayoutProps) {
    return (
        <div className="flex h-full min-h-0">
            {/* Master panel */}
            <div
                className={`
                    flex-shrink-0 overflow-y-auto border-r border-[hsl(var(--admin-border)/0.5)]
                    ${hasSelection ? 'hidden md:flex' : 'flex'}
                    w-full md:w-auto flex-col
                `}
                style={{ flexBasis: `${masterRatio}%`, maxWidth: '100%' }}
            >
                {master}
            </div>

            {/* Detail panel */}
            <div
                className={`
                    flex-1 overflow-y-auto min-w-0
                    ${!hasSelection ? 'hidden md:flex' : 'flex'}
                    flex-col
                `}
            >
                {hasSelection ? (
                    <div className="flex flex-col h-full">
                        {/* Mobile back button */}
                        <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--admin-border)/0.3)]">
                            <button
                                onClick={onClearSelection}
                                className="flex items-center gap-1 text-[hsl(var(--primary))] text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Back
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {detail}
                        </div>
                    </div>
                ) : (
                    emptyDetail || (
                        <div className="flex items-center justify-center h-full text-[hsl(var(--admin-text-muted))]">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">touch_app</span>
                                <p className="text-sm">Select an item to view details</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
