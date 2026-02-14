import React, { useState, useRef, useEffect } from 'react';
import { FeedItem } from '../types';

interface ChatThreadViewProps {
    item: FeedItem;
    onBack: () => void;
    onAction?: () => void;
}

import { useChatStore } from '../../../lib/chat-store';

// Suggested reply chips by context
const PARENT_TEACHER_REPLIES = [
    "My child will be absent today.",
    "I'd like to schedule a meeting.",
    "Please share today's homework.",
    "Can you clarify the project requirements?",
    "Request early pickup today.",
    "Thank you — acknowledged.",
    "Please send the worksheet/notes again.",
];

const PARENT_FEES_REPLIES = [
    "Please send a statement.",
    "I need to discuss a payment plan.",
    "I uploaded proof of payment.",
    "Can you confirm receipt?",
    "What is the balance due?",
];

const PARENT_TRANSPORT_REPLIES = [
    "Change pickup address.",
    "My child will not use transport today.",
    "Bus is late — please confirm ETA.",
];

function getSuggestedReplies(item: FeedItem): string[] {
    if (item.type === 'support') {
        const title = (item.title || '').toLowerCase();
        if (title.includes('fee') || title.includes('finance') || title.includes('payment')) return PARENT_FEES_REPLIES;
        if (title.includes('transport') || title.includes('bus') || title.includes('route')) return PARENT_TRANSPORT_REPLIES;
    }
    return PARENT_TEACHER_REPLIES;
}

export function ChatThreadView({ item, onBack, onAction }: ChatThreadViewProps) {
    const messagesByThread = useChatStore(state => state.messagesByThread);
    const fetchMessages = useChatStore(state => state.fetchMessages);
    const sendMessage = useChatStore(state => state.sendMessage);
    const handleActionStore = useChatStore(state => state.handleAction);

    const currentUserId = 'user-1';
    const threadId = item.threadId || 'thread-1';
    const messages = messagesByThread[threadId] || [];

    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const suggestedReplies = getSuggestedReplies(item);

    useEffect(() => {
        if (threadId) {
            fetchMessages(threadId, currentUserId);
        }
    }, [threadId, fetchMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        await sendMessage(threadId, inputValue, currentUserId);
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleAction = async (msgId: string, action: 'approve' | 'reject' | 'acknowledge') => {
        const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'acknowledged';
        await handleActionStore(threadId, msgId, status, currentUserId);
    };

    const handleSuggestedReply = (text: string) => {
        setInputValue(text);
        setShowSuggestions(false);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B1120]">
            {/* ====== HEADER ====== */}
            <div className="shrink-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center px-3 h-14 gap-3">
                    {/* Back chevron */}
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary/80 transition-colors shrink-0">
                        <span className="material-symbols-outlined text-foreground">chevron_left</span>
                    </button>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <img
                            src={(typeof item.source === 'object' ? item.source?.avatar : undefined) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'Chat')}&background=random`}
                            alt={item.title}
                            className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                    </div>

                    {/* Name + subtitle */}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-base truncate">{item.title}</h2>
                        <p className="text-xs text-muted-foreground truncate">
                            {(typeof item.source === 'object' ? (item.source?.role || item.source?.name) : item.source) || item.role || 'Unknown'} • {item.childName || 'General'}
                        </p>
                    </div>

                    {/* Actions */}
                    <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-secondary/50 rounded-full shrink-0">
                        <span className="material-symbols-outlined text-xl">search</span>
                    </button>
                    <button onClick={onAction} className="w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full shrink-0">
                        <span className="material-symbols-outlined text-xl">info</span>
                    </button>
                </div>
            </div>

            {/* ====== MESSAGE AREA (single scroll container) ====== */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' as any }}>
                <div className="p-4 space-y-4 pb-4">
                    {/* Date Separator */}
                    <div className="flex justify-center my-4">
                        <span className="bg-secondary/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-muted-foreground shadow-sm">
                            Today
                        </span>
                    </div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] ${msg.isMe ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                            {msg.contentType === 'action_card' && msg.actionData ? (
                                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm w-full max-w-sm mb-1">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                            <span className="material-symbols-outlined">
                                                {msg.actionType === 'approval' ? 'approval' : 'priority_high'}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm leading-tight">{msg.actionData.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{msg.actionData.subtitle}</p>
                                        </div>
                                    </div>

                                    {msg.actionData.status === 'pending' ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleAction(msg.id, 'reject')}
                                                className="py-2 px-3 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleAction(msg.id, 'approve')}
                                                className="py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`
                                            py-2 px-3 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2
                                            ${msg.actionData.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}
                                        `}>
                                            <span className="material-symbols-outlined text-[16px]">
                                                {msg.actionData.status === 'approved' ? 'check_circle' : 'cancel'}
                                            </span>
                                            {msg.actionData.status === 'approved' ? 'Approved' : 'Declined'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm relative shadow-sm leading-relaxed ${msg.isMe
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-card border border-border rounded-bl-sm text-foreground'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            )}

                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.isMe ? 'text-muted-foreground justify-end' : 'text-muted-foreground justify-start'}`}>
                                {msg.time}
                                {msg.isMe && (
                                    <span className={`material-symbols-outlined text-[14px] ${msg.status === 'read' ? 'text-blue-500' : 'text-muted-foreground/60'}`}>
                                        {msg.status === 'read' ? 'done_all' : msg.status === 'delivered' ? 'done_all' : 'check'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ====== SUGGESTED REPLIES ====== */}
            {showSuggestions && messages.length > 0 && (
                <div className="shrink-0 border-t border-border/30 bg-background/95 backdrop-blur-sm">
                    <div className="flex gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
                        {suggestedReplies.map((reply, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestedReply(reply)}
                                className="shrink-0 text-xs font-medium px-3.5 py-2 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 active:scale-95 transition-all whitespace-nowrap"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ====== COMPOSER (fixed at bottom) ====== */}
            <div className="shrink-0 p-3 bg-background border-t border-border/50 flex items-end gap-2 pb-safe">
                {/* Attachment */}
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                    <span className="material-symbols-outlined">add</span>
                </button>

                {/* Input area */}
                <div className="flex-1 bg-secondary/50 rounded-2xl flex items-center px-4 py-2 min-h-[44px] gap-2">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        onFocus={() => setShowSuggestions(false)}
                        placeholder="Message..."
                        className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground/50 resize-none"
                    />
                    <button className="text-muted-foreground hover:text-foreground shrink-0">
                        <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
                    </button>
                </div>

                {/* Send / Mic */}
                {inputValue ? (
                    <button onClick={handleSend} className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                ) : (
                    <button className="p-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">mic</span>
                    </button>
                )}
            </div>
        </div>
    );
}
