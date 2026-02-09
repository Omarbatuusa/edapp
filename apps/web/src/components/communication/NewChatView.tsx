'use client';

import React, { useState } from 'react';
import { MOCK_CHILDREN } from './mockData';
import { FeedItem } from './types';

interface NewChatViewProps {
    onStart: () => void;
    onStartChat: (item: FeedItem) => void;
    onCreateChannel: () => void;
}

export function NewChatView({ onStart, onStartChat, onCreateChannel }: NewChatViewProps) {
    const [selectedChildId, setSelectedChildId] = useState<string>(MOCK_CHILDREN[1]?.id || 'lisa');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const TOPICS = [
        { id: 'Academics', icon: 'school', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
        { id: 'Transport', icon: 'directions_bus', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' },
        { id: 'Fees', icon: 'payments', color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' },
        { id: 'Support', icon: 'support_agent', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' },
    ];

    const ACADEMIC_CONTACTS = [
        { id: 'mrs-k', name: 'Mrs. Krabappel', role: 'Class Teacher', avatar: 'https://ui-avatars.com/api/?name=Edna+Krabappel' },
        { id: 'mr-s', name: 'Mr. Skinner', role: 'Principal', avatar: 'https://ui-avatars.com/api/?name=Skinner' },
        { id: 'hoover', name: 'Ms. Hoover', role: 'Art Teacher', avatar: 'https://ui-avatars.com/api/?name=Hoover' },
    ];

    const SUPPORT_ACTIONS = [
        { id: 'ticket-bus', title: 'Report Bus Issue', subtitle: 'Late arrival, route change', icon: 'departure_board' },
        { id: 'ticket-absent', title: 'Report Absence', subtitle: 'Sick leave, doctors appt', icon: 'sick' },
        { id: 'ticket-fees', title: 'Finance Query', subtitle: 'Invoices, payment plans', icon: 'receipt_long' },
    ];

    const handleTopicSelect = (topicId: string) => {
        if (selectedTopic === topicId) {
            setSelectedTopic(null);
            setSelectedSubItem(null);
        } else {
            setSelectedTopic(topicId);
            setSelectedSubItem(null);
        }
    };

    // Handle starting the chat - create thread and navigate
    const handleDirectStart = async () => {
        if (!selectedTopic) return;

        setIsLoading(true);

        try {
            // Get selected child info
            const selectedChild = MOCK_CHILDREN.find(c => c.id === selectedChildId);

            // Build thread title based on selection
            let title = '';
            let subtitle = '';
            let threadType: 'message' | 'support' = 'message';

            if (selectedTopic === 'Academics' && selectedSubItem) {
                const contact = ACADEMIC_CONTACTS.find(c => c.id === selectedSubItem);
                title = contact?.name || 'Teacher';
                subtitle = contact?.role || 'Staff';
            } else if (selectedTopic === 'Transport') {
                title = 'Transport Support';
                subtitle = 'Bus Routes & Schedules';
                threadType = 'support';
            } else if (selectedTopic === 'Fees') {
                title = 'Finance Office';
                subtitle = 'Fees & Payments';
                threadType = 'support';
            } else if (selectedTopic === 'Support') {
                title = 'School Support';
                subtitle = 'General Assistance';
                threadType = 'support';
            }

            // Create a FeedItem for the new thread
            const newThreadItem: FeedItem = {
                id: `thread-${Date.now()}`,
                type: threadType,
                title,
                subtitle,
                time: 'Just now',
                preview: 'Start typing a message...',
                timestamp: new Date().toISOString(),
                urgency: 'normal',
                unread: false,
                requiresAck: false,
                ackStatus: null,
                source: {
                    name: title,
                    role: subtitle,
                    avatar: selectedSubItem
                        ? ACADEMIC_CONTACTS.find(c => c.id === selectedSubItem)?.avatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random`
                },
                threadId: `thread-${Date.now()}`,
                childName: selectedChild?.name,
            };

            // TODO: Call API to create/find thread
            // const result = await chatApi.createThread({...});
            // Use result.id as threadId

            // Navigate to the chat thread
            onStartChat(newThreadItem);

        } catch (error) {
            console.error('Error creating thread:', error);
            // Fallback to just going back
            onStart();
        } finally {
            setIsLoading(false);
        }
    };

    // Check if we can show the start button
    const canStart = selectedTopic && (selectedSubItem || ['Transport', 'Fees', 'Support'].includes(selectedTopic));

    return (
        <div className="flex flex-col h-full space-y-6 pb-24 overflow-y-auto">

            {/* Step 1: Child Context */}
            <div className="flex flex-col pt-4">
                <h3 className="text-sm font-bold text-muted-foreground px-4 uppercase tracking-wider mb-3">Regarding</h3>
                <div className="flex gap-3 px-4 overflow-x-auto pb-2 no-scrollbar mask-fade-right">
                    {MOCK_CHILDREN.filter(c => c.id !== 'all').map(child => {
                        const isActive = selectedChildId === child.id;
                        return (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(child.id)}
                                className={`
                                    group flex h-12 shrink-0 items-center justify-center gap-x-3 rounded-2xl pl-2 pr-5 transition-all active:scale-95
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'bg-secondary/50 border border-border hover:bg-secondary'
                                    }
                                `}
                            >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? 'bg-white/20' : 'bg-background'}`}>
                                    {child.avatar ? (
                                        <img src={child.avatar} className="w-full h-full rounded-full" alt="" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">face_3</span>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-bold leading-none ${isActive ? 'text-white' : ''}`}>{child.name}</p>
                                    <p className={`text-[10px] mt-0.5 ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>{child.grade}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Topic Grid */}
            <div className="flex flex-col px-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">I want to discuss</h3>
                <div className="grid grid-cols-2 gap-3">
                    {TOPICS.map(topic => {
                        const isActive = selectedTopic === topic.id;
                        return (
                            <button
                                key={topic.id}
                                onClick={() => handleTopicSelect(topic.id)}
                                className={`
                                    relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all
                                    ${isActive
                                        ? 'ring-2 ring-primary bg-primary/5'
                                        : 'bg-card border border-border hover:bg-secondary/50'
                                    }
                                `}
                            >
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${topic.color}`}>
                                    <span className="material-symbols-outlined text-[24px]">{topic.icon}</span>
                                </div>
                                <span className="font-bold text-sm">{topic.id}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 3: Conditional Sub-Items - Only show for Academics where teacher selection is required */}
            {selectedTopic === 'Academics' && (
                <div className="px-4 space-y-3">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Select Teacher</h3>
                    <div className="space-y-2">
                        {ACADEMIC_CONTACTS.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setSelectedSubItem(contact.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedSubItem === contact.id ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-secondary/50'}`}
                            >
                                <img src={contact.avatar} className="w-10 h-10 rounded-full" alt="" />
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-sm">{contact.name}</h4>
                                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                                </div>
                                {selectedSubItem === contact.id && (
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* For Transport, Fees, Support - Show quick action options but button appears immediately */}
            {(selectedTopic === 'Transport' || selectedTopic === 'Fees' || selectedTopic === 'Support') && (
                <div className="px-4 space-y-3">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quick Actions (Optional)</h3>
                    <div className="space-y-2">
                        {SUPPORT_ACTIONS.map(action => (
                            <button
                                key={action.id}
                                onClick={() => setSelectedSubItem(action.id)}
                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${selectedSubItem === action.id ? 'bg-primary/5 border-primary' : 'bg-card border-border hover:bg-secondary/50'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">{action.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{action.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{action.subtitle}</p>
                                </div>
                                <span className="material-symbols-outlined text-muted-foreground/50 text-[20px]">chevron_right</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Start Button - Sticky at bottom */}
            {canStart && (
                <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-6 z-50">
                    <button
                        onClick={handleDirectStart}
                        disabled={isLoading}
                        className="w-full bg-primary text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                <span>Starting...</span>
                            </>
                        ) : (
                            <>
                                <span>{selectedTopic === 'Academics' ? 'Start Chat' : 'Create Request'}</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
