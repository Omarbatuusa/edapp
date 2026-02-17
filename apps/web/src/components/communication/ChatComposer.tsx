'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatComposerProps {
    onSend: (text: string) => void;
    onAttach: () => void;
    onVoice: () => void;
    onSendVoice?: (file: File) => Promise<void> | void;
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
// CHAT COMPOSER
// ============================================================

export function ChatComposer({ onSend, onAttach, onVoice, onSendVoice, placeholder = "Type a message..." }: ChatComposerProps) {
    const [text, setText] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        setShowEmojis(false);
        inputRef.current?.focus();
    };

    // ============================================
    // VOICE RECORDING
    // ============================================

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.start(100); // Collect data every 100ms
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingDuration(0);

            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch {
            // Microphone not available
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
            setIsRecording(false);
            return null;
        }

        return new Promise<File | null>((resolve) => {
            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
                // Stop all tracks
                recorder.stream.getTracks().forEach(t => t.stop());
                setIsRecording(false);
                resolve(file);
            };
            recorder.stop();
        });
    }, []);

    const cancelRecording = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.onstop = () => {
                recorder.stream.getTracks().forEach(t => t.stop());
            };
            recorder.stop();
        }
        audioChunksRef.current = [];
        setIsRecording(false);
        setRecordingDuration(0);
    }, []);

    const sendRecording = useCallback(async () => {
        const duration = recordingDuration;
        const file = await stopRecording();
        if (file && onSendVoice) {
            // Validate: reject empty or very short recordings
            if (file.size < 1000 || duration < 1) {
                // Recording too short — silently discard
                setRecordingDuration(0);
                return;
            }
            onSendVoice(file);
        }
        setRecordingDuration(0);
    }, [stopRecording, onSendVoice, recordingDuration]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            const recorder = mediaRecorderRef.current;
            if (recorder && recorder.state !== 'inactive') {
                recorder.stream.getTracks().forEach(t => t.stop());
                recorder.stop();
            }
        };
    }, []);

    const fmtDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const hasText = text.trim().length > 0;

    // ============================================
    // RECORDING UI
    // ============================================

    if (isRecording) {
        return (
            <div className="shrink-0">
                <div className="bg-[#f8fafc] dark:bg-[#0f172a] border-t border-[#e2e8f0] dark:border-[#1e293b] px-2 py-2">
                    <div className="flex items-center gap-2 max-w-4xl mx-auto">
                        {/* Cancel */}
                        <button type="button" onClick={cancelRecording} className="shrink-0 w-[44px] h-[44px] rounded-full bg-[#f1f5f9] dark:bg-[#334155] flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[22px] text-red-500">delete</span>
                        </button>

                        {/* Recording indicator */}
                        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#1e293b] rounded-full h-[44px] px-4 border border-[#e2e8f0] dark:border-[#334155]">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                            <span className="text-[14px] font-medium text-red-500 tabular-nums">{fmtDuration(recordingDuration)}</span>
                            <div className="flex-1 flex items-center gap-[2px] mx-2">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] rounded-full bg-red-400/60"
                                        style={{
                                            height: `${Math.max(4, Math.random() * 20)}px`,
                                            animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Send voice */}
                        <button type="button" onClick={sendRecording} className="shrink-0 w-[44px] h-[44px] rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[22px] text-white">send</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // NORMAL COMPOSER UI
    // ============================================

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

                        {/* Fixed-height input */}
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
                        <button type="button" onClick={startRecording} className="shrink-0 w-[44px] h-[44px] rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[22px] text-white">mic</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
