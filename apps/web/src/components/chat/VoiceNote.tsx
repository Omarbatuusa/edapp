'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Send, X, Play, Pause } from 'lucide-react';
import { useVoiceRecorder, useAudioPlayer } from '@/hooks/useVoiceRecorder';

// ============================================================
// VOICE NOTE RECORDER - UI component for recording voice notes
// ============================================================

interface VoiceNoteRecorderProps {
    onSend: (audioBlob: Blob, duration: number) => void;
    onCancel: () => void;
}

export function VoiceNoteRecorder({ onSend, onCancel }: VoiceNoteRecorderProps) {
    const { state, startRecording, stopRecording, cancelRecording, getAudioLevel } = useVoiceRecorder();
    const [audioLevel, setAudioLevel] = useState(0);
    const animationRef = useRef<number | null>(null);

    // Start recording immediately on mount
    useEffect(() => {
        startRecording();
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [startRecording]);

    // Update audio level visualization
    useEffect(() => {
        if (state.isRecording && !state.isPaused) {
            const updateLevel = () => {
                setAudioLevel(getAudioLevel());
                animationRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
        } else if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }, [state.isRecording, state.isPaused, getAudioLevel]);

    // Format duration
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSend = async () => {
        const blob = await stopRecording();
        if (blob) {
            onSend(blob, state.duration);
        }
    };

    const handleCancel = () => {
        cancelRecording();
        onCancel();
    };

    if (state.error) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 text-destructive rounded-xl">
                <span className="material-symbols-outlined">error</span>
                <span className="text-sm font-medium">{state.error}</span>
                <button onClick={handleCancel} className="ml-auto">
                    <X size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-xl animate-in slide-in-from-bottom-2">
            {/* Cancel button */}
            <button
                onClick={handleCancel}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Cancel recording"
            >
                <X size={22} />
            </button>

            {/* Recording indicator */}
            <div className="flex-1 flex items-center gap-3">
                {/* Animated mic */}
                <div
                    className="relative w-10 h-10 flex items-center justify-center rounded-full bg-destructive"
                    style={{
                        transform: `scale(${1 + audioLevel * 0.3})`,
                        transition: 'transform 50ms ease-out',
                    }}
                >
                    <Mic size={20} className="text-white" />
                    <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-50" />
                </div>

                {/* Waveform visualization */}
                <div className="flex-1 flex items-center gap-[2px] h-8 overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => {
                        const height = Math.random() * audioLevel * 100;
                        return (
                            <div
                                key={i}
                                className="w-1 bg-primary/60 rounded-full transition-all duration-75"
                                style={{
                                    height: `${Math.max(4, height)}%`,
                                }}
                            />
                        );
                    })}
                </div>

                {/* Duration */}
                <span className="text-sm font-mono text-muted-foreground min-w-[40px]">
                    {formatDuration(state.duration)}
                </span>
            </div>

            {/* Send button */}
            <button
                onClick={handleSend}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                aria-label="Send voice note"
            >
                <Send size={18} />
            </button>
        </div>
    );
}

// ============================================================
// VOICE NOTE PLAYER - UI component for playing voice notes
// ============================================================

interface VoiceNotePlayerProps {
    url: string;
    duration?: number; // Pre-known duration in seconds
    isOwn?: boolean;
}

export function VoiceNotePlayer({ url, duration: initialDuration, isOwn = false }: VoiceNotePlayerProps) {
    const { state, play, pause, seek, load } = useAudioPlayer();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        load(url);
        setIsLoaded(true);
    }, [url, load]);

    const togglePlay = () => {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
    const displayDuration = state.duration || initialDuration || 0;

    return (
        <div
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl min-w-[200px] ${isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
                }`}
        >
            {/* Play/Pause button */}
            <button
                onClick={togglePlay}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${isOwn
                        ? 'bg-white/20 hover:bg-white/30'
                        : 'bg-primary/10 hover:bg-primary/20'
                    }`}
                disabled={!isLoaded}
            >
                {state.isPlaying ? (
                    <Pause size={18} className={isOwn ? 'text-white' : 'text-primary'} />
                ) : (
                    <Play size={18} className={isOwn ? 'text-white' : 'text-primary'} />
                )}
            </button>

            {/* Progress bar */}
            <div className="flex-1 flex flex-col gap-1">
                <div
                    className={`h-1 rounded-full overflow-hidden ${isOwn ? 'bg-white/30' : 'bg-border'
                        }`}
                >
                    <div
                        className={`h-full rounded-full transition-all ${isOwn ? 'bg-white' : 'bg-primary'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Time display */}
                <div className={`flex justify-between text-xs ${isOwn ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                    <span>{formatTime(state.currentTime)}</span>
                    <span>{formatTime(displayDuration)}</span>
                </div>
            </div>

            {/* Mic icon */}
            <Mic size={16} className={isOwn ? 'text-white/60' : 'text-muted-foreground'} />
        </div>
    );
}

export default VoiceNoteRecorder;
