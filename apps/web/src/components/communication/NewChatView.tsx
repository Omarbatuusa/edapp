'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FeedItem } from './types';

interface SubOption {
    id: string;
    name: string;
    desc: string;
    icon: string;
}

interface NewChatViewProps {
    onBack: () => void;
    onStartChat: (item: FeedItem) => void;
    onCreateChannel: () => void;
}

export function NewChatView({ onBack, onStartChat, onCreateChannel }: NewChatViewProps) {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);

    const TOPICS = [
        { id: 'Academics', icon: 'school', label: 'Academics', desc: 'Teachers & Subjects' },
        { id: 'Transport', icon: 'directions_bus', label: 'Transport', desc: 'Routes & Schedules' },
        { id: 'Fees', icon: 'payments', label: 'Fees', desc: 'Payments & Invoices' },
        { id: 'Support', icon: 'support_agent', label: 'Support', desc: 'General Help' },
    ];

    const ACADEMIC_CONTACTS = [
        { id: 'mrs-k', name: 'Mrs. Krabappel', role: 'Class Teacher', avatar: 'https://ui-avatars.com/api/?name=Edna+Krabappel&background=3b82f6&color=fff' },
        { id: 'mr-s', name: 'Mr. Skinner', role: 'Principal', avatar: 'https://ui-avatars.com/api/?name=Skinner&background=2563eb&color=fff' },
        { id: 'hoover', name: 'Ms. Hoover', role: 'Art Teacher', avatar: 'https://ui-avatars.com/api/?name=Hoover&background=1d4ed8&color=fff' },
    ];

    const TRANSPORT_OPTIONS: SubOption[] = [
        { id: 'route-morning', name: 'Morning Route', desc: 'Pickup schedule & stops', icon: 'wb_sunny' },
        { id: 'route-afternoon', name: 'Afternoon Route', desc: 'Drop-off schedule & stops', icon: 'wb_twilight' },
        { id: 'route-change', name: 'Route Change Request', desc: 'Request pickup/drop-off changes', icon: 'edit_location_alt' },
        { id: 'transport-general', name: 'General Enquiry', desc: 'Other transport questions', icon: 'help_outline' },
    ];

    const FEES_OPTIONS: SubOption[] = [
        { id: 'fees-balance', name: 'Account Balance', desc: 'Outstanding fees & statements', icon: 'account_balance' },
        { id: 'fees-payment', name: 'Payment Query', desc: 'Payment issues & proof of payment', icon: 'receipt_long' },
        { id: 'fees-plan', name: 'Payment Plan', desc: 'Arrange instalment plan', icon: 'calendar_month' },
        { id: 'fees-general', name: 'General Enquiry', desc: 'Other fee-related questions', icon: 'help_outline' },
    ];

    const SUPPORT_OPTIONS: SubOption[] = [
        { id: 'support-admin', name: 'Administration', desc: 'Letters, forms & certificates', icon: 'description' },
        { id: 'support-it', name: 'IT Support', desc: 'Login, app & device issues', icon: 'computer' },
        { id: 'support-wellbeing', name: 'Wellbeing', desc: 'Pastoral care & counselling', icon: 'favorite' },
        { id: 'support-general', name: 'General Help', desc: 'Other questions', icon: 'help_outline' },
    ];

    const getSubOptions = (): SubOption[] | null => {
        if (selectedTopic === 'Transport') return TRANSPORT_OPTIONS;
        if (selectedTopic === 'Fees') return FEES_OPTIONS;
        if (selectedTopic === 'Support') return SUPPORT_OPTIONS;
        return null;
    };

    const handleTopicSelect = (topicId: string) => {
        if (selectedTopic === topicId) {
            setSelectedTopic(null);
            setSelectedSubItem(null);
        } else {
            setSelectedTopic(topicId);
            setSelectedSubItem(null);
        }
    };

    const canStart = selectedTopic && selectedSubItem;

    // Scroll summary card into view when it appears
    useEffect(() => {
        if (canStart && summaryRef.current) {
            setTimeout(() => {
                summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [canStart]);

    const getSummary = (): { title: string; subtitle: string } => {
        if (selectedTopic === 'Academics' && selectedSubItem) {
            const contact = ACADEMIC_CONTACTS.find(c => c.id === selectedSubItem);
            return { title: contact?.name || 'Teacher', subtitle: contact?.role || 'Staff' };
        }
        const subOptions = getSubOptions();
        if (subOptions && selectedSubItem) {
            const option = subOptions.find(o => o.id === selectedSubItem);
            const topicLabel = selectedTopic === 'Transport' ? 'Transport' : selectedTopic === 'Fees' ? 'Finance Office' : 'School Support';
            return { title: topicLabel, subtitle: option?.name || '' };
        }
        return { title: '', subtitle: '' };
    };

    const handleDirectStart = async () => {
        if (!canStart) return;
        setIsLoading(true);

        try {
            const { title, subtitle } = getSummary();
            const threadType: 'message' | 'support' = selectedTopic === 'Academics' ? 'message' : 'support';

            const threadId = `thread-${Date.now()}`;
            const newThreadItem: FeedItem = {
                id: threadId,
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
                    avatar: selectedTopic === 'Academics' && selectedSubItem
                        ? ACADEMIC_CONTACTS.find(c => c.id === selectedSubItem)?.avatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=2563eb&color=fff`,
                },
                threadId,
                category: selectedTopic || undefined,
            };

            onStartChat(newThreadItem);
        } catch (error) {
            console.error('Error creating thread:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const subOptions = getSubOptions();
    const summary = canStart ? getSummary() : null;

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a]">
            {/* Header — Blue brand */}
            <div className="shrink-0 bg-[#2563eb] text-white">
                <div className="flex items-center px-2 h-14 gap-2">
                    <button type="button" onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0">
                        <span className="material-symbols-outlined text-white text-[22px]">arrow_back</span>
                    </button>
                    <h1 className="font-semibold text-[17px] flex-1">New Message</h1>
                    <button type="button" onClick={onCreateChannel} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0" title="Create Group">
                        <span className="material-symbols-outlined text-white text-[22px]">group_add</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Topic Selection */}
                <div className="px-4 pt-5 pb-3">
                    <p className="text-[12px] font-semibold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-3">What would you like to discuss?</p>
                    <div className="grid grid-cols-2 gap-2.5">
                        {TOPICS.map(topic => {
                            const isActive = selectedTopic === topic.id;
                            return (
                                <button
                                    key={topic.id}
                                    type="button"
                                    onClick={() => handleTopicSelect(topic.id)}
                                    className={`relative flex flex-col items-center gap-1.5 rounded-xl p-4 transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/25'
                                            : 'bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] hover:border-[#2563eb]/40 hover:shadow-sm'
                                    }`}
                                >
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                                        isActive ? 'bg-white/20' : 'bg-[#eff6ff] dark:bg-[#1e3a5f]'
                                    }`}>
                                        <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-white' : 'text-[#2563eb]'}`}>{topic.icon}</span>
                                    </div>
                                    <span className="font-semibold text-[13px]">{topic.label}</span>
                                    <span className={`text-[11px] ${isActive ? 'text-white/70' : 'text-[#94a3b8]'}`}>{topic.desc}</span>
                                    {isActive && (
                                        <div className="absolute top-2 right-2">
                                            <span className="material-symbols-outlined text-white text-[18px]">check_circle</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Teacher Selection — Only for Academics */}
                {selectedTopic === 'Academics' && (
                    <div className="px-4 pb-3">
                        <p className="text-[12px] font-semibold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-3">Select Teacher</p>
                        <div className="space-y-2">
                            {ACADEMIC_CONTACTS.map(contact => {
                                const isSelected = selectedSubItem === contact.id;
                                return (
                                    <button
                                        key={contact.id}
                                        type="button"
                                        onClick={() => setSelectedSubItem(contact.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-[#eff6ff] dark:bg-[#1e3a5f] border-2 border-[#2563eb]'
                                                : 'bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] hover:border-[#2563eb]/40'
                                        }`}
                                    >
                                        <img src={contact.avatar} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                                        <div className="text-left flex-1 min-w-0">
                                            <h4 className={`font-semibold text-[14px] ${isSelected ? 'text-[#2563eb]' : 'text-[#0f172a] dark:text-[#f1f5f9]'}`}>{contact.name}</h4>
                                            <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">{contact.role}</p>
                                        </div>
                                        {isSelected ? (
                                            <span className="material-symbols-outlined text-[#2563eb] text-[22px] shrink-0">check_circle</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[#cbd5e1] dark:text-[#475569] text-[22px] shrink-0">radio_button_unchecked</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Sub-options for Transport / Fees / Support */}
                {subOptions && selectedTopic && (
                    <div className="px-4 pb-3">
                        <p className="text-[12px] font-semibold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-3">
                            {selectedTopic === 'Transport' ? 'Select Route Topic' : selectedTopic === 'Fees' ? 'Select Fee Topic' : 'Select Category'}
                        </p>
                        <div className="space-y-2">
                            {subOptions.map(option => {
                                const isSelected = selectedSubItem === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setSelectedSubItem(option.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-[#eff6ff] dark:bg-[#1e3a5f] border-2 border-[#2563eb]'
                                                : 'bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] hover:border-[#2563eb]/40'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-[#2563eb]/10' : 'bg-[#f1f5f9] dark:bg-[#334155]'
                                        }`}>
                                            <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-[#2563eb]' : 'text-[#64748b]'}`}>{option.icon}</span>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <h4 className={`font-semibold text-[14px] ${isSelected ? 'text-[#2563eb]' : 'text-[#0f172a] dark:text-[#f1f5f9]'}`}>{option.name}</h4>
                                            <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">{option.desc}</p>
                                        </div>
                                        {isSelected ? (
                                            <span className="material-symbols-outlined text-[#2563eb] text-[22px] shrink-0">check_circle</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[#cbd5e1] dark:text-[#475569] text-[22px] shrink-0">radio_button_unchecked</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Summary Card — shows when ready to start */}
                {canStart && summary && (
                    <div ref={summaryRef} className="px-4 pb-3">
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-4">
                            <p className="text-[12px] font-semibold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-2.5">Summary</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#eff6ff] dark:bg-[#1e3a5f] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[20px] text-[#2563eb]">
                                        {selectedTopic === 'Academics' ? 'school' : selectedTopic === 'Transport' ? 'directions_bus' : selectedTopic === 'Fees' ? 'payments' : 'support_agent'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[14px] text-[#0f172a] dark:text-[#f1f5f9]">{summary.title}</p>
                                    <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">{summary.subtitle}</p>
                                </div>
                                <span className="material-symbols-outlined text-[#22c55e] text-[22px] shrink-0">verified</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom spacer for sticky button */}
                <div className="h-24" />
            </div>

            {/* Sticky Bottom Button */}
            {canStart && (
                <div className="shrink-0 px-4 py-3 bg-[#f8fafc] dark:bg-[#0f172a] border-t border-[#e2e8f0] dark:border-[#1e293b]">
                    <button
                        type="button"
                        onClick={handleDirectStart}
                        disabled={isLoading}
                        className="w-full h-[50px] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-60"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                <span>Starting...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">chat</span>
                                <span>Continue to Chat</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
