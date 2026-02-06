'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Smile, Mic, X, Camera, Image, FileText, MapPin, Video, Calendar } from 'lucide-react';

// ============================================================
// COMPOSER - WhatsApp-style sticky composer
// ============================================================

export interface ComposerProps {
    onSend: (message: string, attachments?: File[]) => void;
    onVoiceNote?: () => void;
    placeholder?: string;
    disabled?: boolean;
    pendingUploadRequest?: boolean;
}

export function Composer({
    onSend,
    onVoiceNote,
    placeholder = "Type a message...",
    disabled = false,
    pendingUploadRequest = false
}: ComposerProps) {
    const [message, setMessage] = useState('');
    const [showAttachSheet, setShowAttachSheet] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [message]);

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasContent = message.trim().length > 0;

    return (
        <>
            {/* Attachment Bottom Sheet */}
            {showAttachSheet && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
                        onClick={() => setShowAttachSheet(false)}
                    />
                    <AttachmentSheet
                        onClose={() => setShowAttachSheet(false)}
                        pendingUploadRequest={pendingUploadRequest}
                    />
                </>
            )}

            {/* Composer Bar */}
            <div className="border-t border-border bg-background px-3 sm:px-4 py-3 sticky bottom-14 sm:bottom-16 z-10">
                <div className="flex items-end gap-2 max-w-3xl mx-auto">
                    {/* Attachments Button */}
                    <button
                        onClick={() => setShowAttachSheet(!showAttachSheet)}
                        disabled={disabled}
                        className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-all ${showAttachSheet
                                ? 'bg-primary text-white rotate-45'
                                : 'hover:bg-secondary text-muted-foreground'
                            }`}
                        aria-label="Attach file"
                    >
                        <Paperclip size={20} />
                    </button>

                    {/* Input Container */}
                    <div className="flex-1 flex items-end bg-secondary/50 border border-border/60 rounded-2xl px-3 py-2 min-h-[48px] shadow-sm">
                        <button
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 -ml-0.5"
                            aria-label="Insert emoji"
                        >
                            <Smile size={20} />
                        </button>

                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            rows={1}
                            disabled={disabled}
                            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none resize-none py-1.5 px-2 max-h-[120px]"
                            style={{ lineHeight: 1.5 }}
                        />
                    </div>

                    {/* Send or Mic Button */}
                    {hasContent ? (
                        <button
                            onClick={handleSend}
                            disabled={disabled}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shrink-0 transition-all shadow-sm hover:bg-primary/90"
                            aria-label="Send message"
                        >
                            <Send size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={onVoiceNote}
                            disabled={disabled}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0 transition-all hover:bg-secondary"
                            aria-label="Record voice note"
                        >
                            <Mic size={18} />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

// ============================================================
// ATTACHMENT SHEET - Bottom sheet for attachments (not floating)
// ============================================================

interface AttachmentSheetProps {
    onClose: () => void;
    onSelect?: (type: string) => void;
    pendingUploadRequest?: boolean;
}

const ATTACH_OPTIONS = [
    { id: 'camera', label: 'Camera', icon: Camera, color: 'bg-pink-500' },
    { id: 'photo', label: 'Photo', icon: Image, color: 'bg-purple-500' },
    { id: 'document', label: 'Document', icon: FileText, color: 'bg-blue-500' },
    { id: 'voice', label: 'Voice Note', icon: Mic, color: 'bg-green-500' },
    { id: 'location', label: 'Location', icon: MapPin, color: 'bg-orange-500' },
    { id: 'meeting', label: 'Schedule Meeting', icon: Calendar, color: 'bg-indigo-500' },
];

function AttachmentSheet({ onClose, onSelect, pendingUploadRequest }: AttachmentSheetProps) {
    const handleSelect = (type: string) => {
        onSelect?.(type);
        onClose();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300 pb-safe">
            {/* Handle */}
            <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
                <h3 className="font-semibold text-base">Share</h3>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Pending Upload Request */}
            {pendingUploadRequest && (
                <div className="mx-4 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600">upload_file</span>
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Document Requested</p>
                            <p className="text-xs text-amber-600 dark:text-amber-300">Upload medical certificate</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-3 gap-4 px-6 pb-6">
                {ATTACH_OPTIONS.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                    >
                        <div className={`w-12 h-12 rounded-full ${opt.color} flex items-center justify-center text-white shadow-md`}>
                            <opt.icon size={22} />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export { AttachmentSheet };
