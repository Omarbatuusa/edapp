'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

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

    useEffect(() => {
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

    useEffect(() => {
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
// CHAT COMPOSER — WhatsApp-stable, no audio
// ============================================================

export function ChatComposer({ onSend, onAttach, placeholder = "Type a message..." }: ChatComposerProps) {
    const [text, setText] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const composerRef = useRef<HTMLDivElement>(null);

    const handleSend = useCallback(() => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
        setShowEmojis(false);
        // Re-focus after send with slight delay so DOM settles
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

    // Mobile keyboard stability: use visualViewport to keep composer pinned
    useEffect(() => {
        const vv = typeof window !== 'undefined' ? window.visualViewport : null;
        if (!vv || !composerRef.current) return;

        const onResize = () => {
            const composer = composerRef.current;
            if (!composer) return;
            // When mobile keyboard opens, visualViewport.height shrinks.
            // We offset the composer bottom by the difference.
            const offsetBottom = window.innerHeight - vv.height - vv.offsetTop;
            composer.style.transform = offsetBottom > 0 ? `translateY(-${offsetBottom}px)` : '';
        };

        vv.addEventListener('resize', onResize);
        vv.addEventListener('scroll', onResize);
        return () => {
            vv.removeEventListener('resize', onResize);
            vv.removeEventListener('scroll', onResize);
        };
    }, []);

    const hasText = text.trim().length > 0;

    return (
        <div ref={composerRef} className="shrink-0 relative will-change-transform">
            {/* Emoji picker popup */}
            {showEmojis && (
                <div className="absolute bottom-full left-2 mb-2 z-50">
                    <EmojiPickerPanel
                        onSelect={insertEmoji}
                        onClose={() => setShowEmojis(false)}
                    />
                </div>
            )}

            {/* Composer bar — fixed height, no layout shift */}
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

                        {/* Fixed-height input — no resize */}
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
                            enterKeyHint="send"
                            style={{ boxShadow: 'none' }}
                        />

                        {/* Attach */}
                        <button type="button" onClick={onAttach} className="shrink-0 w-9 h-9 flex items-center justify-center text-[#94a3b8] hover:text-[#64748b] transition-colors rounded-full">
                            <span className="material-symbols-outlined text-[22px]">attach_file</span>
                        </button>
                    </div>

                    {/* Send button — always visible, disabled when empty */}
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!hasText}
                        className={`shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center transition-colors shadow-sm ${
                            hasText
                                ? 'bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af]'
                                : 'bg-[#94a3b8]/30'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[22px] ${hasText ? 'text-white' : 'text-[#94a3b8]'}`}>send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
