'use client';

import React, { useState, useRef } from 'react';

interface ChatComposerProps {
    onSend: (text: string) => void;
    onAttach: () => void;
    onVoice: () => void;
    placeholder?: string;
}

const QUICK_EMOJIS = ['😀', '😂', '❤️', '👍', '🙏', '👏', '🎉', '📚', '✅', '🔔', '⭐', '💡'];

export function ChatComposer({ onSend, onAttach, onVoice, placeholder = "Type a message..." }: ChatComposerProps) {
    const [text, setText] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
        setShowEmojis(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const insertEmoji = (emoji: string) => {
        setText(prev => prev + emoji);
        inputRef.current?.focus();
    };

    const hasText = text.trim().length > 0;

    return (
        <div className="shrink-0">
            {/* Emoji tray */}
            {showEmojis && (
                <div className="bg-white dark:bg-[#1e293b] border-t border-[#e2e8f0] dark:border-[#334155] px-3 py-2">
                    <div className="flex flex-wrap gap-1 max-w-md mx-auto justify-center">
                        {QUICK_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => insertEmoji(emoji)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[22px] transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Composer bar */}
            <div className="bg-[#f8fafc] dark:bg-[#0f172a] border-t border-[#e2e8f0] dark:border-[#1e293b] px-2 py-2">
                <div className="flex items-center gap-1.5 max-w-4xl mx-auto">
                    {/* Input pill */}
                    <div className="flex-1 flex items-center bg-white dark:bg-[#1e293b] rounded-full h-[44px] pl-1 pr-1.5 border border-[#e2e8f0] dark:border-[#334155]">
                        {/* Emoji toggle */}
                        <button
                            type="button"
                            onClick={() => setShowEmojis(!showEmojis)}
                            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors ${showEmojis ? 'text-[#2563eb]' : 'text-[#94a3b8] hover:text-[#64748b]'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">{showEmojis ? 'keyboard' : 'sentiment_satisfied'}</span>
                        </button>

                        {/* Fixed-height input — no expansion */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowEmojis(false)}
                            className="flex-1 bg-transparent text-[15px] text-[#0f172a] dark:text-[#f1f5f9] placeholder:text-[#94a3b8] h-full px-1 border-none outline-none shadow-none ring-0 focus:border-none focus:outline-none focus:shadow-none focus:ring-0"
                            placeholder={placeholder}
                            autoComplete="off"
                            style={{ boxShadow: 'none' }}
                        />

                        {/* Attach */}
                        <button type="button" onClick={onAttach} className="shrink-0 w-9 h-9 flex items-center justify-center text-[#94a3b8] hover:text-[#64748b] transition-colors rounded-full">
                            <span className="material-symbols-outlined text-[22px]">attach_file</span>
                        </button>
                    </div>

                    {/* Send / Voice */}
                    {hasText ? (
                        <button type="button" onClick={handleSend} className="shrink-0 w-[44px] h-[44px] rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[22px] text-white">send</span>
                        </button>
                    ) : (
                        <button type="button" onClick={onVoice} className="shrink-0 w-[44px] h-[44px] rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[22px] text-white">mic</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
