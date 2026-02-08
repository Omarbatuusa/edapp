'use client';

import React, { useState, Suspense } from 'react';
import { FeedItem } from './types';
import { FeedView } from './FeedView';
import { MessageThreadView } from './MessageThreadView';
import { TicketDetailView } from './TicketDetailView';
import { AnnouncementDetailView } from './AnnouncementDetailView';
import { NewChatView } from './NewChatView';
import { ChannelInfoView } from './ChannelInfoView';
import { ActionRequiredView } from './ActionRequiredView';
import { CreateChannelView } from './CreateChannelView';
import { LanguageSheet } from './LanguageSheet';
import { ScreenStackDetail } from './ScreenStack';
import { ChatThreadView } from './messaging/ChatThreadView';
import { MessagesLayout } from './messaging/MessagesLayout';
import { ChatSocketManager } from './ChatSocketManager';

// ============================================================
// COMMUNICATION HUB COMPONENT (CONTROLLER)
// ============================================================

interface CommunicationHubProps {
    officeHours?: string;
}

export function CommunicationHub({ officeHours = "Mon-Fri, 8 AM - 3 PM" }: CommunicationHubProps) {
    // Internal Navigation State
    const [activeView, setActiveView] = useState<'feed' | 'thread' | 'ticket' | 'announcement' | 'new-chat' | 'channel-info' | 'action-center' | 'create-channel'>('feed');
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);

    // Global Hub State (Lifted)
    const [selectedChildId, setSelectedChildId] = useState<string>('all');
    const [isTranslated, setIsTranslated] = useState(false);
    const [showLanguageSheet, setShowLanguageSheet] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('English');

    // Navigation Handlers
    const handleOpenItem = (item: FeedItem) => {
        setSelectedItem(item);
        if (item.type === 'message') setActiveView('thread');
        else if (item.type === 'support') setActiveView('ticket');
        else if (item.type === 'announcement' || item.type === 'urgent') setActiveView('announcement');
        else if (item.type === 'action') {
            // Check if it's a specific action or just open action center?
            // For now, let's open action center if type action, or maybe detailed view?
            // The item click usually opens detail.
            // But action items might not have a detail view yet.
            // Let's assume action items open the Action Center focused on that item (mock).
            setActiveView('action-center');
        }
    };

    const handleBack = () => {
        setActiveView('feed');
        setTimeout(() => setSelectedItem(null), 300);
    };

    const handleLanguageSelect = (lang: string) => {
        setCurrentLanguage(lang);
        setIsTranslated(lang !== 'English');
    };



    // ...
    const currentUserId = 'user-1'; // Mock user ID
    const tenantId = 'tenant-1'; // Mock tenant ID

    return (
        <MessagesLayout
            className="md:border-x md:border-border/50 md:shadow-sm md:max-w-4xl md:mx-auto"
        >
            <ChatSocketManager tenantId={tenantId} userId={currentUserId} />

            {/* Main Content - CSS Transitions */}
            <div className="relative w-full h-full">
                {/* Feed View - Always rendered, hidden when not active */}
                <div className={`w-full h-full transition-opacity duration-300 ${activeView === 'feed' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
                    <FeedView
                        onItemClick={handleOpenItem}
                        officeHours={officeHours}
                        selectedChildId={selectedChildId}
                        setSelectedChildId={setSelectedChildId}
                        isTranslated={isTranslated}
                        setIsTranslated={setIsTranslated}
                        onNewChat={() => setActiveView('new-chat')}
                        onOpenActionCenter={() => setActiveView('action-center')}
                        onOpenLanguage={() => setShowLanguageSheet(true)}
                    />
                </div>

                {/* Thread View - Slide in from right */}
                <div className={`absolute inset-0 z-[60] bg-background transform transition-transform duration-300 ease-out ${activeView === 'thread' ? 'translate-x-0' : 'translate-x-full'}`}>
                    {selectedItem && activeView === 'thread' && (
                        <ChatThreadView
                            item={selectedItem}
                            onBack={handleBack}
                            onAction={() => setActiveView('channel-info')}
                        />
                    )}
                </div>

                {/* Channel Info View */}
                <div className={`absolute inset-0 z-[70] bg-background transform transition-transform duration-300 ease-out ${activeView === 'channel-info' ? 'translate-x-0' : 'translate-x-full'}`}>
                    {selectedItem && activeView === 'channel-info' && (
                        <ChannelInfoView item={selectedItem} onClose={() => setActiveView('thread')} />
                    )}
                </div>

                {/* Action Center View */}
                <div className={`absolute inset-0 z-[60] bg-background transform transition-transform duration-300 ease-out ${activeView === 'action-center' ? 'translate-x-0' : 'translate-x-full'}`}>
                    {activeView === 'action-center' && (
                        <ActionRequiredView onClose={() => setActiveView('feed')} />
                    )}
                </div>

                {/* Create Channel View */}
                <div className={`absolute inset-0 z-[60] bg-background transform transition-transform duration-300 ease-out ${activeView === 'create-channel' ? 'translate-x-0' : 'translate-x-full'}`}>
                    {activeView === 'create-channel' && (
                        <CreateChannelView onClose={() => setActiveView('feed')} />
                    )}
                </div>

                {/* Other Detail Views (ticket, announcement, new-chat) */}
                <div className={`absolute inset-0 z-[55] bg-background transform transition-transform duration-300 ease-out ${['ticket', 'announcement', 'new-chat'].includes(activeView) ? 'translate-x-0' : 'translate-x-full'}`}>
                    {['ticket', 'announcement', 'new-chat'].includes(activeView) && (
                        <ScreenStackDetail
                            onBack={handleBack}
                            actionIcon={activeView === 'new-chat' ? 'group_add' : undefined}
                            onAction={activeView === 'new-chat' ? () => setActiveView('create-channel') : undefined}
                        >
                            {activeView === 'ticket' && <TicketDetailView item={selectedItem} isTranslated={isTranslated} />}
                            {activeView === 'announcement' && <AnnouncementDetailView item={selectedItem} isTranslated={isTranslated} />}
                            {activeView === 'new-chat' && <NewChatView onStart={() => setActiveView('feed')} onCreateChannel={() => setActiveView('create-channel')} />}
                        </ScreenStackDetail>
                    )}
                </div>
            </div>

            {/* Language Sheet */}
            {showLanguageSheet && (
                <LanguageSheet
                    isOpen={showLanguageSheet}
                    onClose={() => setShowLanguageSheet(false)}
                    currentLanguage={currentLanguage}
                    onSelectLanguage={handleLanguageSelect}
                />
            )}
        </MessagesLayout >
    );
}

export default CommunicationHub;
