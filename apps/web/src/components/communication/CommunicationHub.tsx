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
// COMMUNICATION HUB — WHATSAPP-STYLE 3-PANE LAYOUT
// ============================================================
//
// Desktop (md+):
// ┌─────────────────┬──────────────────────────────┐
// │  LEFT PANEL     │  RIGHT PANEL                 │
// │  Thread list    │  Conversation / Detail        │
// │  (380px)        │  (flex-1)                    │
// │                 │                              │
// │  - Header       │  - Thread header             │
// │  - Tabs         │  - Messages                  │
// │  - Search       │  - Composer                  │
// │  - Thread rows  │                              │
// └─────────────────┴──────────────────────────────┘
//
// Mobile (<md):
// Single-pane stack — Feed OR Detail, state-controlled

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
        else if (item.type === 'support') setActiveView('thread');
        else if (item.type === 'announcement' || item.type === 'urgent') setActiveView('announcement');
        else if (item.type === 'action') setActiveView('action-center');
    };

    const handleBack = () => {
        setActiveView('feed');
    };

    const handleLanguageSelect = (langCode: string) => {
        setCurrentLanguage(langCode);
        setIsTranslated(langCode !== 'en');
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferred_language', langCode);
        }
        translateApi.savePreferences({ preferred_language: langCode }).catch(() => {});
    };

    // Derive tenant and user from URL path and localStorage
    const pathname = usePathname();
    const tenantSlug = useMemo(() => {
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

    const hasDetailView = activeView !== 'feed';

    return (
        <>
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

            {/* ===== WHATSAPP 3-PANE LAYOUT ===== */}
            <div className="flex h-[100dvh] md:h-full w-full overflow-hidden">

                {/* ─── LEFT PANEL: Thread List ─────────────────────
                    Mobile: full-width, shown only when activeView === 'feed'
                    Desktop: 380px sidebar, always visible */}
                <div className={`
                    ${activeView === 'feed' ? 'flex' : 'hidden'} md:flex
                    flex-col w-full md:w-[380px] md:min-w-[380px] md:max-w-[380px]
                    md:border-r md:border-border/50
                    h-full overflow-hidden bg-background
                `}>
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

                {/* ─── RIGHT PANEL: Detail / Conversation ─────────
                    Mobile: full-width, shown only when activeView !== 'feed'
                    Desktop: flex-1, always visible */}
                <div className={`
                    ${hasDetailView ? 'flex' : 'hidden'} md:flex
                    flex-col flex-1 min-w-0 h-full overflow-hidden
                `}>
                    {/* Empty state — desktop only, when no conversation selected */}
                    {!hasDetailView && (
                        <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 dark:bg-[#0B1120]">
                            <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-[56px] text-slate-300 dark:text-slate-600">forum</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">EdApp Messages</h2>
                            <p className="text-[15px] text-muted-foreground max-w-sm leading-relaxed">
                                Select a conversation to start messaging, or create a new one.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground/60">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                <span>End-to-end encrypted</span>
                            </div>
                        </div>
                    )}

                    {/* Thread view */}
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

                    {/* Channel info */}
                    {activeView === 'channel-info' && selectedItem && (
                        <ChannelInfoView item={selectedItem} onClose={() => setActiveView('thread')} />
                    )}

                    {/* New chat */}
                    {activeView === 'new-chat' && (
                        <NewChatView
                            onBack={handleBack}
                            onStartChat={(item) => {
                                setSelectedItem(item);
                                setActiveView(item.type === 'support' ? 'ticket' : 'thread');
                            }}
                            onCreateChannel={() => setActiveView('create-channel')}
                        />
                    )}

                    {/* Action center */}
                    {activeView === 'action-center' && (
                        <ActionRequiredView onClose={() => setActiveView('feed')} />
                    )}

                    {/* Create channel */}
                    {activeView === 'create-channel' && (
                        <CreateChannelView onClose={() => setActiveView('feed')} />
                    )}

                    {/* Ticket / Announcement */}
                    {(activeView === 'ticket' || activeView === 'announcement') && (
                        <ScreenStackDetail onBack={handleBack}>
                            {activeView === 'ticket' && <TicketDetailView item={selectedItem} isTranslated={isTranslated} onBack={handleBack} />}
                            {activeView === 'announcement' && <AnnouncementDetailView item={selectedItem} isTranslated={isTranslated} />}
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
        </>
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
