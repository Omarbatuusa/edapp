import React, { useState } from 'react';

interface ChatComposerProps {
    onSend: (text: string) => void;
    onAttach: () => void;
    onVoice: () => void;
    placeholder?: string;
}

export function ChatComposer({ onSend, onAttach, onVoice, placeholder = "Type a message..." }: ChatComposerProps) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');
    };

    return (
        <div className="bg-background border-t border-border p-3 pb-safe">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <button
                    onClick={onAttach}
                    className="flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:bg-secondary transition-colors shrink-0"
                >
                    <span className="material-symbols-outlined text-[28px] transform rotate-45">add_circle</span>
                </button>

                <div className="flex-1 bg-secondary/50 rounded-[20px] flex items-center min-h-[44px] px-4 py-2 border border-transparent focus-within:border-primary/50 focus-within:bg-background transition-all">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-foreground placeholder:text-muted-foreground focus:ring-0 resize-none max-h-32 text-[15px] leading-relaxed"
                        placeholder={placeholder}
                        rows={1}
                        style={{ minHeight: '24px' }}
                    />
                    <button className="ml-2 text-muted-foreground hover:text-foreground">
                        <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                    </button>
                    {text.length === 0 && (
                        <button onClick={onVoice} className="ml-2 text-muted-foreground hover:text-foreground">
                            <span className="material-symbols-outlined text-[20px]">mic</span>
                        </button>
                    )}
                </div>

                <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-all shrink-0 ${text.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}
                >
                    <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-muted-foreground">School Admin can view this conversation.</p>
            </div>
        </div>
    );
}
