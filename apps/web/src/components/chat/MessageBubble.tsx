'use client';

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

// ============================================================
// MESSAGE BUBBLE - WhatsApp-style with proper contrast
// ============================================================

export interface MessageBubbleProps {
    content: string;
    isOwn: boolean;
    timestamp: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    senderName?: string;
    showSender?: boolean;
    isGrouped?: boolean;
    attachments?: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        duration?: number;
    }[];
}

export function MessageBubble({
    content,
    isOwn,
    timestamp,
    status,
    senderName,
    showSender = false,
    isGrouped = false,
    attachments
}: MessageBubbleProps) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}>
            <div
                className={`relative max-w-[72%] px-3 py-2 shadow-sm ${isOwn
                    ? 'rounded-2xl rounded-br-md'
                    : 'rounded-2xl rounded-bl-md bg-card border border-border/50'
                    }`}
                style={isOwn ? {
                    backgroundColor: '#FFFFFF',
                    color: 'hsl(var(--primary))',
                    border: '1px solid hsl(var(--primary) / 0.2)',
                    lineHeight: 1.4
                } : { lineHeight: 1.4 }}
            >
                {/* Sender name for group chats */}
                {showSender && !isOwn && senderName && (
                    <p className="text-xs font-semibold text-primary mb-0.5">{senderName}</p>
                )}

                {/* Attachments */}
                {attachments && attachments.length > 0 && (
                    <div className="mb-1.5">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="mb-1">
                                {att.type === 'image' && (
                                    <img
                                        src={att.url}
                                        alt="Attachment"
                                        className="rounded-lg max-w-full"
                                    />
                                )}
                                {att.type === 'voice' && (
                                    <div className="flex items-center gap-2 py-1">
                                        <span className="material-symbols-outlined text-lg">play_circle</span>
                                        <div className="flex-1 h-1 bg-current/30 rounded-full">
                                            <div className="h-full w-1/3 bg-current rounded-full" />
                                        </div>
                                        <span className="text-xs opacity-75">
                                            {att.duration ? `${Math.floor(att.duration / 60)}:${String(att.duration % 60).padStart(2, '0')}` : '0:00'}
                                        </span>
                                    </div>
                                )}
                                {att.type === 'document' && (
                                    <div className="flex items-center gap-2 py-1 px-2 bg-black/10 rounded-lg">
                                        <span className="material-symbols-outlined">description</span>
                                        <span className="text-sm truncate">{att.name || 'Document'}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Message content */}
                <p
                    className="break-words"
                    style={{
                        fontSize: '15px',
                        color: isOwn ? 'inherit' : 'inherit'
                    }}
                >
                    {content}
                </p>

                {/* Timestamp and status */}
                <div
                    className="flex items-center justify-end gap-1 mt-1"
                    style={{ color: isOwn ? 'hsl(var(--primary) / 0.7)' : 'var(--muted-foreground)' }}
                >
                    <span style={{ fontSize: '10px' }}>{timestamp}</span>
                    {isOwn && status && (
                        <span className="flex items-center">
                            {status === 'sending' && (
                                <span className="w-3 h-3 animate-pulse">●</span>
                            )}
                            {status === 'sent' && <Check size={12} />}
                            {status === 'delivered' && <CheckCheck size={12} />}
                            {status === 'read' && (
                                <CheckCheck size={12} className="text-blue-300" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// DATE SEPARATOR - For message grouping
// ============================================================

export interface DateSeparatorProps {
    date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
    return (
        <div className="flex items-center justify-center py-3">
            <span className="px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs text-muted-foreground shadow-sm border border-border/30">
                {date}
            </span>
        </div>
    );
}
