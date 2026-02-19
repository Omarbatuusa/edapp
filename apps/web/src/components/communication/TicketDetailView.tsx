'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DetailViewProps } from './types';
import { ChatComposer } from './ChatComposer';
import { AttachmentSheet } from './AttachmentSheet';
import { PermissionModal } from './PermissionModal';
import chatApi from '../../lib/chat-api';

// ============================================================
// HELPERS
// ============================================================

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() || '')
        .join('');
}

function formatDateDivider(dateStr: string): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (dateStr === today.toLocaleDateString()) return 'Today';
    if (dateStr === yesterday.toLocaleDateString()) return 'Yesterday';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

function categoryIcon(category?: string): string {
    const icons: Record<string, string> = {
        transport: 'directions_bus',
        fees: 'payments',
        admissions: 'school',
        it: 'computer',
        health: 'local_hospital',
        academics: 'menu_book',
        general: 'support_agent',
    };
    return icons[category || 'general'] || 'support_agent';
}

// ============================================================
// LOCAL MESSAGE TYPE
// ============================================================

interface TicketMessage {
    id: string;
    text: string;
    isMe: boolean;
    time: string;
    date: string;
    sender?: string;
    status: 'sending' | 'sent' | 'failed';
}

// ============================================================
// TICKET DETAIL VIEW — Professional school support ticket
// ============================================================

