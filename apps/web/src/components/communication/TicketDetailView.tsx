import React, { useState, useEffect } from 'react';
import { DetailViewProps } from './types';
import { ChatComposer } from './ChatComposer';
import { AttachmentSheet } from './AttachmentSheet';
import { PermissionModal } from './PermissionModal';
import chatApi from '../../lib/chat-api';

export function TicketDetailView({ item, isTranslated }: DetailViewProps) {
    const threadId = item?.threadId || item?.id || '';
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || '' : '';

    const [messages, setMessages] = useState<any[]>([]);
    const [ticketActions, setTicketActions] = useState<any[]>([]);
    const [showAttachments, setShowAttachments] = useState(false);
    const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean, type: 'camera' | 'microphone' } | null>(null);

    // Fetch real messages and ticket actions
    useEffect(() => {
        if (!threadId) return;
        chatApi.getMessages(threadId).then(msgs => {
            setMessages(msgs.map(m => ({
                id: m.id,
                text: m.content,
                isMe: m.sender_id === currentUserId,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: 'Today',
                sender: m.sender_name,
            })));
        }).catch(() => {});

        chatApi.getTicketActions(threadId).then(setTicketActions).catch(() => {});
    }, [threadId, currentUserId]);

    const handleSend = async (text: string) => {
        // Optimistic update
        const tempMsg = { id: Date.now(), text, isMe: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date: "Today" };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await chatApi.sendMessage({ thread_id: threadId, content: text });
        } catch {
            // Message will be sent via socket/retry
        }
    };

    const checkPermission = (type: 'camera' | 'microphone', callback: () => void) => {
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
        }
        setPermissionModal(null);
    };

    if (!item) return null;
    const title = item.title;

    return (
        <div className="flex flex-col h-full bg-secondary/30">
            {/* Ticket Header Info (Scrollable content) */}
            <div className="flex-1 overflow-y-auto">
                <div className="bg-card border-b border-border p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-mono text-muted-foreground">{item.ticketId}</span>
                            <h2 className="text-xl font-bold mt-1 leading-tight">{title}</h2>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                            item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                            }`}>{item.status}</span>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl flex gap-3 text-sm border border-amber-100 dark:border-amber-900/20">
                        <span className="material-symbols-outlined text-amber-600">timer</span>
                        <div>
                            <span className="font-bold text-amber-800 dark:text-amber-200">SLA Target</span>
                            <p className="text-amber-700 dark:text-amber-300/80">{item.slaDue || 'Response expected within 24h'}</p>
                        </div>
                    </div>
                </div>

                {/* Chat Timeline */}
                <div className="p-4 space-y-6 pb-4">
                    <div className="flex justify-center sticky top-0 z-10">
                        <span className="bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground shadow-sm">
                            Today
                        </span>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-end gap-2 max-w-[85%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!msg.isMe && (
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                        Fin
                                    </div>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.isMe
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                    : 'bg-card text-foreground border border-border rounded-tl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                            <span className={`text-[10px] text-muted-foreground px-9 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                                {msg.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Composer */}
            <ChatComposer
                onSend={handleSend}
                onAttach={() => setShowAttachments(true)}
                placeholder="Reply to ticket..."
            />

            {/* Attachment Sheet */}
            <AttachmentSheet
                isOpen={showAttachments}
                onClose={() => setShowAttachments(false)}
                onSelect={(type) => {
                    setShowAttachments(false);
                    if (type === 'camera') checkPermission('camera', () => console.log('Camera started'));
                }}
            />

            {/* Permission Modal */}
            <PermissionModal
                isOpen={!!permissionModal}
                type={permissionModal?.type || 'camera'}
                onAllow={() => onPermissionResult(true)}
                onDeny={() => onPermissionResult(false)}
            />
        </div>
    );
}
