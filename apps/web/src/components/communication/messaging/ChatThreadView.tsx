'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { FeedItem } from '../types';

interface ChatThreadViewProps {
    item: FeedItem;
    onBack: () => void;
    onAction?: () => void;
    onCall?: () => void;
}

import { useChatStore, Message } from '../../../lib/chat-store';
import chatApi from '../../../lib/chat-api';
import { InlineTranslate } from '../TranslateButton';

import { ChatComposer } from '../ChatComposer';
import { AttachmentSheet } from '../AttachmentSheet';
import { PermissionModal } from '../PermissionModal';
import { ReportModal } from '../ReportModal';

const EMPTY_TYPING: any[] = [];
const EMPTY_MESSAGES: Message[] = [];

// Clustering: same sender within same minute → tight spacing
function shouldCluster(prev: Message | undefined, curr: Message): boolean {
    if (!prev) return false;
    if (prev.senderId !== curr.senderId) return false;
    return prev.time === curr.time;
}

// Dynamic date divider label
function formatDateDivider(dateStr: string): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayStr = today.toLocaleDateString();
    const yesterdayStr = yesterday.toLocaleDateString();
    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    // Parse and format nicely
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

// ============================================================
// CHAT THREAD VIEW
// ============================================================

export function ChatThreadView({ item, onBack, onAction, onCall }: ChatThreadViewProps) {
    const messagesByThread = useChatStore(state => state.messagesByThread);
    const fetchMessages = useChatStore(state => state.fetchMessages);
    const sendMessage = useChatStore(state => state.sendMessage);
    const sendMessageWithAttachment = useChatStore(state => state.sendMessageWithAttachment);
    const deleteMessageStore = useChatStore(state => state.deleteMessage);
    const handleActionStore = useChatStore(state => state.handleAction);

    const pathname = usePathname();
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'user-1' : 'user-1';
    const threadId = item.threadId || item.id;
    const messages = messagesByThread[threadId] ?? EMPTY_MESSAGES;

    // Derive role from URL: /tenant/[slug]/[role]/chat
    const userRole = pathname?.match(/\/tenant\/[^/]+\/([^/]+)/)?.[1] || 'parent';

    // UI State
    const [showAttachments, setShowAttachments] = useState(false);
    const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean; type: 'camera' | 'microphone' } | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportMessageId, setReportMessageId] = useState<string | null>(null);
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [translatedMessages, setTranslatedMessages] = useState<Set<string>>(new Set());
    const [replyToMsg, setReplyToMsg] = useState<Message | null>(null);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [copiedToast, setCopiedToast] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const typingUsers = useChatStore(state => state.typing[item.threadId || item.id] ?? EMPTY_TYPING);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);
    const [showNewMsgButton, setShowNewMsgButton] = useState(false);
    const prevMessageCountRef = useRef(0);
    const preferredLang = typeof window !== 'undefined' ? localStorage.getItem('preferred_language') || 'en' : 'en';

    useEffect(() => {
        const handler = () => { setActiveMessageId(null); setShowHeaderMenu(false); };
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, []);

    useEffect(() => {
        if (threadId) fetchMessages(threadId, currentUserId);
    }, [threadId, fetchMessages, currentUserId]);

    // Scroll to bottom on initial load
    const initialScrollDone = useRef(false);
    useEffect(() => {
        if (messages.length > 0 && !initialScrollDone.current) {
            initialScrollDone.current = true;
            // Use rAF to ensure DOM is painted before scrolling
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            });
            prevMessageCountRef.current = messages.length;
        }
    }, [messages]);

    // Smart autoscroll on NEW messages (after initial load)
    useEffect(() => {
        if (!initialScrollDone.current) return;
        if (messages.length === 0) return;
        const isNewMessage = messages.length > prevMessageCountRef.current;
        prevMessageCountRef.current = messages.length;
        if (!isNewMessage) return;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.isMe || isNearBottomRef.current) {
            // Delay scroll to after React renders the new bubble
            requestAnimationFrame(() => {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
            });
            setShowNewMsgButton(false);
        } else {
            setShowNewMsgButton(true);
        }
    }, [messages]);

    const handleMessagesScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        isNearBottomRef.current = (el.scrollHeight - el.scrollTop - el.clientHeight) < 120;
        if (isNearBottomRef.current) setShowNewMsgButton(false);
    };

    // ============================================
    // HANDLERS
    // ============================================

    const handleSend = useCallback(async (text: string) => {
        if (!text.trim()) return;
        if (replyToMsg) {
            const tempId = Date.now().toString();
            const optimisticMsg: Message = {
                id: tempId, threadId, contentType: 'text', content: text.trim(),
                senderId: currentUserId, isMe: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: 'Today', status: 'sending',
            };
            useChatStore.setState(state => ({
                messagesByThread: {
                    ...state.messagesByThread,
                    [threadId]: [...(state.messagesByThread[threadId] || []), optimisticMsg],
                },
            }));
            setReplyToMsg(null);
            try {
                await chatApi.sendMessage({ thread_id: threadId, content: text.trim(), reply_to_id: replyToMsg.id });
            } catch { /* optimistic stays */ }
        } else {
            await sendMessage(threadId, text, currentUserId);
        }
        // Force near-bottom so autoscroll picks up our own message
        isNearBottomRef.current = true;
    }, [replyToMsg, threadId, currentUserId, sendMessage]);

    const handleAction = async (msgId: string, action: 'approve' | 'reject' | 'acknowledge') => {
        const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'acknowledged';
        await handleActionStore(threadId, msgId, status, currentUserId);
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).catch(() => {});
        setActiveMessageId(null);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 1500);
    };

    const handleDelete = (msgId: string) => {
        setActiveMessageId(null);
        deleteMessageStore(threadId, msgId);
    };

    const handleReply = (msg: Message) => {
        setActiveMessageId(null);
        setReplyToMsg(msg);
    };

    const handleReport = (msgId: string) => {
        setActiveMessageId(null);
        setReportMessageId(msgId);
        setReportModalOpen(true);
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

    const handleFileUpload = async (file: File, type?: 'image' | 'document') => {
        setIsUploading(true);
        try {
            await sendMessageWithAttachment(threadId, file, currentUserId, type);
            isNearBottomRef.current = true;
        } finally {
            setIsUploading(false);
        }
    };

    const handleRetrySend = useCallback(async (msg: Message) => {
        // Remove the queued message, then re-send
        deleteMessageStore(threadId, msg.id);
        await sendMessage(threadId, msg.content, currentUserId);
        isNearBottomRef.current = true;
    }, [threadId, currentUserId, sendMessage, deleteMessageStore]);

    const handleMuteThread = async () => {
        setShowHeaderMenu(false);
        try { await chatApi.muteThread(threadId, true); } catch { /* silent */ }
    };

    // ============================================
    // DERIVED STATE
    // ============================================

    const avatarUrl = (typeof item.source === 'object' ? item.source?.avatar : undefined)
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'U')}&background=2563eb&color=fff&size=80`;

    const filteredMessages = searchQuery
        ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
        : messages;
    const hasMessages = messages.length > 0;

    // Suggestion chips — only ONE location (above composer), not duplicated
    const suggestionChips = userRole === 'parent' ? [
        { label: 'Report absence', template: "I would like to report my child's absence today." },
        { label: 'Late arrival', template: 'My child will be arriving late today.' },
        { label: 'Request meeting', template: "I would like to request a meeting to discuss my child's progress." },
        { label: 'Homework query', template: 'I have a question about the homework assigned.' },
        { label: 'Upload payment', template: 'Please find attached proof of payment.' },
        { label: 'Payment plan', template: 'I would like to discuss a payment arrangement.' },
        { label: 'Transport change', template: "I need to request a change to my child's transport arrangement." },
    ] : userRole === 'teacher' ? [
        { label: 'Homework update', template: 'Homework update' },
        { label: 'Schedule meeting', template: 'Schedule parent meeting' },
        { label: 'Progress report', template: 'Share progress report' },
        { label: 'Class update', template: 'Send class update' },
    ] : [
        { label: 'Send announcement', template: 'Send announcement' },
        { label: 'Request info', template: 'Request information' },
        { label: 'Schedule meeting', template: 'Schedule meeting' },
        { label: 'Share update', template: 'Share update' },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f0f4f8] dark:bg-[#0b141a]">
            {/* ====== HEADER — Blue brand ====== */}
            <div className="shrink-0 bg-[#2563eb] text-white relative z-20">
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
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(!showHeaderMenu); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/15 shrink-0"
                    >
                        <span className="material-symbols-outlined text-white text-[22px]">more_vert</span>
                    </button>
                </div>

                {/* 3-dot header dropdown menu */}
                {showHeaderMenu && (
                    <div
                        className="absolute right-2 top-14 z-50 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl overflow-hidden min-w-[180px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="py-1">
                            <button type="button" onClick={() => { setShowHeaderMenu(false); setSearchOpen(true); setSearchQuery(''); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#0f172a] dark:text-[#e2e8f0] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                <span className="material-symbols-outlined text-[18px] text-[#64748b]">search</span> Search in chat
                            </button>
                            <button type="button" onClick={() => { setShowHeaderMenu(false); if (onAction) onAction(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#0f172a] dark:text-[#e2e8f0] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                <span className="material-symbols-outlined text-[18px] text-[#64748b]">image</span> Media & docs
                            </button>
                            <button type="button" onClick={handleMuteThread}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#0f172a] dark:text-[#e2e8f0] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                <span className="material-symbols-outlined text-[18px] text-[#64748b]">notifications_off</span> Mute notifications
                            </button>
                            <button type="button" onClick={() => { setShowHeaderMenu(false); if (onAction) onAction(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#0f172a] dark:text-[#e2e8f0] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                <span className="material-symbols-outlined text-[18px] text-[#64748b]">info</span> Contact info
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Search bar */}
            {searchOpen && (
                <div className="shrink-0 bg-white dark:bg-[#1e293b] border-b border-[#e2e8f0] dark:border-[#334155] px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#94a3b8]">search</span>
                    <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="flex-1 bg-transparent text-[14px] text-[#0f172a] dark:text-[#f1f5f9] placeholder:text-[#94a3b8] border-none outline-none"
                    />
                    {searchQuery && (
                        <span className="text-[12px] text-[#64748b]">
                            {messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase())).length} found
                        </span>
                    )}
                    <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#334155]">
                        <span className="material-symbols-outlined text-[18px] text-[#94a3b8]">close</span>
                    </button>
                </div>
            )}

            {/* Upload indicator */}
            {isUploading && (
                <div className="shrink-0 bg-[#2563eb]/10 px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#2563eb] animate-spin">progress_activity</span>
                    <span className="text-[12px] text-[#2563eb] font-medium">Uploading attachment...</span>
                </div>
            )}

            {/* Copied toast */}
            {copiedToast && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white text-[12px] font-medium px-4 py-2 rounded-lg shadow-lg">
                    Copied to clipboard
                </div>
            )}

            {/* ====== MESSAGES AREA — Educational wallpaper ====== */}
            <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain relative"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundColor: '#f0f4f8',
                }}
            >
                <div className="flex flex-col px-3 pt-6 pb-2 max-w-4xl mx-auto">
                    {/* Loading spinner at top */}
                    {useChatStore.getState().isLoadingMessages && (
                        <div className="flex justify-center py-4">
                            <span className="material-symbols-outlined text-[20px] text-[#2563eb] animate-spin">progress_activity</span>
                        </div>
                    )}

                    {/* Empty state — clean, no duplicate suggestions */}
                    {!hasMessages && (
                        <div className="flex flex-col items-center py-12 px-4">
                            <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-[32px] text-[#2563eb]">school</span>
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#1e293b] dark:text-[#e2e8f0] mb-1">Start a conversation</h3>
                            <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] text-center max-w-[260px]">
                                Send a message to {item.title} or use a suggestion below
                            </p>
                        </div>
                    )}

                    {(() => {
                        let lastDate = '';
                        return filteredMessages.map((msg, idx) => {
                        const isMe = msg.isMe;
                        const hasImage = msg.attachments?.some(a => a.type === 'image');
                        const hasDoc = msg.attachments?.some(a => a.type === 'document');
                        const hasVoice = msg.contentType === 'voice' || msg.attachments?.some(a => a.type === 'voice');

                        // Clustering
                        const prevMsg = idx > 0 ? filteredMessages[idx - 1] : undefined;
                        const clustered = shouldCluster(prevMsg, msg);

                        // Date divider
                        const showDateDivider = msg.date !== lastDate;
                        if (showDateDivider) lastDate = msg.date;

                        return (
                            <React.Fragment key={msg.id}>
                                {/* Dynamic date divider */}
                                {showDateDivider && (
                                    <div className="flex justify-center my-3">
                                        <span className="bg-white/90 dark:bg-[#233138] text-[#54656f] dark:text-[#8696a0] text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm">
                                            {formatDateDivider(msg.date)}
                                        </span>
                                    </div>
                                )}

                                {/* Action card */}
                                {msg.contentType === 'action_card' && msg.actionData ? (
                                    <div className="flex justify-center my-2">
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
                                ) : (
                                    /* Regular message bubble */
                                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${clustered ? 'mt-[1px]' : 'mt-3'}`}>
                                        <div
                                            className={`relative max-w-[75%] rounded-lg shadow-sm ${
                                                isMe
                                                    ? `bg-[#dbeafe] dark:bg-[#1e3a5f] text-[#0f172a] dark:text-[#e2e8f0] ${clustered ? '' : 'rounded-tr-none'}`
                                                    : `bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#e2e8f0] ${clustered ? '' : 'rounded-tl-none'}`
                                            } ${hasImage ? 'p-1 overflow-hidden' : 'px-2.5 pt-1.5 pb-[5px]'}`}
                                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMessageId(msg.id); }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {!isMe && msg.senderName && !clustered && (
                                                <p className={`text-[12.5px] font-semibold text-[#2563eb] mb-0.5 ${hasImage ? 'px-1.5 pt-0.5' : ''}`}>{msg.senderName}</p>
                                            )}

                                            {/* Voice/audio → unsupported */}
                                            {hasVoice && (
                                                <div className="flex items-center gap-2 py-1 px-1 text-[#64748b]">
                                                    <span className="material-symbols-outlined text-[18px]">mic_off</span>
                                                    <span className="text-[12px] italic">Audio message not supported</span>
                                                </div>
                                            )}

                                            {/* Image attachment */}
                                            {!hasVoice && hasImage && msg.attachments?.filter(a => a.type === 'image').map((att, i) => (
                                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                                    <img src={att.url} alt={att.name || 'Image'} className="max-w-[260px] w-full rounded-md" loading="lazy" />
                                                </a>
                                            ))}

                                            {/* Document attachment */}
                                            {!hasVoice && hasDoc && msg.attachments?.filter(a => a.type === 'document').map((att, i) => (
                                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2.5 p-2 rounded-lg bg-[#f1f5f9] dark:bg-[#334155] hover:bg-[#e2e8f0] dark:hover:bg-[#475569] transition-colors mb-1">
                                                    <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-[20px] text-[#2563eb]">description</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] font-medium truncate">{att.name || 'Document'}</p>
                                                        <p className="text-[10px] text-[#64748b]">Tap to open</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[18px] text-[#94a3b8]">download</span>
                                                </a>
                                            ))}

                                            {/* Text content */}
                                            {!hasVoice && msg.content && (
                                                <span className={`whitespace-pre-wrap break-words text-[14.2px] leading-[19px] ${hasImage ? 'block px-1.5 pt-1' : ''}`}>{msg.content}</span>
                                            )}

                                            {translatedMessages.has(msg.id) && !isMe && msg.content && (
                                                <div className="mt-1 pt-1 border-t border-black/10 dark:border-white/10">
                                                    <InlineTranslate contentId={msg.id} text={msg.content} tenantId="default" targetLang={preferredLang} />
                                                </div>
                                            )}

                                            {/* Time + ticks */}
                                            <span className={`float-right ml-2 -mb-[3px] flex items-center gap-0.5 text-[11px] text-[#64748b] dark:text-[#94a3b8] leading-none select-none ${hasImage ? 'pr-1 pb-0.5' : ''}`}>
                                                {msg.status === 'sending' && <span className="material-symbols-outlined text-[14px] animate-spin text-[#94a3b8]">progress_activity</span>}
                                                {msg.status === 'queued' && <span className="material-symbols-outlined text-[14px] text-amber-500">schedule</span>}
                                                {msg.time}
                                                {isMe && msg.status !== 'sending' && msg.status !== 'queued' && (
                                                    <span className={`material-symbols-outlined text-[16px] ${msg.status === 'read' ? 'text-[#2563eb]' : ''}`}>
                                                        {msg.status === 'read' || msg.status === 'delivered' ? 'done_all' : 'check'}
                                                    </span>
                                                )}
                                            </span>

                                            {/* Context menu */}
                                            {activeMessageId === msg.id && (
                                                <div className={`absolute ${isMe ? 'right-0' : 'left-0'} top-full mt-1 z-50 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl overflow-hidden min-w-[150px]`}>
                                                    <div className="py-1">
                                                        <button type="button" onClick={() => handleReply(msg)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                                            <span className="material-symbols-outlined text-[18px]">reply</span> Reply
                                                        </button>
                                                        <button type="button" onClick={() => handleCopy(msg.content)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left">
                                                            <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy
                                                        </button>
                                                        {!isMe && (
                                                            <button type="button" onClick={(e) => toggleTranslation(msg.id, e)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left text-[#2563eb]">
                                                                <span className="material-symbols-outlined text-[18px]">translate</span>
                                                                {translatedMessages.has(msg.id) ? 'Hide' : 'Translate'}
                                                            </button>
                                                        )}
                                                        {isMe && (
                                                            <button type="button" onClick={() => handleDelete(msg.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left text-red-500">
                                                                <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                                                            </button>
                                                        )}
                                                        {!isMe && (
                                                            <button type="button" onClick={() => handleReport(msg.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-left text-red-500">
                                                                <span className="material-symbols-outlined text-[18px]">flag</span> Report
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Failed message retry */}
                                        {msg.status === 'queued' && isMe && (
                                            <button type="button" onClick={() => handleRetrySend(msg)} className="flex items-center gap-1 mt-1 ml-1 text-red-500 text-[11px] self-end">
                                                <span className="material-symbols-outlined text-[14px]">error</span>
                                                Tap to retry
                                            </button>
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    });
                    })()}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-[#1e293b] rounded-lg rounded-tl-none shadow-sm px-3 py-2 max-w-[200px]">
                                <p className="text-[11px] text-[#2563eb] font-medium mb-1">
                                    {typingUsers.map((t: any) => t.display_name || 'Someone').join(', ')}
                                </p>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#94a3b8] animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-[#94a3b8] animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-[#94a3b8] animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* "New messages" floating button */}
                {showNewMsgButton && (
                    <button
                        type="button"
                        onClick={() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); setShowNewMsgButton(false); }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#1e293b] rounded-full shadow-lg border border-[#e2e8f0] dark:border-[#334155] text-[12px] font-medium text-[#2563eb] hover:bg-[#eff6ff] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                        New messages
                    </button>
                )}
            </div>

            {/* ====== REPLY PREVIEW BAR ====== */}
            {replyToMsg && (
                <div className="shrink-0 bg-white dark:bg-[#1e293b] border-t border-[#e2e8f0] dark:border-[#334155] px-3 py-2 flex items-center gap-2">
                    <div className="w-1 h-10 bg-[#2563eb] rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#2563eb]">{replyToMsg.isMe ? 'You' : (replyToMsg.senderName || item.title)}</p>
                        <p className="text-[12px] text-[#64748b] truncate">{replyToMsg.content}</p>
                    </div>
                    <button type="button" onClick={() => setReplyToMsg(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#334155] shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-[#94a3b8]">close</span>
                    </button>
                </div>
            )}

            {/* ====== SUGGESTION CHIPS (single location — above composer, for new threads) ====== */}
            {messages.length < 3 && (
                <div className="shrink-0 bg-[#f8fafc] dark:bg-[#0f172a] border-t border-[#e2e8f0] dark:border-[#1e293b] px-2 py-1.5">
                    <div className="flex gap-1.5 overflow-x-auto max-w-4xl mx-auto scrollbar-none">
                        {suggestionChips.map((chip) => (
                            <button
                                key={chip.label}
                                type="button"
                                onClick={() => handleSend(chip.template)}
                                className="shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] text-[12px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#eff6ff] hover:border-[#2563eb]/30 transition-colors whitespace-nowrap"
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ====== COMPOSER (no audio) ====== */}
            <ChatComposer
                onSend={handleSend}
                onAttach={() => setShowAttachments(true)}
            />

            {/* ====== MODALS ====== */}
            <AttachmentSheet
                isOpen={showAttachments}
                onClose={() => setShowAttachments(false)}
                onSelect={(type) => {
                    setShowAttachments(false);
                    if (type === 'camera') {
                        checkPermission('camera', () => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.capture = 'environment';
                            input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleFileUpload(file, 'image');
                            };
                            input.click();
                        });
                    } else if (type === 'gallery' || type === 'document') {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = type === 'gallery' ? 'image/*,video/*' : '*/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, type === 'gallery' ? 'image' : 'document');
                        };
                        input.click();
                    }
                }}
            />

            <PermissionModal isOpen={!!permissionModal} type={permissionModal?.type || 'camera'} onAllow={() => onPermissionResult(true)} onDeny={() => onPermissionResult(false)} />
            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => { setReportModalOpen(false); setReportMessageId(null); }}
                onSubmit={async (reason) => {
                    if (reportMessageId) {
                        try { await chatApi.reportMessage(reportMessageId, reason); } catch { /* silent */ }
                    }
                    setReportModalOpen(false);
                    setReportMessageId(null);
                }}
            />
        </div>
    );
}
