'use client';

import { useState } from 'react';

interface QuickAddItem {
    icon: string;
    label: string;
    onClick: () => void;
    color?: string;
}

interface QuickAddFABProps {
    items: QuickAddItem[];
}

export function QuickAddFAB({ items }: QuickAddFABProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/20 z-[80] fade-in"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* FAB container */}
            <div className="fixed bottom-[calc(var(--admin-nav-height,68px)+16px)] sm:bottom-6 right-4 sm:right-6 z-[81] flex flex-col-reverse items-end gap-3">
                {/* Main FAB */}
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`
                        w-14 h-14 rounded-full bg-[hsl(var(--admin-primary))] text-white shadow-lg hover:shadow-xl
                        flex items-center justify-center transition-all active:scale-[0.92]
                        ${open ? 'rotate-45' : ''}
                    `}
                    aria-label={open ? 'Close quick actions' : 'Quick actions'}
                >
                    <span className="material-symbols-outlined text-[28px] transition-transform">add</span>
                </button>

                {/* Action items — fan out upward */}
                {open && items.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 animate-fab-item"
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {/* Label */}
                        <span className="px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-surface))] text-[12px] font-semibold shadow-md whitespace-nowrap">
                            {item.label}
                        </span>

                        {/* Mini FAB */}
                        <button
                            type="button"
                            onClick={() => { item.onClick(); setOpen(false); }}
                            className={`
                                w-11 h-11 rounded-full shadow-md flex items-center justify-center transition-all active:scale-[0.92]
                                ${item.color || 'bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-border))]'}
                            `}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
