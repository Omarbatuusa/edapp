'use client';

import React, { useState, useMemo, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { FeedItem } from './types';
import { FeedView } from './FeedView';
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
import { CallOverlay } from './CallOverlay';
import { useAudioCall } from '../../hooks/useAudioCall';
import translateApi from '../../lib/translate-api';

// ============================================================
// ERROR BOUNDARY COMPONENT
// ============================================================

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: ReactNode;
}

class CommunicationErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('CommunicationHub Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <span className="material-symbols-outlined text-5xl text-muted-foreground mb-4">error_outline</span>
                    <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground mb-4">Please try refreshing the page.</p>
                    {this.state.error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg max-w-lg text-left overflow-auto">
                            <p className="font-mono font-bold mb-1">{this.state.error.toString()}</p>
                            <p className="font-mono text-[10px] whitespace-pre-wrap">{this.state.error.stack}</p>
                        </div>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// ============================================================
// COMMUNICATION HUB COMPONENT (CONTROLLER)
// ============================================================

interface CommunicationHubProps {
    officeHours?: string;
}

function CommunicationHubInner({ officeHours = "Mon-Fri, 8 AM - 3 PM" }: CommunicationHubProps) {
    // Internal Navigation State
    const [activeView, setActiveView] = useState<'feed' | 'thread' | 'ticket' | 'announcement' | 'new-chat' | 'channel-info' | 'action-center' | 'create-channel'>('feed');
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);

    // Global Hub State (Lifted)
    const [selectedChildId, setSelectedChildId] = useState<string>('all');
    const [isTranslated, setIsTranslated] = useState(false);
    const [showLanguageSheet, setShowLanguageSheet] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('preferred_language') || 'en';
        }
        return 'en';
    });

    // Load language preference from backend on mount
    useEffect(() => {
        translateApi.getPreferences().then(prefs => {
            setCurrentLanguage(prefs.preferred_language);
            setIsTranslated(prefs.preferred_language !== 'en');
            if (typeof window !== 'undefined') {
                localStorage.setItem('preferred_language', prefs.preferred_language);
            }
        }).catch(() => {
            // Not logged in yet or no preferences — use localStorage cache
        });
    }, []);

    // Navigation Handlers
    const handleOpenItem = (item: FeedItem) => {
        setSelectedItem(item);
        if (item.type === 'message') setActiveView('thread');
        else if (item.type === 'support') setActiveView('thread'); // Support also goes to thread now
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
        // Don't clear selectedItem — keep cached to prevent white flash during transition
        // It gets replaced when user opens a new item via handleOpenItem
    };

    const handleLanguageSelect = (langCode: string) => {
        setCurrentLanguage(langCode);
        setIsTranslated(langCode !== 'en');
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferred_language', langCode);
        }
        // Persist to backend
        translateApi.savePreferences({ preferred_language: langCode }).catch(() => {});
    };

    // Derive tenant and user from URL path and localStorage
    const pathname = usePathname();
    const tenantSlug = useMemo(() => {
        // Extract tenant slug from /tenant/[slug]/... path
        const match = pathname?.match(/\/tenant\/([^\/]+)/);
        return match?.[1] || '';
    }, [pathname]);

    const currentUserId = typeof window !== 'undefined'
        ? localStorage.getItem('user_id') || ''
        : '';
    const tenantId = tenantSlug;

    // Audio calls
    const {
        state: callState,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        resetState: resetCallState,
        remoteAudioRef,
    } = useAudioCall({ tenant_id: tenantId, user_id: currentUserId });

    return (
        <MessagesLayout
            className="md:border-x md:border-border/50 md:shadow-sm md:max-w-4xl md:mx-auto"
        >
            <ChatSocketManager tenantId={tenantId} userId={currentUserId} />

            {/* Audio Call Overlay */}
            <CallOverlay
                state={callState}
                onAnswer={answerCall}
                onReject={rejectCall}
                onEnd={endCall}
                onToggleMute={toggleMute}
                onToggleSpeaker={toggleSpeaker}
                onReset={resetCallState}
                remoteAudioRef={remoteAudioRef}
            />

            {/* Main Content — only the active view renders */}
            <div className="relative w-full flex-1 flex flex-col min-h-0">
                {activeView === 'feed' && (
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
                )}

                {activeView === 'thread' && selectedItem && (
                    <ChatThreadView
                        item={selectedItem}
                        onBack={handleBack}
                        onAction={() => setActiveView('channel-info')}
                        onCall={selectedItem.type === 'message' ? () => {
                            startCall(selectedItem.threadId || selectedItem.id, selectedItem.title);
                        } : undefined}
                    />
                )}

                {activeView === 'channel-info' && selectedItem && (
                    <ChannelInfoView item={selectedItem} onClose={() => setActiveView('thread')} />
                )}

                {activeView === 'new-chat' && (
                    <NewChatView
                        onBack={handleBack}
                        onStartChat={(item) => {
                            setSelectedItem(item);
                            // 'support' type → TicketDetailView; 'message' → ChatThreadView
                            setActiveView(item.type === 'support' ? 'ticket' : 'thread');
                        }}
                        onCreateChannel={() => setActiveView('create-channel')}
                    />
                )}

                {activeView === 'action-center' && (
                    <ActionRequiredView onClose={() => setActiveView('feed')} />
                )}

                {activeView === 'create-channel' && (
                    <CreateChannelView onClose={() => setActiveView('feed')} />
                )}

                {(activeView === 'ticket' || activeView === 'announcement') && (
                    <ScreenStackDetail onBack={handleBack}>
                        {activeView === 'ticket' && <TicketDetailView item={selectedItem} isTranslated={isTranslated} />}
                        {activeView === 'announcement' && <AnnouncementDetailView item={selectedItem} isTranslated={isTranslated} />}
                    </ScreenStackDetail>
                )}
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

// Wrapper with Error Boundary
export function CommunicationHub(props: CommunicationHubProps) {
    return (
        <CommunicationErrorBoundary>
            <CommunicationHubInner {...props} />
        </CommunicationErrorBoundary>
    );
}

export default CommunicationHub;

