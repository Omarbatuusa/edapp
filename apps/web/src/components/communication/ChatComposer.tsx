'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ChatComposerProps {
    onSend: (text: string) => void;
    onAttach: () => void;
    placeholder?: string;
}

// ============================================================
// EMOJI PICKER (dynamic import to avoid SSR)
// ============================================================

function EmojiPickerPanel({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
    const [Picker, setPicker] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const ref = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        let mounted = true;
        Promise.all([
            import('@emoji-mart/react'),
            import('@emoji-mart/data'),
        ]).then(([pickerMod, dataMod]) => {
            if (mounted) {
                setPicker(() => pickerMod.default);
                setData(dataMod.default);
            }
        });
        return () => { mounted = false; };
    }, []);

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    if (!Picker || !data) {
        return (
            <div className="w-[352px] h-[400px] bg-white dark:bg-[#1e293b] rounded-xl shadow-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-[#94a3b8] animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div ref={ref}>
            <Picker
                data={data}
                onEmojiSelect={(emoji: any) => onSelect(emoji.native)}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
                maxFrequentRows={2}
            />
        </div>
    );
}

// ============================================================
// CHAT COMPOSER — WhatsApp-flat, no audio, no box shadow
// ============================================================

export function ChatComposer({ onSend, onAttach, placeholder = "Type a message..." }: ChatComposerProps) {
    const [text, setText] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = useCallback(() => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
        setShowEmojis(false);
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [text, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const insertEmoji = (emoji: string) => {
        setText(prev => prev + emoji);
        setShowEmojis(false);
        inputRef.current?.focus();
    };

    const hasText = text.trim().length > 0;

    return (
        <div className="shrink-0 relative">
            {/* Emoji picker popup */}
            {showEmojis && (
                <div className="absolute bottom-full left-2 mb-2 z-50">
                    <EmojiPickerPanel
                        onSelect={insertEmoji}
                        onClose={() => setShowEmojis(false)}
                    />
                </div>
            )}

            {/* Composer bar — WhatsApp-flat: no border-top, no shadow */}
            <div className="bg-[#f0f2f5] dark:bg-[#1e2b32] px-2 py-2">
                <div className="flex items-center gap-1.5 max-w-4xl mx-auto">
                    {/* Input pill */}
                    <div className="flex-1 flex items-center bg-white dark:bg-[#2a3942] rounded-full h-[44px] pl-1 pr-1.5">
                        {/* Emoji toggle */}
                        <button
                            type="button"
                            onClick={() => setShowEmojis(!showEmojis)}
                            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors ${showEmojis ? 'text-[#2563eb]' : 'text-[#8696a0] hover:text-[#54656f]'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">{showEmojis ? 'keyboard' : 'sentiment_satisfied'}</span>
                        </button>

                        {/* Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowEmojis(false)}
                            className="flex-1 bg-transparent text-[15px] text-[#111b21] dark:text-[#e9edef] placeholder:text-[#8696a0] h-full px-1 border-none outline-none shadow-none ring-0 focus:border-none focus:outline-none focus:shadow-none focus:ring-0"
                            placeholder={placeholder}
                            autoComplete="off"
                            enterKeyHint="send"
                            style={{ boxShadow: 'none' }}
                        />

                        {/* Attach */}
                        <button type="button" onClick={onAttach} className="shrink-0 w-9 h-9 flex items-center justify-center text-[#8696a0] hover:text-[#54656f] transition-colors rounded-full">
                            <span className="material-symbols-outlined text-[22px]">attach_file</span>
                        </button>
                    </div>

                    {/* Send button — no shadow */}
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!hasText}
                        className={`shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center transition-colors ${
                            hasText
                                ? 'bg-[#00a884] hover:bg-[#06cf9c] active:bg-[#00a884]'
                                : 'bg-[#8696a0]/30'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[22px] ${hasText ? 'text-white' : 'text-[#8696a0]'}`}>send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
