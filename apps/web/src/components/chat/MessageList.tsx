'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { MessageBubble, DateSeparator } from './MessageBubble';

// ============================================================
// MESSAGE LIST - Virtualized with date grouping
// ============================================================

export interface Message {
    id: string;
    threadId?: string; // Optional for grouping with thread
    content: string;
    senderId: string;
    senderName?: string;
    isOwn: boolean;
    timestamp: string;
    date: string; // For grouping: 'Today', 'Yesterday', 'Feb 6'
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    attachments?: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        duration?: number;
    }[];
}

export interface MessageListProps {
    messages: Message[];
    isGroupChat?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

interface ListItem {
    type: 'date' | 'message';
    date?: string;
    message?: Message;
    isGrouped?: boolean;
}

export function MessageList({
    messages,
    isGroupChat = false,
    loading = false,
    onLoadMore,
    hasMore = false
}: MessageListProps) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    // Convert messages to items with date separators
    const items = useMemo<ListItem[]>(() => {
        const result: ListItem[] = [];
        let lastDate = '';
        let lastSenderId = '';

        messages.forEach((msg, idx) => {
            // Add date separator if date changed
            if (msg.date !== lastDate) {
                result.push({ type: 'date', date: msg.date });
                lastDate = msg.date;
                lastSenderId = ''; // Reset grouping on new date
            }

            // Determine if message should be grouped
            const isGrouped = msg.senderId === lastSenderId;
            result.push({ type: 'message', message: msg, isGrouped });
            lastSenderId = msg.senderId;
        });

        return result;
    }, [messages]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            virtuosoRef.current?.scrollToIndex({
                index: items.length - 1,
                behavior: 'smooth'
            });
        }
    }, [messages.length, items.length]);

    const renderItem = (index: number, item: ListItem) => {
        if (item.type === 'date') {
            return <DateSeparator date={item.date!} />;
        }

        const msg = item.message!;
        return (
            <MessageBubble
                key={msg.id}
                content={msg.content}
                isOwn={msg.isOwn}
                timestamp={msg.timestamp}
                status={msg.status}
                senderName={msg.senderName}
                showSender={isGroupChat && !msg.isOwn && !item.isGrouped}
                isGrouped={item.isGrouped}
                attachments={msg.attachments}
            />
        );
    };

    return (
        <div
            className="flex-1 overflow-hidden"
            style={{ backgroundColor: 'rgba(var(--secondary-rgb, 0,0,0), 0.03)' }}
        >
            <Virtuoso
                ref={virtuosoRef}
                className="h-full"
                data={items}
                itemContent={renderItem}
                followOutput="smooth"
                initialTopMostItemIndex={items.length - 1}
                startReached={() => hasMore && onLoadMore?.()}
                components={{
                    Header: loading ? () => (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : undefined,
                    EmptyPlaceholder: () => (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-3">
                                chat_bubble_outline
                            </span>
                            <p className="text-muted-foreground">No messages yet</p>
                            <p className="text-sm text-muted-foreground/70">Start the conversation</p>
                        </div>
                    )
                }}
                style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 16, paddingBottom: 16 }}
            />
        </div>
    );
}