export function TicketDetailView({ item, onBack }: DetailViewProps) {
    const threadId = item?.threadId || item?.id || '';
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || '' : '';

    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAttachments, setShowAttachments] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean; type: 'camera' | 'microphone' | 'storage' } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Scroll helper
    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            const el = messagesContainerRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    }, []);

    // Fetch real messages
    useEffect(() => {
        if (!threadId) return;
        setIsLoading(true);
        chatApi.getMessages(threadId).then(msgs => {
            setMessages(msgs.map(m => ({
                id: m.id,
                text: m.content,
                isMe: m.sender_id === currentUserId,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(m.created_at).toLocaleDateString(),
                sender: m.sender_name,
                status: 'sent' as const,
            })));
        }).catch(() => {}).finally(() => setIsLoading(false));
    }, [threadId, currentUserId]);

    // Autoscroll on load and new messages
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            scrollToBottom();
        }
    }, [isLoading, messages.length, scrollToBottom]);

    const handleSend = useCallback(async (text: string) => {
        if (!text.trim()) return;
        const tempId = `temp-${Date.now()}`;
        const now = new Date();
        const tempMsg: TicketMessage = {
            id: tempId,
            text: text.trim(),
            isMe: true,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: now.toLocaleDateString(),
            status: 'sending',
        };
        setMessages(prev => [...prev, tempMsg]);
        scrollToBottom();

        try {
            const dto = await chatApi.sendMessage({ thread_id: threadId, content: text.trim() });
            setMessages(prev => prev.map(m =>
                m.id === tempId ? {
                    ...m,
                    id: dto.id,
                    status: 'sent' as const,
                    time: new Date(dto.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(dto.created_at).toLocaleDateString(),
                } : m
            ));
        } catch {
            setMessages(prev => prev.map(m =>
                m.id === tempId ? { ...m, status: 'failed' as const } : m
            ));
        }
    }, [threadId, scrollToBottom]);

    const handleFileUpload = useCallback(async (file: File, type?: 'image' | 'document') => {
        setIsUploading(true);
        try {
            const { url, objectKey } = await chatApi.uploadAttachment(file);
            // Send a message referencing the attachment
            const attType = type || (file.type.startsWith('image/') ? 'image' : 'document');
            await chatApi.sendMessage({
                thread_id: threadId,
                content: file.name,
                attachment_url: url,
                attachment_type: attType,
                attachment_key: objectKey,
            } as any);
            // Optimistic — add a local message
            const now = new Date();
            const attMsg: TicketMessage = {
                id: `att-${Date.now()}`,
                text: `📎 ${file.name}`,
                isMe: true,
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: now.toLocaleDateString(),
                status: 'sent',
            };
            setMessages(prev => [...prev, attMsg]);
            scrollToBottom();
        } catch { /* silent */ } finally {
            setIsUploading(false);
        }
    }, [threadId, scrollToBottom]);

    const checkPermission = (type: 'camera' | 'microphone' | 'storage', cb: () => void) => {
        const ok = typeof window !== 'undefined' && localStorage.getItem(`permission_${type}`) === 'granted';
        if (ok) cb(); else setPermissionModal({ isOpen: true, type });
    };

    const onPermissionResult = (allowed: boolean) => {
        if (permissionModal && allowed) localStorage.setItem(`permission_${permissionModal.type}`, 'granted');
        setPermissionModal(null);
    };

    if (!item) return null;

    // Derived display values
    const ticketRef = item.ticketId || `#${item.id.slice(0, 8).toUpperCase()}`;
    const statusLabel = item.status || 'Open';
    const statusColor = statusLabel === 'CLOSED' || statusLabel === 'closed'
        ? 'bg-slate-100 text-slate-600'
        : statusLabel === 'PENDING' || statusLabel === 'pending'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-green-100 text-green-700';
    const icon = categoryIcon(item.category);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f0f4f8] dark:bg-[#0b141a]">

            {/* ====== HEADER — Blue brand, matches ChatThreadView ====== */}
            <div className="shrink-0 bg-[#2563eb] text-white relative z-20">
                <div className="flex items-center px-1 h-14 gap-1">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 shrink-0"
                        >
                            <span className="material-symbols-outlined text-white text-[22px]">arrow_back</span>
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-[22px]">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0 ml-2">
                        <h2 className="font-semibold text-[16px] text-white truncate leading-tight">{item.title}</h2>
                        <p className="text-[12px] text-white/70 leading-tight">
                            Ticket {ticketRef}
                        </p>
                    </div>
                    {/* Status badge in header */}
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor} mr-1`}>
                        {statusLabel}
                    </span>
                </div>
            </div>

            {/* SLA strip — only shown if slaDue is set */}
            {item.slaDue && (
                <div className="shrink-0 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">timer</span>
                    <span className="text-[12px] text-amber-800 dark:text-amber-200 font-medium">SLA:</span>
                    <span className="text-[12px] text-amber-700 dark:text-amber-300/80">{item.slaDue}</span>
                </div>
            )}

            {/* Upload indicator */}
            {isUploading && (
                <div className="shrink-0 bg-[#2563eb]/10 px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#2563eb] animate-spin">progress_activity</span>
                    <span className="text-[12px] text-[#2563eb] font-medium">Uploading attachment...</span>
                </div>
            )}

            {/* ====== MESSAGES AREA ====== */}
            <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain relative"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%232563eb' fill-opacity='0.035'%3E%3Cpath d='M8 18 Q15 14 22 18 L22 34 Q15 30 8 34Z M22 18 Q29 14 36 18 L36 34 Q29 30 22 34Z M8 34 L8 36 L36 36 L36 34'/%3E%3Crect x='78' y='6' width='5' height='22' rx='1' transform='rotate(40 80 17)'/%3E%3Cpolygon points='80,28 77,35 83,35' transform='rotate(40 80 17)'/%3E%3Cellipse cx='22' cy='82' rx='14' ry='4'/%3E%3Cpolygon points='22,68 36,76 22,84 8,76'/%3E%3Crect x='34' y='76' width='2' height='8' rx='1'/%3E%3Ccircle cx='35' cy='85' r='2'/%3E%3Ccircle cx='90' cy='90' r='4'/%3E%3Cellipse cx='90' cy='90' rx='16' ry='6' fill='none' stroke='%232563eb' stroke-opacity='0.035' stroke-width='2'/%3E%3Cellipse cx='90' cy='90' rx='16' ry='6' fill='none' stroke='%232563eb' stroke-opacity='0.035' stroke-width='2' transform='rotate(60 90 90)'/%3E%3Cellipse cx='90' cy='90' rx='16' ry='6' fill='none' stroke='%232563eb' stroke-opacity='0.035' stroke-width='2' transform='rotate(120 90 90)'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundColor: '#f0f4f8',
                } as React.CSSProperties}
            >
                <div className="flex flex-col px-3 pt-4 pb-2 max-w-4xl mx-auto">

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <span className="material-symbols-outlined text-[24px] text-[#2563eb] animate-spin">progress_activity</span>
                        </div>
                    )}

                    {/* School monitored notice */}
                    {!isLoading && (
                        <div className="flex justify-center mb-3 mt-1">
                            <span className="bg-white/80 dark:bg-[#1e293b]/80 text-[#64748b] dark:text-[#94a3b8] text-[11px] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-[12px]">shield</span>
                                This ticket is managed by the school support team
                            </span>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && messages.length === 0 && (
                        <div className="flex flex-col items-center py-12 px-4">
                            <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-[32px] text-[#2563eb]">{icon}</span>
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#1e293b] dark:text-[#e2e8f0] mb-1">Ticket submitted</h3>
                            <p className="text-[13px] text-[#64748b] dark:text-[#94a3b8] text-center max-w-[260px]">
                                A member of the support team will respond shortly.
                            </p>
                        </div>
                    )}

                    {/* Messages with date dividers */}
                    {(() => {
                        let lastDate = '';
                        return messages.map((msg) => {
                            const showDivider = msg.date !== lastDate;
                            if (showDivider) lastDate = msg.date;
                            const initials = msg.sender ? getInitials(msg.sender) : 'ST';

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDivider && (
                                        <div className="flex justify-center my-3">
                                            <span className="bg-white/90 dark:bg-[#233138] text-[#54656f] dark:text-[#8696a0] text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm">
                                                {formatDateDivider(msg.date)}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} mt-2`}>
                                        {/* Received: show initials avatar */}
                                        {!msg.isMe && (
                                            <div className="w-8 h-8 rounded-full bg-[#2563eb]/15 flex items-center justify-center text-[11px] font-bold text-[#2563eb] shrink-0 mr-1.5 self-end mb-1">
                                                {initials}
                                            </div>
                                        )}

                                        <div className="flex flex-col max-w-[75%]">
                                            {/* Sender name above (received only) */}
                                            {!msg.isMe && msg.sender && (
                                                <span className="text-[11px] text-[#2563eb] font-semibold ml-1 mb-0.5">{msg.sender}</span>
                                            )}

                                            <div className={`px-3 py-2 rounded-xl text-[14px] leading-relaxed shadow-sm ${
                                                msg.isMe
                                                    ? 'bg-[#dbeafe] dark:bg-[#1e3a5f] text-[#0f172a] dark:text-[#e2e8f0] rounded-tr-none'
                                                    : 'bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#e2e8f0] rounded-tl-none border border-[#e2e8f0] dark:border-[#334155]'
                                            }`}>
                                                {msg.text}
                                            </div>

                                            {/* Time + status */}
                                            <div className={`flex items-center gap-1 mt-0.5 ${msg.isMe ? 'justify-end' : 'justify-start ml-1'}`}>
                                                <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">{msg.time}</span>
                                                {msg.isMe && (
                                                    <>
                                                        {msg.status === 'sending' && (
                                                            <span className="material-symbols-outlined text-[13px] text-[#94a3b8] animate-spin">progress_activity</span>
                                                        )}
                                                        {msg.status === 'sent' && (
                                                            <span className="material-symbols-outlined text-[13px] text-[#2563eb]">done_all</span>
                                                        )}
                                                        {msg.status === 'failed' && (
                                                            <span className="material-symbols-outlined text-[13px] text-red-500">error</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        });
                    })()}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ====== COMPOSER ====== */}
            <ChatComposer
                onSend={handleSend}
                onAttach={() => setShowAttachments(true)}
                placeholder="Reply to ticket..."
            />

            {/* ====== MODALS ====== */}
            <AttachmentSheet
                isOpen={showAttachments}
                onClose={() => setShowAttachments(false)}
                onFile={(file, type) => {
                    setShowAttachments(false);
                    handleFileUpload(file, type);
                }}
                onCamera={() => {
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
                }}
            />

            <PermissionModal
                isOpen={!!permissionModal}
                type={permissionModal?.type || 'camera'}
                onAllow={() => onPermissionResult(true)}
                onDeny={() => onPermissionResult(false)}
            />
        </div>
    );
}
