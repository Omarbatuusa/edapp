import React, { useState } from 'react';
import { MOCK_CHILDREN } from './mockData';

export function NewChatView({ onStart, onCreateChannel }: { onStart: () => void; onCreateChannel: () => void }) {
    const [selectedChildId, setSelectedChildId] = useState<string>(MOCK_CHILDREN[1]?.id || 'lisa');
    const [selectedTopic, setSelectedTopic] = useState<string>('Academics');

    const TOPICS = [
        { id: 'Academics', icon: 'school' },
        { id: 'Fees', icon: 'payments' },
        { id: 'Transport', icon: 'directions_bus' },
        { id: 'IT Support', icon: 'dns' },
        { id: 'Health', icon: 'favorite' },
        { id: 'Other', icon: 'more_horiz' },
    ];

    const RECOMMENDATIONS: Record<string, { type: 'message' | 'post', title: string, subtitle: string, icon: string, color: string }> = {
        'Academics': {
            type: 'message',
            title: 'Message Teacher',
            subtitle: 'Direct message Mrs. Krabappel regarding homework, grades, or classroom behavior.',
            icon: 'person_outline',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
        },
        'Fees': {
            type: 'message',
            title: 'Contact Finance',
            subtitle: 'Inquire about outstanding balances or payment plans.',
            icon: 'receipt_long',
            color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
        },
        'Transport': {
            type: 'post',
            title: 'Bus Route Query',
            subtitle: 'Post a query to the transport department.',
            icon: 'directions_bus',
            color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
        },
    };

    const rec = RECOMMENDATIONS[selectedTopic] || RECOMMENDATIONS['Academics'];

    return (
        <div className="flex flex-col h-full animate-fade-in space-y-8">
            <div className="flex items-center px-4 h-14 border-b border-border/50 shrink-0 gap-3">
                <button
                    onClick={onStart}
                    className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                >
                    <span className="material-symbols-outlined text-foreground">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold flex-1">New Message</h1>

                {/* Staff/Admin Feature: Create Channel */}
                <button
                    onClick={onCreateChannel}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full"
                    title="Create Channel"
                >
                    <span className="material-symbols-outlined">group_add</span>
                </button>
            </div>

            {/* Step 1: Child Selector */}
            <div className="flex flex-col pt-2">
                <h3 className="tracking-light text-xl font-bold leading-tight px-1 text-left pb-3">Who is this regarding?</h3>
                <div className="flex gap-3 px-1 overflow-x-auto pb-2 no-scrollbar mask-fade-right">
                    {MOCK_CHILDREN.filter(c => c.id !== 'all').map(child => {
                        const isActive = selectedChildId === child.id;
                        return (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(child.id)}
                                className={`
                                    group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full pl-2 pr-4 transition-all active:scale-95
                                    ${isActive
                                        ? 'bg-primary shadow-md shadow-primary/25'
                                        : 'bg-card border border-border hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                                `}
                            >
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'}`}>
                                    <span className="material-symbols-outlined text-[18px]">face_3</span>
                                </div>
                                <p className={`text-sm font-semibold leading-normal ${isActive ? 'text-white' : 'text-foreground'}`}>{child.name}</p>
                                {isActive && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Topic Selection */}
            <div className="flex flex-col">
                <h3 className="tracking-light text-xl font-bold leading-tight px-1 text-left pb-3">What do you need help with?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-1">
                    {TOPICS.map(topic => {
                        const isActive = selectedTopic === topic.id;
                        return (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic.id)}
                                className={`
                                    relative flex flex-col items-start gap-3 rounded-xl p-4 transition-all shadow-sm
                                    ${isActive
                                        ? 'border-2 border-primary bg-primary/5'
                                        : 'border border-border bg-card hover:border-primary/50 hover:shadow-md active:scale-[0.98]'
                                    }
                                `}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    <span className="material-symbols-outlined">{topic.icon}</span>
                                </div>
                                <h2 className="text-foreground text-base font-bold leading-tight">{topic.id}</h2>
                                {isActive && (
                                    <div className="absolute top-3 right-3 text-primary">
                                        <span className="material-symbols-outlined text-[20px] fill-1">check_circle</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 3: Destination Suggestion */}
            <div className="flex flex-col pb-32">
                <h3 className="tracking-light text-xl font-bold leading-tight px-1 text-left pb-3">Recommended Action</h3>
                <div className="flex flex-col gap-3 px-1">
                    {/* Primary Recommendation */}
                    <div className="relative overflow-visible rounded-xl border-2 border-primary bg-card p-4 shadow-sm transition-all">
                        <div className="absolute right-0 -top-3 rounded-bl-xl rounded-tl-xl rounded-tr-xl bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm z-10">Suggested</div>
                        <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${rec.color}`}>
                                <span className="material-symbols-outlined text-[24px]">{rec.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-foreground">{rec.title}</h4>
                                <p className="mt-1 text-sm text-muted-foreground leading-normal">{rec.subtitle}</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span> Usually replies in 2h
                                    </span>
                                </div>
                            </div>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                                <div className="h-3 w-3 rounded-full bg-primary"></div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Option (Static Mock) */}
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all active:bg-secondary/50 opacity-60 grayscale-[0.5]">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                <span className="material-symbols-outlined text-[24px]">forum</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-foreground">Post to Class Channel</h4>
                                <p className="mt-1 text-sm text-muted-foreground leading-normal">Ask a general question visible to all parents.</p>
                            </div>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Utility */}
            <div className="px-1 mt-6">
                <button className="flex items-center gap-2 text-primary font-medium text-sm hover:underline">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Use a template for absent note
                </button>
            </div>

            {/* Floating Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-md border-t border-border p-4 pb-8 z-40 transition-colors md:absolute md:rounded-b-2xl">
                <button
                    onClick={onStart}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-4 text-center font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                    Start Conversation
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-[14px] text-muted-foreground">security</span>
                    <p className="text-xs font-medium text-muted-foreground">Chats are monitored for school safety</p>
                </div>
            </div>
        </div>
    );
}
