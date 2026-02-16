'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FeedItem } from '../types';

interface ChatThreadViewProps {
    item: FeedItem;
    onBack: () => void;
    onAction?: () => void;
    onCall?: () => void;
}

import { useChatStore } from '../../../lib/chat-store';
import { InlineTranslate } from '../TranslateButton';
import { useTranslations } from 'next-intl';

import { ChatComposer } from '../ChatComposer';
import { AttachmentSheet } from '../AttachmentSheet';
import { PermissionModal } from '../PermissionModal';
import { ReportModal } from '../ReportModal';

// Helper to check auto-translate preference
const getAutoTranslate = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('edapp_auto_translate') === 'true';
};

// ... (Existing constants PARENT_TEACHER_REPLIES etc. remain, but we can keep them or move if needed. 
// For this replacement, I will assume the imports are at the top and I'm replacing the component body mostly)

export function ChatThreadView({ item, onBack, onAction, onCall }: ChatThreadViewProps) {
    const messagesByThread = useChatStore(state => state.messagesByThread);
    const fetchMessages = useChatStore(state => state.fetchMessages);
    const sendMessage = useChatStore(state => state.sendMessage);
    const handleActionStore = useChatStore(state => state.handleAction);

    const currentUserId = 'user-1';
    const threadId = item.threadId || 'thread-1';
    const messages = messagesByThread[threadId] || [];

    // UI State for Modals
    const [showAttachments, setShowAttachments] = useState(false);
    const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean, type: 'camera' | 'microphone' } | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    // Chat State
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [translatedMessages, setTranslatedMessages] = useState<Set<string>>(new Set());
    const [autoTranslate, setAutoTranslate] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const t = useTranslations();

    // Load auto-translate preference
    useEffect(() => {
        setAutoTranslate(getAutoTranslate());
    }, []);

    // Close menu on click outside
    useEffect(() => {
        const handleClick = () => setActiveMessageId(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const toggleTranslation = (msgId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(translatedMessages);
        if (next.has(msgId)) next.delete(msgId);
        else next.add(msgId);
        setTranslatedMessages(next);
        setActiveMessageId(null);
    };

    useEffect(() => {
        if (threadId) {
            fetchMessages(threadId, currentUserId);
        }
    }, [threadId, fetchMessages]);

    // Simulate typing indicator
    useEffect(() => {
        const timer = setTimeout(() => setIsOtherTyping(true), 2000);
        const hideTimer = setTimeout(() => setIsOtherTyping(false), 5000);
        return () => { clearTimeout(timer); clearTimeout(hideTimer); };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;
        await sendMessage(threadId, text, currentUserId);
        setShowSuggestions(false);
    };

    const handleAction = async (msgId: string, action: 'approve' | 'reject' | 'acknowledge') => {
        const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'acknowledged';
        await handleActionStore(threadId, msgId, status, currentUserId);
    };

    // Permission Handling
    const checkPermission = (type: 'camera' | 'microphone', callback: () => void) => {
        // Mock permission check
        const hasPermission = localStorage.getItem(`permission_${type}`) === 'granted';
        if (hasPermission) {
            callback();
        } else {
            setPermissionModal({ isOpen: true, type });
        }
    };

    const onPermissionResult = (allowed: boolean) => {
        if (permissionModal && allowed) {
            localStorage.setItem(`permission_${permissionModal.type}`, 'granted');
            console.log(`${permissionModal.type} permission granted`);
        }
        setPermissionModal(null);
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
                    {onCall && (
                        <button onClick={onCall} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-secondary/50 rounded-full shrink-0">
                            <span className="material-symbols-outlined text-xl">call</span>
                        </button>
                    )}
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
                                            <button onClick={() => handleAction(msg.id, 'reject')} className="py-2 px-3 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors">Decline</button>
                                            <button onClick={() => handleAction(msg.id, 'approve')} className="py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm">Approve</button>
                                        </div>
                                    ) : (
                                        <div className={`py-2 px-3 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 ${msg.actionData.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                            <span className="material-symbols-outlined text-[16px]">{msg.actionData.status === 'approved' ? 'check_circle' : 'cancel'}</span>
                                            {msg.actionData.status === 'approved' ? 'Approved' : 'Declined'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm relative shadow-sm leading-relaxed group ${msg.isMe
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-card border border-border rounded-bl-sm text-foreground'
                                        }`}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveMessageId(msg.id);
                                    }}
                                >
                                    {msg.content}

                                    {/* Translation Render */}
                                    {(autoTranslate || translatedMessages.has(msg.id)) && !msg.isMe && (
                                        <div className="mt-1 pt-1 border-t border-black/10 dark:border-white/10">
                                            <InlineTranslate
                                                contentId={msg.id}
                                                text={msg.content}
                                                tenantId="default" // In real app, get from context
                                                targetLang={undefined} // Use user preference
                                            />
                                        </div>
                                    )}

                                    {/* Message Menu */}
                                    {activeMessageId === msg.id && (
                                        <div className="absolute top-full left-0 mt-2 z-50 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border overflow-hidden min-w-[160px] animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-1">
                                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted rounded-lg transition-colors text-left">
                                                    <span className="material-symbols-outlined text-[16px]">reply</span> Reply
                                                </button>
                                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted rounded-lg transition-colors text-left">
                                                    <span className="material-symbols-outlined text-[16px]">content_copy</span> Copy
                                                </button>
                                                <button
                                                    onClick={(e) => toggleTranslation(msg.id, e)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted rounded-lg transition-colors text-left text-primary"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">translate</span>
                                                    {translatedMessages.has(msg.id) ? 'Hide Translation' : 'Translate'}
                                                </button>
                                                <div className="h-px bg-border/50 my-1" />
                                                <button
                                                    onClick={() => { setActiveMessageId(null); setReportModalOpen(true); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted rounded-lg transition-colors text-left text-red-500"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">flag</span> Report
                                                </button>
                                            </div>
                                        </div>
                                    )}
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

                    {/* Typing Indicator */}
                    {isOtherTyping && (
                        <div className="flex items-start self-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border shadow-sm flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" style={{ animation: 'typing-bounce 1.4s infinite 0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" style={{ animation: 'typing-bounce 1.4s infinite 200ms' }} />
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" style={{ animation: 'typing-bounce 1.4s infinite 400ms' }} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Typing indicator keyframes */}
            <style>{`
                @keyframes typing-bounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }
            `}</style>


            {/* ====== COMPOSER (ChatComposer) ====== */}
            <ChatComposer
                onSend={handleSend}
                onAttach={() => setShowAttachments(true)}
                onVoice={() => checkPermission('microphone', () => console.log('Recording...'))}
            />

            {/* ====== MODALS & SHEETS ====== */}
            <AttachmentSheet
                isOpen={showAttachments}
                onClose={() => setShowAttachments(false)}
                onSelect={(type) => {
                    setShowAttachments(false);
                    if (type === 'camera') checkPermission('camera', () => console.log('Camera started'));
                    else if (type === 'voice') checkPermission('microphone', () => console.log('Voice note started'));
                    else console.log('Selected:', type);
                }}
            />

            <PermissionModal
                isOpen={!!permissionModal}
                type={permissionModal?.type || 'camera'}
                onAllow={() => onPermissionResult(true)}
                onDeny={() => onPermissionResult(false)}
            />

            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                onSubmit={(reason) => {
                    console.log('Reported:', reason);
                }}
            />
        </div>
    );
}
