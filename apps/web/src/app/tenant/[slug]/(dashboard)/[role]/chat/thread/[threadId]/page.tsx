'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ThreadHeader } from '@/components/chat/ThreadHeader';
import { MessageList, Message } from '@/components/chat/MessageList';
import { Composer } from '@/components/chat/Composer';
import { ThreadDetails } from '@/components/chat/ThreadDetails';
import { useChatStore } from '@/lib/chat-store';

// ============================================================
// MOCK MESSAGES - Will be replaced with API
// ============================================================

const MOCK_MESSAGES: Message[] = [
    {
        id: 'msg-1',
        threadId: 'thread-1',
        content: 'Hi, I wanted to check in about Bart\'s progress this week.',
        senderId: 'parent-1',
        isOwn: true,
        timestamp: '10:15 AM',
        date: 'Today',
        status: 'read',
    },
    {
        id: 'msg-2',
        threadId: 'thread-1',
        content: 'Thank you for reaching out! Bart has been doing much better in class. His math scores have improved significantly.',
        senderId: 'teacher-1',
        senderName: 'Mrs. Smith',
        isOwn: false,
        timestamp: '10:20 AM',
        date: 'Today',
    },
    {
        id: 'msg-3',
        threadId: 'thread-1',
        content: 'That\'s wonderful to hear! We\'ve been working on practice problems at home.',
        senderId: 'parent-1',
        isOwn: true,
        timestamp: '10:25 AM',
        date: 'Today',
        status: 'read',
    },
    {
        id: 'msg-4',
        threadId: 'thread-1',
        content: 'That definitely shows. Keep up the great work! I\'ll send his progress report by Friday.',
        senderId: 'teacher-1',
        senderName: 'Mrs. Smith',
        isOwn: false,
        timestamp: '10:30 AM',
        date: 'Today',
    },
    {
        id: 'msg-5',
        threadId: 'thread-1',
        content: 'Perfect, thank you! Is there anything specific we should focus on for the upcoming tests?',
        senderId: 'parent-1',
        isOwn: true,
        timestamp: '10:32 AM',
        date: 'Today',
        status: 'delivered',
    },
];

const MOCK_THREAD_DATA = {
    'thread-1': {
        name: 'Mrs. Smith',
        avatar: 'MS',
        subtitle: 'Class Teacher • Grade 5',
        online: true,
        type: 'dm' as const,
    },
    'thread-2': {
        name: 'Mr. Johnson',
        avatar: 'MJ',
        subtitle: 'Math Teacher • Grade 5',
        online: false,
        type: 'dm' as const,
    },
    'thread-3': {
        name: 'Grade 5 • 2026',
        avatar: 'G5',
        subtitle: 'St Marks • 24 members',
        online: false,
        type: 'group' as const,
    },
};

// ============================================================
// THREAD VIEW COMPONENT
// ============================================================

export default function ThreadPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const role = params.role as string || 'parent';
    const threadId = params.threadId as string;

    // State
    const [showDetails, setShowDetails] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    // Get thread data
    const threadData = MOCK_THREAD_DATA[threadId as keyof typeof MOCK_THREAD_DATA] || {
        name: 'Conversation',
        type: 'dm' as const,
    };

    // Load messages
    useEffect(() => {
        // Filter messages for this thread
        const threadMessages = MOCK_MESSAGES.filter(m => m.threadId === threadId);
        if (threadMessages.length > 0) {
            setMessages(threadMessages);
        } else {
            // Generate some placeholder messages
            setMessages([
                {
                    id: 'placeholder-1',
                    threadId,
                    content: 'Hello! How can I help you today?',
                    senderId: 'other',
                    senderName: threadData.name,
                    isOwn: false,
                    timestamp: '9:00 AM',
                    date: 'Today',
                }
            ]);
        }
    }, [threadId, threadData.name]);

    // Mark thread as read
    const { markThreadRead } = useChatStore();
    useEffect(() => {
        markThreadRead(threadId);
    }, [threadId, markThreadRead]);

    // Send message handler
    const handleSend = (content: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            threadId,
            content,
            senderId: 'current-user',
            isOwn: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today',
            status: 'sending',
        };
        setMessages(prev => [...prev, newMessage]);

        // Simulate message being sent
        setTimeout(() => {
            setMessages(prev => prev.map(m =>
                m.id === newMessage.id ? { ...m, status: 'delivered' } : m
            ));
        }, 1000);
    };

    const basePath = `/tenant/${tenantSlug}/${role}`;
    const isDM = threadData.type === 'dm';

    return (
        <div className="flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)]">
            {/* Main Thread View */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Thread Header */}
                <ThreadHeader
                    name={threadData.name}
                    subtitle={threadData.subtitle}
                    avatar={threadData.avatar}
                    online={threadData.online}
                    backHref={`${basePath}/chat`}
                    showCall={isDM}
                    onCall={() => console.log('Call')}
                    onSearch={() => console.log('Search')}
                    onMore={() => setShowDetails(!showDetails)}
                />

                {/* Message List */}
                <MessageList
                    messages={messages}
                    isGroupChat={threadData.type === 'group'}
                />

                {/* Composer */}
                <Composer
                    onSend={handleSend}
                    onVoiceNote={() => console.log('Voice note')}
                />
            </div>

            {/* Details Panel (Desktop) */}
            {showDetails && (
                <div className="hidden lg:block w-[360px] border-l border-border shrink-0">
                    <ThreadDetails
                        threadId={threadId}
                        type={threadData.type}
                        name={threadData.name}
                        subtitle={threadData.subtitle}
                        avatar={threadData.avatar}
                        onClose={() => setShowDetails(false)}
                        members={threadData.type === 'group' ? [
                            { id: '1', name: 'Mrs. Smith', role: 'Teacher', isAdmin: true },
                            { id: '2', name: 'Parent A', role: 'Parent' },
                            { id: '3', name: 'Parent B', role: 'Parent' },
                        ] : undefined}
                    />
                </div>
            )}
        </div>
    );
}
