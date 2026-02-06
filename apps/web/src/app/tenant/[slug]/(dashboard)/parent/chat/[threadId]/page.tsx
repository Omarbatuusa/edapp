'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Paperclip, Send } from 'lucide-react';
import { SubPageWrapper } from '@/components/parent/SubPageHeader';

// Mock messages for demo
const MOCK_MESSAGES = [
    {
        id: '1',
        content: 'Hi, I wanted to check in about Bart\'s progress this week.',
        isOwn: true,
        timestamp: '10:15 AM',
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

export default function ThreadPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const threadId = params.threadId as string;
    const [message, setMessage] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);

    // Mock thread data
    const thread = {
        name: 'Mrs. Smith',
        context: 'Class Teacher • Grade 5',
        avatar: 'MS',
    };

    const handleSend = () => {
        if (message.trim()) {
            console.log('Send:', message);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] pb-16">
            {/* Thread Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-background sticky top-0 z-10">
                <Link
                    href={`/tenant/${tenantSlug}/parent/chat`}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft size={22} />
                </Link>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm">{thread.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="font-semibold text-base">{thread.name}</h1>
                    <p className="text-xs text-muted-foreground">{thread.context}</p>
                </div>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                    <span className="material-symbols-outlined text-[22px] text-muted-foreground">more_vert</span>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_MESSAGES.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.isOwn
                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                    : 'bg-secondary text-foreground rounded-bl-md'
                                }`}
                        >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                {msg.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Templates (expandable) */}
            {showTemplates && (
                <div className="border-t border-border bg-background p-3">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {QUICK_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    setMessage(`[${template.label}] `);
                                    setShowTemplates(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-xl text-sm font-medium shrink-0 hover:bg-secondary/80 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">{template.icon}</span>
                                {template.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Composer */}
            <div className="border-t border-border bg-background p-3 sticky bottom-16">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${showTemplates ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 h-10 px-4 bg-secondary rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
