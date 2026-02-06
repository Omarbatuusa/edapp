'use client';

import React from 'react';
import { X, Phone, Trash2, Bell, BellOff, Users, Image, FileText, Shield, ChevronRight } from 'lucide-react';

// ============================================================
// THREAD DETAILS - Right pane / push screen for thread info
// ============================================================

export interface ThreadMember {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    isAdmin?: boolean;
}

export interface ThreadDetailsProps {
    threadId: string;
    type: 'dm' | 'group' | 'announcement' | 'ticket' | 'safeguarding';
    name: string;
    subtitle?: string;
    avatar?: string;
    members?: ThreadMember[];
    // Settings
    muted?: boolean;
    onToggleMute?: () => void;
    onClose: () => void;
    // Group features
    canAddMembers?: boolean;
    onAddMembers?: () => void;
    // Actions
    onDelete?: () => void;
    onReport?: () => void;
    // Stats
    mediaCount?: number;
    filesCount?: number;
}

export function ThreadDetails({
    threadId,
    type,
    name,
    subtitle,
    avatar,
    members = [],
    muted = false,
    onToggleMute,
    onClose,
    canAddMembers = false,
    onAddMembers,
    onDelete,
    onReport,
    mediaCount = 0,
    filesCount = 0
}: ThreadDetailsProps) {
    const renderAvatar = () => {
        if (avatar?.startsWith('http')) {
            return (
                <img
                    src={avatar}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover"
                />
            );
        }
        return (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">
                {avatar || name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-semibold">Details</h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Profile Section */}
                <div className="flex flex-col items-center py-6 border-b border-border">
                    {renderAvatar()}
                    <h3 className="mt-3 font-semibold text-lg">{name}</h3>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                    {type === 'dm' && (
                        <button className="mt-3 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
                            <Phone size={16} />
                            Call
                        </button>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="p-4 space-y-1 border-b border-border">
                    <button
                        onClick={onToggleMute}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                        {muted ? <Bell size={20} /> : <BellOff size={20} />}
                        <span className="flex-1">{muted ? 'Unmute' : 'Mute'} notifications</span>
                    </button>
                </div>

                {/* Media & Files */}
                <div className="p-4 space-y-1 border-b border-border">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Shared
                    </h4>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left">
                        <Image size={20} className="text-muted-foreground" />
                        <span className="flex-1">Media</span>
                        <span className="text-sm text-muted-foreground">{mediaCount}</span>
                        <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left">
                        <FileText size={20} className="text-muted-foreground" />
                        <span className="flex-1">Documents</span>
                        <span className="text-sm text-muted-foreground">{filesCount}</span>
                        <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Members (for groups) */}
                {(type === 'group' || members.length > 0) && (
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Members ({members.length})
                            </h4>
                            {canAddMembers && (
                                <button
                                    onClick={onAddMembers}
                                    className="text-xs text-primary font-medium hover:underline"
                                >
                                    Add
                                </button>
                            )}
                        </div>
                        <div className="space-y-1">
                            {members.slice(0, 5).map((member) => (
                                <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium shrink-0">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            member.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{member.name}</p>
                                        {member.role && (
                                            <p className="text-xs text-muted-foreground">{member.role}</p>
                                        )}
                                    </div>
                                    {member.isAdmin && (
                                        <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            Admin
                                        </span>
                                    )}
                                </div>
                            ))}
                            {members.length > 5 && (
                                <button className="w-full py-2 text-sm text-primary font-medium hover:underline">
                                    View all {members.length} members
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="p-4 space-y-1">
                    {onReport && (
                        <button
                            onClick={onReport}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left text-amber-600 dark:text-amber-400"
                        >
                            <Shield size={20} />
                            <span>Report</span>
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
                        >
                            <Trash2 size={20} />
                            <span>Delete conversation</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
