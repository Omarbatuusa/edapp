'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface TakeoverLayoutProps {
    children: React.ReactNode;
    /** Title shown in the takeover app bar */
    title?: string;
    /** Icon name (material-symbols) shown before title */
    icon?: string;
    /** Icon color class */
    iconColor?: string;
    /** Close handler — defaults to router.back() */
    onClose?: () => void;
    /** Right-side actions slot */
    actions?: React.ReactNode;
    /** Whether to show the header bar (default true) */
    showHeader?: boolean;
    /** aria-label for the dialog */
    ariaLabel?: string;
}

/**
 * TakeoverLayout — responsive fullscreen overlay.
 *
 * - Mobile (<768px): edge-to-edge fullwidth, native app feel.
 * - Tablet/Desktop (≥768px): centered container matching Admin max-width,
 *   with backdrop overlay behind it.
 *
 * Renders its own app bar (back/close + title) so pages using this
 * should NOT render inside AppShell chrome (default/takeover).
 */
export function TakeoverLayout({
    children,
    title,
    icon,
    iconColor = 'text-[hsl(var(--admin-primary))]',
    onClose,
    actions,
    showHeader = true,
    ariaLabel,
}: TakeoverLayoutProps) {
    const router = useRouter();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <>
            {/* Backdrop — visible on tablet/desktop only */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm hidden md:block"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Takeover panel */}
            <div
                className="
                    fixed inset-0 z-50 flex flex-col
                    bg-[hsl(var(--admin-background))]
                    md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                    md:w-[min(640px,calc(100vw-48px))] md:h-[min(85vh,800px)]
                    md:rounded-2xl md:shadow-2xl md:overflow-hidden
                    animate-in slide-in-from-bottom duration-300 md:fade-in md:zoom-in-95
                "
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel || title || 'Overlay'}
            >
                {/* App bar */}
                {showHeader && (
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-background)/0.75)] backdrop-blur-[24px] flex-shrink-0"
                        style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
                    >
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.92] flex-shrink-0"
                            aria-label="Close"
                        >
                            <span className="material-symbols-outlined text-[22px] md:hidden">arrow_back</span>
                            <X size={20} className="hidden md:block" />
                        </button>

                        {(title || icon) && (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {icon && (
                                    <span className={`material-symbols-outlined text-xl ${iconColor}`}>
                                        {icon}
                                    </span>
                                )}
                                {title && (
                                    <h2 className="text-[17px] font-semibold text-[hsl(var(--admin-text-main))] truncate">
                                        {title}
                                    </h2>
                                )}
                            </div>
                        )}

                        {actions && (
                            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                                {actions}
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </div>
        </>
    );
}
