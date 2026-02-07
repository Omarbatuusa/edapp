'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-background md:max-w-4xl md:mx-auto md:border-x md:border-border/50 md:shadow-sm text-foreground">
            <AnimatePresence mode="popLayout">
                {activeView === 'feed' ? (
                    <FeedView
                        key="feed"
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
                ) : activeView === 'channel-info' ? (
                    <motion.div
                        key="channel-info"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 z-[60]"
                    >
                        <ChannelInfoView item={selectedItem} onClose={() => setActiveView('thread')} />
                    </motion.div>
                ) : activeView === 'action-center' ? (
                    <motion.div
                        key="action-center"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 z-[60]"
                    >
                        <ActionRequiredView onClose={() => setActiveView('feed')} />
                    </motion.div>
                ) : activeView === 'create-channel' ? (
                    <motion.div
                        key="create-channel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 z-[60]"
                    >
                        <CreateChannelView onClose={() => setActiveView('feed')} />
                    </motion.div>
                ) : (
                    <ScreenStackDetail
                        key="detail"
                        onBack={handleBack}
                        title={activeView === 'new-chat' ? 'New Message' : undefined}
                        actionIcon={activeView === 'thread' ? 'info' : undefined}
                        onAction={activeView === 'thread' ? () => setActiveView('channel-info') : undefined}
                    >
                        {activeView === 'thread' && <MessageThreadView item={selectedItem} isTranslated={isTranslated} />}
                        {activeView === 'ticket' && <TicketDetailView item={selectedItem} isTranslated={isTranslated} />}
                        {activeView === 'announcement' && <AnnouncementDetailView item={selectedItem} isTranslated={isTranslated} />}
                        {activeView === 'new-chat' && <NewChatView onStart={() => setActiveView('feed')} onCreateChannel={() => setActiveView('create-channel')} />}
                    </ScreenStackDetail>
                )}
            </AnimatePresence>

            {/* Language Sheet */}
            <AnimatePresence>
                {showLanguageSheet && (
                    <LanguageSheet
                        isOpen={showLanguageSheet}
                        onClose={() => setShowLanguageSheet(false)}
                        currentLanguage={currentLanguage}
                        onSelectLanguage={handleLanguageSelect}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default CommunicationHub;
