import React, { useState } from 'react';
import { FeedItem, DetailViewProps } from './types';
import { ChatComposer } from './ChatComposer';
import { AttachmentSheet } from './AttachmentSheet';
import { PermissionModal } from './PermissionModal';
import { ReportModal } from './ReportModal';

export function MessageThreadView({ item, isTranslated }: DetailViewProps) {
    const [messages, setMessages] = useState([
        { id: 1, text: "Good morning! Just a reminder about the field trip tomorrow. Please ensure all forms are submitted by noon.", sender: "Mrs. Johnson", time: "10:02 AM", isMe: false, avatar: item?.senderAvatar },
        { id: 2, text: "Thanks for the reminder. I just signed it digitally. Let me know if you need anything else!", sender: "Me", time: "10:05 AM", isMe: true },
        { id: 3, text: "Great, received! Please ensure prompts are ready.", sender: "Mrs. Johnson", time: "10:07 AM", isMe: false, avatar: item?.senderAvatar },
    ]);
    const [showAttachments, setShowAttachments] = useState(false);
    const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean, type: 'camera' | 'microphone' } | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    const handleSend = (text: string) => {
        setMessages([...messages, {
            id: Date.now(),
            text,
            sender: "Me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        }]);
    };

    const handleAttach = () => setShowAttachments(true);

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
            // In a real app, we would then trigger the action
            console.log(`${permissionModal.type} permission granted`);
        }
        setPermissionModal(null);
    };

    const SUGGESTIONS = [
        { icon: 'hand_gesture', text: "I'm on my way" },
        { icon: 'check', text: "Ok, thanks!" },
        { icon: 'help', text: "Can you clarify?" },
    ];

    if (!item) return null;

    // We handle translation in the parent or pass a translated title, but here we check isTranslated prop if passed down
    // The original code had specific translation logic using a global dictionary. 
    // Ideally this should be passed as a prop, but for now we'll rely on the parent or simplicity.
    const TRANSLATIONS: Record<string, string> = {
        'Mrs. Anderson': 'Mofumahadi Anderson',
    };
    const title = isTranslated && item.title ? (TRANSLATIONS[item.title] || item.title) : item.title;

    return (
        <div className="flex flex-col h-full bg-secondary/30">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Safety Notice */}
                <div className="flex justify-center w-full">
                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm border border-amber-100 dark:border-amber-800/50">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Messages are monitored for school safety.
                    </div>
                </div>

                {/* Date Separator */}
                <div className="flex justify-center sticky top-0 z-10">
                    <span className="bg-secondary/80 backdrop-blur-sm text-muted-foreground text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-border/50">
                        Today
                    </span>
                </div>

                {/* Messages */}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 group relative ${msg.isMe ? 'justify-end' : ''}`}>
                        {!msg.isMe && (
                            <button
                                onClick={() => setReportModalOpen(true)}
                                className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-red-500"
                                title="Report Message"
                            >
                                <span className="material-symbols-outlined text-[18px]">flag</span>
                            </button>
                        )}
                        {!msg.isMe && (
                            <img src={msg.avatar || item.senderAvatar} alt="" className="w-8 h-8 rounded-full bg-cover bg-center shrink-0 mb-1" />
                        )}
                        <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%] ${msg.isMe ? 'items-end' : ''}`}>
                            {!msg.isMe && <span className="text-xs text-muted-foreground ml-1">{msg.sender}</span>}
                            <div className={`
                                p-3 rounded-2xl shadow-sm relative text-[15px] leading-relaxed
                                ${msg.isMe
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-card text-card-foreground rounded-bl-sm border border-border/50'
                                }
                            `}>
                                <p>{msg.text}</p>
                                <div className={`flex justify-end items-center gap-1 mt-1 ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    <span className="text-[10px]">{msg.time}</span>
                                    {msg.isMe && <span className="material-symbols-outlined text-[14px]">done_all</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Suggested Replies (Bolt Style) */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(s.text)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95"
                        >
                            {s.icon === 'hand_gesture' ? '👋' : <span className="material-symbols-outlined text-[16px]">{s.icon}</span>}
                            {s.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Composer */}
            <ChatComposer
                onSend={handleSend}
                onAttach={handleAttach}
                onVoice={() => checkPermission('microphone', () => console.log('Recording...'))}
            />

            {/* Attachment Sheet */}
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

            {/* Permission Modal */}
            <PermissionModal
                isOpen={!!permissionModal}
                type={permissionModal?.type || 'camera'}
                onAllow={() => onPermissionResult(true)}
                onDeny={() => onPermissionResult(false)}
            />

            {/* Report Modal */}
            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                onSubmit={(reason) => {
                    console.log('Reported:', reason);
                    // Mock submission
                }}
            />
        </div>
    );
}
