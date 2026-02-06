'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Paperclip, Send, Smile, Image, Camera, Mic, X } from 'lucide-react';

// Mock messages for demo
const MOCK_MESSAGES = [
    {
        id: '1',
        content: 'Hi, I wanted to check in about Bart\'s progress this week.',
        isOwn: true,
        timestamp: '10:15 AM',
        status: 'read',
    },
    {
        id: '2',
        content: 'Thank you for reaching out! Bart has been doing much better in class. His math scores have improved significantly.',
        isOwn: false,
        timestamp: '10:20 AM',
    },
    {
        id: '3',
        content: 'That\'s wonderful to hear! We\'ve been working on practice problems at home.',
        isOwn: true,
        timestamp: '10:25 AM',
        status: 'read',
    },
    {
        id: '4',
        content: 'That definitely shows. Keep up the great work! I\'ll send his progress report by Friday.',
        isOwn: false,
        timestamp: '10:30 AM',
    },
];

const QUICK_TEMPLATES = [
    { id: 'absence', label: 'Report Absence', icon: 'event_busy' },
    { id: 'homework', label: 'Homework Query', icon: 'assignment' },
    { id: 'meeting', label: 'Schedule Meeting', icon: 'calendar_month' },
];

const ATTACH_OPTIONS = [
    { id: 'photo', label: 'Photo', icon: Image, color: 'bg-blue-500' },
    { id: 'camera', label: 'Camera', icon: Camera, color: 'bg-pink-500' },
    { id: 'document', label: 'Document', icon: Paperclip, color: 'bg-purple-500' },
];

export default function ThreadPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const [message, setMessage] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [showAttach, setShowAttach] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock thread data
    const thread = {
        name: 'Mrs. Smith',
        context: 'Class Teacher • Grade 5',
        avatar: 'MS',
        online: true,
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, []);

    const handleSend = () => {
        if (message.trim()) {
            console.log('Send:', message);
            setMessage('');
            setShowTemplates(false);
        }
    };

    const groupedMessages = MOCK_MESSAGES;

    return (
        <div className="flex flex-col h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)]">
            {/* Thread Header */}
            <header className="flex items-center gap-3 px-2 sm:px-4 py-3 border-b border-border bg-background sticky top-0 z-20">
                <Link
                    href={`/tenant/${tenantSlug}/parent/chat`}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors -ml-1"
                    aria-label="Go back"
                >
                    <ChevronLeft size={24} />
                </Link>

                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-semibold text-sm" style={{ color: '#fff' }}>
                        {thread.avatar}
                    </div>
                    {thread.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="font-semibold text-base truncate">{thread.name}</h1>
                    <p className="text-xs text-muted-foreground truncate">{thread.context}</p>
                </div>

                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                    <span className="material-symbols-outlined text-[22px] text-muted-foreground">more_vert</span>
                </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'rgba(var(--secondary-rgb, 0,0,0), 0.05)' }}>
                <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-1">
                    {/* Date separator */}
                    <div className="flex items-center justify-center py-2">
                        <span className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs text-muted-foreground shadow-sm">
                            Today
                        </span>
                    </div>

                    {groupedMessages.map((msg, idx) => {
                        const prevMsg = idx > 0 ? groupedMessages[idx - 1] : null;
                        const shouldGroup = prevMsg?.isOwn === msg.isOwn;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} ${shouldGroup ? 'mt-0.5' : 'mt-3'}`}
                            >
                                {msg.isOwn ? (
                                    /* Outgoing bubble - blue with WHITE text */
                                    <div
                                        className="relative max-w-[72%] px-3 py-2 rounded-2xl rounded-br-md shadow-sm"
                                        style={{
                                            backgroundColor: 'hsl(var(--primary))',
                                            color: '#FFFFFF',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        <p style={{ fontSize: '15px', wordBreak: 'break-word', color: '#FFFFFF' }}>{msg.content}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                            <span style={{ fontSize: '10px' }}>{msg.timestamp}</span>
                                            {msg.status && (
                                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                                                    {msg.status === 'read' ? 'done_all' : 'done'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Incoming bubble - light background with dark text */
                                    <div
                                        className="relative max-w-[72%] px-3 py-2 rounded-2xl rounded-bl-md bg-card text-foreground border border-border/50 shadow-sm"
                                        style={{ lineHeight: 1.4 }}
                                    >
                                        <p className="text-[15px] break-words">{msg.content}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1 text-muted-foreground">
                                            <span className="text-[10px]">{msg.timestamp}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Attach tray */}
            {showAttach && (
                <div className="border-t border-border bg-background px-4 py-3 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-center gap-6">
                        {ATTACH_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                className="flex flex-col items-center gap-1.5"
                                onClick={() => setShowAttach(false)}
                            >
                                <div className={`w-12 h-12 rounded-full ${opt.color} flex items-center justify-center`} style={{ color: '#fff' }}>
                                    <opt.icon size={22} />
                                </div>
                                <span className="text-xs text-muted-foreground">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Templates */}
            {showTemplates && (
                <div className="border-t border-border bg-background px-4 py-3 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {QUICK_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    setMessage(`[${template.label}] `);
                                    setShowTemplates(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-full text-sm font-medium shrink-0 hover:bg-secondary/80 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">{template.icon}</span>
                                {template.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Composer */}
            <div className="border-t border-border bg-background px-2 sm:px-4 py-2 sticky bottom-14 sm:bottom-16 z-10">
                <div className="flex items-end gap-2 max-w-3xl mx-auto">
                    <button
                        onClick={() => { setShowAttach(!showAttach); setShowTemplates(false); }}
                        className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-all ${showAttach ? 'bg-primary rotate-45' : 'hover:bg-secondary text-muted-foreground'
                            }`}
                        style={showAttach ? { color: '#fff' } : {}}
                    >
                        <Paperclip size={20} />
                    </button>

                    <div className="flex-1 flex items-end bg-secondary rounded-3xl px-4 py-2 min-h-[44px]">
                        <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 -ml-1">
                            <Smile size={22} />
                        </button>

                        <textarea
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type a message..."
                            rows={1}
                            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none resize-none py-1.5 max-h-[120px]"
                            style={{ lineHeight: 1.4 }}
                        />

                        <button
                            onClick={() => { setShowTemplates(!showTemplates); setShowAttach(false); }}
                            className={`w-8 h-8 flex items-center justify-center transition-colors shrink-0 -mr-1 ${showTemplates ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">bolt</span>
                        </button>
                    </div>

                    {message.trim() ? (
                        <button
                            onClick={handleSend}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary shrink-0 hover:bg-primary/90 transition-colors"
                            style={{ color: '#fff' }}
                        >
                            <Send size={18} />
                        </button>
                    ) : (
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary shrink-0 hover:bg-primary/90 transition-colors"
                            style={{ color: '#fff' }}
                        >
                            <Mic size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
