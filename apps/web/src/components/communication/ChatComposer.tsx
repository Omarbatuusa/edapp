'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatComposerProps {
    onSend: (text: string) => void;
    onAttach: () => void;
    onVoice: () => void;
    placeholder?: string;
}

export function ChatComposer({ onSend, onAttach, onVoice, placeholder = "Message" }: ChatComposerProps) {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    const adjustHeight = useCallback(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = '0';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }, []);

    useEffect(() => { adjustHeight(); }, [text, adjustHeight]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
        if (textareaRef.current) textareaRef.current.style.height = '20px';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasText = text.trim().length > 0;

    return (
        <div className="shrink-0 bg-[#f0f0f0] dark:bg-[#1a1d21] px-2 py-1.5">
            <div className="flex items-end gap-1.5 max-w-4xl mx-auto">
                {/* Input container - WhatsApp pill */}
                <div className="flex-1 flex items-end bg-white dark:bg-[#2a2f36] rounded-[25px] min-h-[44px] pl-2 pr-1.5 py-0.5">
                    {/* Emoji */}
                    <button type="button" className="shrink-0 w-9 h-9 flex items-center justify-center text-[#8696a0] hover:text-[#54656f] transition-colors mb-[1px]">
                        <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
                    </button>

                    {/* Textarea - no outlines, no rings */}
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent resize-none text-[15px] leading-[20px] text-foreground placeholder:text-[#8696a0] py-[10px] px-1 min-h-[20px] max-h-[120px] border-0 outline-0 ring-0 focus:border-0 focus:outline-0 focus:ring-0 focus:shadow-none"
                        placeholder={placeholder}
                        rows={1}
                        style={{ height: '20px', boxShadow: 'none' }}
                    />

                    {/* Attach */}
                    <button type="button" onClick={onAttach} className="shrink-0 w-9 h-9 flex items-center justify-center text-[#8696a0] hover:text-[#54656f] transition-colors mb-[1px]">
                        <span className="material-symbols-outlined text-[24px]">attach_file</span>
                    </button>

                    {/* Camera (only when empty) */}
                    {!hasText && (
                        <button type="button" className="shrink-0 w-9 h-9 flex items-center justify-center text-[#8696a0] hover:text-[#54656f] transition-colors mb-[1px]">
                            <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                        </button>
                    )}
                </div>

                {/* Send / Voice - WhatsApp teal circle */}
                {hasText ? (
                    <button type="button" onClick={handleSend} className="shrink-0 w-[44px] h-[44px] rounded-full bg-[#00a884] hover:bg-[#008f72] flex items-center justify-center transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[22px] text-white ml-0.5">send</span>
                    </button>
                ) : (
                    <button type="button" onClick={onVoice} className="shrink-0 w-[44px] h-[44px] rounded-full bg-[#00a884] hover:bg-[#008f72] flex items-center justify-center transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[22px] text-white">mic</span>
                    </button>
                )}
            </div>
        </div>
    );
}
