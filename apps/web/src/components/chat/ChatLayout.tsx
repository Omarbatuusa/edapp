'use client';

import React, { ReactNode } from 'react';

// ============================================================
// CHAT LAYOUT - Messenger-like 2-3 pane layout for desktop
// ============================================================

export interface ChatLayoutProps {
    // Panes
    inbox: ReactNode;
    conversation?: ReactNode;
    details?: ReactNode;
    // State
    showConversation: boolean;
    showDetails: boolean;
    // Callbacks
    onCloseConversation?: () => void;
    onCloseDetails?: () => void;
}

export function ChatLayout({
    inbox,
    conversation,
    details,
    showConversation,
    showDetails,
    onCloseConversation,
    onCloseDetails
}: ChatLayoutProps) {
    return (
        <div className="flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* Left Pane - Inbox (always visible on desktop, hidden on mobile when viewing thread) */}
            <div
                className={`
                    w-full lg:w-[320px] xl:w-[360px] shrink-0 border-r border-border overflow-hidden
                    ${showConversation ? 'hidden lg:block' : 'block'}
                `}
            >
                {inbox}
            </div>

            {/* Center Pane - Conversation */}
            {showConversation ? (
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    {conversation}
                </div>
            ) : (
                /* Empty state for desktop when no conversation selected */
                <div className="hidden lg:flex flex-1 items-center justify-center text-center p-8 bg-secondary/20">
                    <div>
                        <span className="material-symbols-outlined text-6xl text-muted-foreground/40 mb-4 block">
                            chat
                        </span>
                        <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                            Select a conversation
                        </h3>
                        <p className="text-sm text-muted-foreground/70">
                            Choose from your existing conversations or start a new one
                        </p>
                    </div>
                </div>
            )}

            {/* Right Pane - Details (optional, desktop only) */}
            {showDetails && details && (
                <div className="hidden xl:block w-[360px] shrink-0 border-l border-border overflow-hidden">
                    {details}
                </div>
            )}
        </div>
    );
}

// ============================================================
// MOBILE PUSH TRANSITION WRAPPER
// ============================================================

export interface PushTransitionProps {
    children: ReactNode;
    show: boolean;
    direction?: 'left' | 'right';
}

export function PushTransition({ children, show, direction = 'right' }: PushTransitionProps) {
    if (!show) return null;
    return (
        <div className="absolute inset-0 bg-background z-10 animate-in slide-in-from-right duration-300">
            {children}
        </div>
    );
}
