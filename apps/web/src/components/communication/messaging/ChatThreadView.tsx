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

import { ChatComposer } from '../ChatComposer';
import { AttachmentSheet } from '../AttachmentSheet';
import { PermissionModal } from '../PermissionModal';
import { ReportModal } from '../ReportModal';

const QUICK_SUGGESTIONS = [
    { icon: 'menu_book', label: 'Ask about homework' },
    { icon: 'event', label: 'Request a meeting' },
    { icon: 'sick', label: 'Report absence' },
    { icon: 'grade', label: 'Ask about grades' },
    { icon: 'upload_file', label: 'Send documents' },
    { icon: 'help', label: 'General enquiry' },
];

export function ChatThreadView({ item, onBack, onAction, onCall }: ChatThreadViewProps) {
    const messagesByThread = useChatStore(state => state.messagesByThread);
    const fetchMessages = useChatStore(state => state.fetchMessages);
    const sendMessage = useChatStore(state => state.sendMessage);
    const handleActionStore = useChatStore(state => state.handleAction);

    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'user-1' : 'user-1';
    const threadId = item.threadId || 'thread-1';
    const messages = messagesByThread[threadId] || [];

    // UI State
    const [showAttachments, setShowAttachments] = useState(false);
    const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean; type: 'camera' | 'microphone' } | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [translatedMessages, setTranslatedMessages] = useState<Set<string>>(new Set());

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = () => setActiveMessageId(null);
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, []);

    useEffect(() => {
        if (threadId) fetchMessages(threadId, currentUserId);
    }, [threadId, fetchMessages, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;
        await sendMessage(threadId, text, currentUserId);
    };

    const handleAction = async (msgId: string, action: 'approve' | 'reject' | 'acknowledge') => {
        const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'acknowledged';
        await handleActionStore(threadId, msgId, status, currentUserId);
    };

    const toggleTranslation = (msgId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(translatedMessages);
        if (next.has(msgId)) next.delete(msgId); else next.add(msgId);
        setTranslatedMessages(next);
        setActiveMessageId(null);
    };

    const checkPermission = (type: 'camera' | 'microphone', cb: () => void) => {
        const ok = typeof window !== 'undefined' && localStorage.getItem(`permission_${type}`) === 'granted';
        if (ok) cb(); else setPermissionModal({ isOpen: true, type });
    };

    const onPermissionResult = (allowed: boolean) => {
        if (permissionModal && allowed) localStorage.setItem(`permission_${permissionModal.type}`, 'granted');
        setPermissionModal(null);
    };

    const avatarUrl = (typeof item.source === 'object' ? item.source?.avatar : undefined)
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'U')}&background=2563eb&color=fff&size=80`;

    const hasMessages = messages.length > 0;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f0f4f8] dark:bg-[#0b141a]">
            {/* ====== HEADER — Blue brand ====== */}
            <div className="shrink-0 bg-[#2563eb] text-white">
                <div className="flex items-center px-1 h-14 gap-1">
                    <button type="button" onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 shrink-0">
                        <span className="material-symbols-outlined text-white text-[22px]">arrow_back</span>
                    </button>

                    <img src={avatarUrl} alt={item.title} className="w-10 h-10 rounded-full object-cover shrink-0" />

                    <div className="flex-1 min-w-0 ml-2 cursor-pointer" onClick={onAction}>
                        <h2 className="font-semibold text-[16px] text-white truncate leading-tight">{item.title}</h2>
                        <p className="text-[12px] text-white/70 truncate leading-tight">
                            {(typeof item.source === 'object' ? (item.source?.role || item.source?.name) : item.source) || item.role || 'Online'}
                        </p>
                    </div>

                    {onCall && (
                        <button type="button" onClick={onCall} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/15 shrink-0">
                            <span className="material-symbols-outlined text-white text-[22px]">call</span>
                        </button>
                    )}
                    <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/15 shrink-0">
                        <span className="material-symbols-outlined text-white text-[22px]">more_vert</span>
                    </button>
                </div>
            </div>

            {/* ====== MESSAGES AREA — Educational wallpaper ====== */}
            <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundColor: '#f0f4f8',
                }}
            >
                <div className="flex flex-col px-3 py-2 gap-[2px] max-w-4xl mx-auto">
                    {/* Date pill */}
                    <div className="flex justify-center my-3">
                        <span className="bg-white/90 dark:bg-[#233138] text-[#54656f] dark:text-[#8696a0] text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm">
                            Today
                        </span>
                    </div>

                    {/* Empty state with suggestions */}
                    {!hasMessages && (
                        <div className="flex flex-col items-center py-8 px-4">
                            <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-[32px] text-[#2563eb]">school</span>
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#1e293b] dark:text-[#e2e8f0] mb-1">Start a conversation</h3>
                            <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] text-center mb-6 max-w-[260px]">
                                Send a message to {item.title} or choose a quick action below
                            </p>

                            <div className="flex flex-wrap justify-center gap-2 max-w-[340px]">
                                {QUICK_SUGGESTIONS.map((s) => (
                                    <button
                                        key={s.label}
                                        type="button"
                                        onClick={() => handleSend(s.label)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] text-[12px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#eff6ff] hover:border-[#2563eb]/30 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[16px] text-[#2563eb]">{s.icon}</span>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isMe = msg.isMe;

                        // Action card
                        if (msg.contentType === 'action_card' && msg.actionData) {
                            return (
                                <div key={msg.id} className="flex justify-center my-2">
                                    <div className="bg-white dark:bg-[#1f2c34] rounded-xl p-4 shadow-sm w-full max-w-[320px]">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[#2563eb] shrink-0">
                                                <span className="material-symbols-outlined text-[20px]">{msg.actionType === 'approval' ? 'approval' : 'priority_high'}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-[13px] leading-tight">{msg.actionData.title}</h4>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{msg.actionData.subtitle}</p>
                                            </div>
                                        </div>
                                        {msg.actionData.status === 'pending' ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button type="button" onClick={() => handleAction(msg.id, 'reject')} className="py-2 rounded-lg border border-border text-[12px] font-bold hover:bg-secondary transition-colors">Decline</button>
                                                <button type="button" onClick={() => handleAction(msg.id, 'approve')} className="py-2 rounded-lg bg-[#2563eb] text-white text-[12px] font-bold hover:bg-[#1d4ed8] transition-colors">Approve</button>
                                            </div>
                                        ) : (
                                            <div className={`py-2 rounded-lg text-[12px] font-bold text-center flex items-center justify-center gap-1.5 ${msg.actionData.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                <span className="material-symbols-outlined text-[14px]">{msg.actionData.status === 'approved' ? 'check_circle' : 'cancel'}</span>
                                                {msg.actionData.status === 'approved' ? 'Approved' : 'Declined'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Regular message bubble
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`relative max-w-[80%] px-2.5 pt-1.5 pb-[5px] rounded-lg shadow-sm text-[14.2px] leading-[19px] my-[1px] ${
                                        isMe
                                            ? 'bg-[#dbeafe] dark:bg-[#1e3a5f] text-[#0f172a] dark:text-[#e2e8f0] rounded-tr-none'
                                            : 'bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#e2e8f0] rounded-tl-none'
                                    }`}
                                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMessageId(msg.id); }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {!isMe && msg.senderName && (
                                        <p className="text-[12.5px] font-semibold text-[#2563eb] mb-0.5">{msg.senderName}</p>
                                    )}

                                    <span className="whitespace-pre-wrap break-words">{msg.content}</span>

                                    {translatedMessages.has(msg.id) && !isMe && (
                                        <div className="mt-1 pt-1 border-t border-black/10 dark:border-white/10">
                                            <InlineTranslate contentId={msg.id} text={msg.content} tenantId="default" targetLang={undefined} />
                                        </div>
                                    )}

                                    {/* Time + ticks */}
                                    <span className="float-right ml-2 -mb-[3px] flex items-center gap-0.5 text-[11px] text-[#64748b] dark:text-[#94a3b8] leading-none select-none">
                                        {msg.time}
                                        {isMe && (
                                            <span className={`material-symbols-outlined text-[16px] ${msg.status === 'read' ? 'text-[#2563eb]' : ''}`}>
                                                {msg.status === 'read' || msg.status === 'delivered' ? 'done_all' : 'check'}
                                            </span>
                                        )}
                                    </span>

                                    {/* Context menu */}
                                    {activeMessageId === msg.id && (
                                        <div className={`absolute ${isMe ? 'right-0' : 'left-0'} top-full mt-1 z-50 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl overflow-hidden min-w-[150px]`}>
                                            <div className="py-1">
                                                <button type="button" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                                    <span className="material-symbols-outlined text-[18px]">reply</span> Reply
                                                </button>
                                                <button type="button" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                                    <span className="material-symbols-outlined text-[18px]">forward</span> Forward
                                                </button>
                                                <button type="button" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                                    <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy
                                                </button>
                                                {!isMe && (
                                                    <button type="button" onClick={(e) => toggleTranslation(msg.id, e)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left text-[#2563eb]">
                                                        <span className="material-symbols-outlined text-[18px]">translate</span>
                                                        {translatedMessages.has(msg.id) ? 'Hide' : 'Translate'}
                                                    </button>
                                                )}
                                                {isMe && (
                                                    <button type="button" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left text-red-500">
                                                        <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                                                    </button>
                                                )}
                                                {!isMe && (
                                                    <button type="button" onClick={() => { setActiveMessageId(null); setReportModalOpen(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left text-red-500">
                                                        <span className="material-symbols-outlined text-[18px]">flag</span> Report
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ====== COMPOSER ====== */}
            <ChatComposer
                onSend={handleSend}
                onAttach={() => setShowAttachments(true)}
                onVoice={() => checkPermission('microphone', () => console.log('Recording...'))}
            />

            {/* ====== MODALS ====== */}
            <AttachmentSheet
                isOpen={showAttachments}
                onClose={() => setShowAttachments(false)}
                onSelect={(type) => {
                    setShowAttachments(false);
                    if (type === 'camera') checkPermission('camera', () => console.log('Camera'));
                    else if (type === 'voice') checkPermission('microphone', () => console.log('Voice'));
                    else if (type === 'gallery' || type === 'document') {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = type === 'gallery' ? 'image/*,video/*' : '*/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) console.log('Selected file:', file.name, file.size);
                        };
                        input.click();
                    }
                }}
            />

            <PermissionModal isOpen={!!permissionModal} type={permissionModal?.type || 'camera'} onAllow={() => onPermissionResult(true)} onDeny={() => onPermissionResult(false)} />
            <ReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} onSubmit={(reason) => console.log('Reported:', reason)} />
        </div>
    );
}
