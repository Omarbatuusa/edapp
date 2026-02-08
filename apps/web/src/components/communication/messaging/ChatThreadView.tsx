import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FeedItem } from '../types';
import { MessagesLayout } from './MessagesLayout';

interface ChatThreadViewProps {
    item: FeedItem;
    onBack: () => void;
    onAction?: () => void;
}

interface Message {
    id: string;
    text?: string;
    contentType: 'text' | 'action_card';
    actionType?: 'approval' | 'acknowledgement';
    actionData?: {
        title: string;
        subtitle: string;
        status: 'pending' | 'approved' | 'rejected' | 'acknowledged';
    };
    isMe: boolean;
    time: string;
    status: 'sent' | 'delivered' | 'read';
    date: string;
}

export function ChatThreadView({ item, onBack, onAction }: ChatThreadViewProps) {
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            contentType: 'text',
            isMe: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            date: 'Today'
        };
        setMessages([...messages, newMsg]);
        setInputValue('');

        // Simulate reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: "Thanks for the message! I'll get back to you shortly.",
                contentType: 'text',
                isMe: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'read',
                date: 'Today'
            }]);
        }, 1500);
    };

    const handleAction = (msgId: string, action: 'approve' | 'reject' | 'acknowledge') => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === msgId && msg.actionData) {
                return {
                    ...msg,
                    actionData: {
                        ...msg.actionData,
                        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'acknowledged'
                    }
                };
            }
            return msg;
        }));
    };

    return (
        <MessagesLayout
            className="md:border-l md:border-border/50"
            header={
                <div className="flex items-center px-4 h-16 gap-3">
                    <button onClick={onBack} className="md:hidden -ml-2 p-2 rounded-full hover:bg-secondary/80">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    <div className="relative">
                        <img
                            src={item.avatar || `https://ui-avatars.com/api/?name=${item.title}&background=random`}
                            alt={item.title}
                            className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-base truncate">{item.title}</h2>
                        <p className="text-xs text-muted-foreground truncate">
                            {item.role} • {item.childName}
                        </p>
                    </div>

                    <button className="p-2 text-muted-foreground hover:bg-secondary/50 rounded-full">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                    <button onClick={onAction} className="p-2 text-primary hover:bg-primary/10 rounded-full">
                        <span className="material-symbols-outlined">info</span>
                    </button>
                </div>
            }
            footer={
                <div className="p-3 bg-background border-t border-border/50 flex items-end gap-2">
                    <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <div className="flex-1 bg-secondary/50 rounded-2xl flex items-center px-4 py-2 min-h-[44px]">
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Message..."
                            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground/50 resize-none"
                        />
                        <button className="text-muted-foreground hover:text-foreground">
                            <span className="material-symbols-outlined">sentiment_satisfied</span>
                        </button>
                    </div>
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
            }
        >
            <div className="p-4 space-y-6 pb-4">
                {/* Date Separator */}
                <div className="flex justify-center my-4 sticky top-2 z-10">
                    <span className="bg-secondary/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-muted-foreground shadow-sm">
                        Today
                    </span>
                </div>

                {messages.map((msg, idx) => (
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
                                className={`px-4 py-2 rounded-2xl text-sm relative shadow-sm ${msg.isMe
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-card border border-border rounded-bl-none text-foreground'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        )}

                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.isMe ? 'text-muted-foreground justify-end' : 'text-muted-foreground justify-start'}`}>
                            {msg.time}
                            {msg.isMe && (
                                <span className="material-symbols-outlined text-[12px]">
                                    {msg.status === 'read' ? 'done_all' : 'check'}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </MessagesLayout>
    );
}

const MOCK_MESSAGES: Message[] = [
    { id: '1', text: "Hello! How can I help you today?", contentType: 'text', isMe: false, time: '09:41', status: 'read', date: 'Today' },
    { id: '2', text: "I have a question about the upcoming field trip.", contentType: 'text', isMe: true, time: '09:42', status: 'read', date: 'Today' },
    {
        id: '3',
        contentType: 'action_card',
        actionType: 'approval',
        actionData: {
            title: 'Excursion Consent Form',
            subtitle: 'Please review and approve the permission slip for the Zoo Visit on Feb 20th.',
            status: 'pending'
        },
        isMe: false,
        time: '09:43',
        status: 'read',
        date: 'Today'
    },
];
