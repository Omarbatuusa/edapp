'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Phone, Search, MoreVertical } from 'lucide-react';

// ============================================================
// THREAD HEADER - WhatsApp-style sticky header
// ============================================================

export interface ThreadHeaderProps {
    name: string;
    subtitle?: string;
    avatar?: string;
    online?: boolean;
    backHref: string;
    // Features
    showCall?: boolean;
    showSearch?: boolean;
    onCall?: () => void;
    onSearch?: () => void;
    onMore?: () => void;
}

export function ThreadHeader({
    name,
    subtitle,
    avatar,
    online = false,
    backHref,
    showCall = false,
    showSearch = true,
    onCall,
    onSearch,
    onMore
}: ThreadHeaderProps) {
    const renderAvatar = () => {
        if (avatar?.startsWith('http')) {
            return (
                <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover"
                />
            );
        }
        return (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                {avatar || name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <header className="flex items-center gap-3 px-2 sm:px-4 py-3 border-b border-border bg-background sticky top-0 z-20">
            {/* Back Button */}
            <Link
                href={backHref}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors -ml-1"
                aria-label="Go back"
            >
                <ChevronLeft size={24} />
            </Link>

            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
                {renderAvatar()}
                {online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                )}
            </div>

            {/* Title & Subtitle */}
            <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-base truncate">{name}</h1>
                {subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
                {/* Audio Call - DM only */}
                {showCall && (
                    <button
                        onClick={onCall}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                        aria-label="Audio call"
                    >
                        <Phone size={20} className="text-muted-foreground" />
                    </button>
                )}

                {/* Search in thread */}
                {showSearch && (
                    <button
                        onClick={onSearch}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                        aria-label="Search in conversation"
                    >
                        <Search size={20} className="text-muted-foreground" />
                    </button>
                )}

                {/* More options */}
                <button
                    onClick={onMore}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    aria-label="More options"
                >
                    <MoreVertical size={20} className="text-muted-foreground" />
                </button>
            </div>
        </header>
    );
}
