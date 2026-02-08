'use client';

import React from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatInbox } from '@/components/chat/ChatInbox';

export default function Layout({ children }: { children: React.ReactNode }) {
    const segment = useSelectedLayoutSegment();
    const showConversation = !!segment;

    return (
        <ChatLayout
            inbox={<ChatInbox />}
            conversation={children}
            showConversation={showConversation}
            showDetails={false}
        />
    );
}
