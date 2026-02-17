'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FeedItem } from '@/components/communication/types';
import chatApi from '@/lib/chat-api';

// Dynamic import to avoid SSR issues with localStorage
const ChatThreadView = dynamic(
    () => import('@/components/communication/messaging/ChatThreadView').then(mod => ({ default: mod.ChatThreadView })),
    { ssr: false }
);

const ChatSocketManager = dynamic(
    () => import('@/components/communication/ChatSocketManager').then(mod => ({ default: mod.ChatSocketManager })),
    { ssr: false }
);

export default function ThreadPage({ params }: { params: Promise<{ slug: string; threadId: string }> }) {
    const { slug, threadId } = use(params);
    const router = useRouter();
    const [feedItem, setFeedItem] = useState<FeedItem | null>(null);
    const [loading, setLoading] = useState(true);

    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || '' : '';
    const tenantId = slug;

    // Fetch thread data from API to build a FeedItem
    useEffect(() => {
        let cancelled = false;
        async function loadThread() {
            try {
                const thread = await chatApi.getThread(threadId);
                if (cancelled) return;
                setFeedItem({
                    id: thread.id,
                    threadId: thread.id,
                    type: thread.type === 'ticket' ? 'support' : 'message',
                    title: thread.title || 'Conversation',
                    subtitle: thread.description || '',
                    time: thread.last_message_at ? new Date(thread.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unread: false,
                    source: { name: thread.title || 'Conversation' },
                });
            } catch {
                // If thread not found, build a minimal FeedItem from URL
                if (cancelled) return;
                setFeedItem({
                    id: threadId,
                    threadId: threadId,
                    type: 'message',
                    title: 'Conversation',
                    subtitle: '',
                    time: '',
                    unread: false,
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadThread();
        return () => { cancelled = true; };
    }, [threadId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[100dvh] bg-[#f0f4f8]">
                <div className="w-8 h-8 border-3 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" />
            </div>
        );
    }

    if (!feedItem) return null;

    return (
        <div className="flex flex-col h-[100dvh]">
            <ChatSocketManager tenantId={tenantId} userId={currentUserId} />
            <ChatThreadView
                item={feedItem}
                onBack={() => router.push(`/tenant/${slug}/parent/chat`)}
                onAction={() => {}}
            />
        </div>
    );
}
