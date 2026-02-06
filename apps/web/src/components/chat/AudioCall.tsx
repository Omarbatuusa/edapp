'use client';

import React, { useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';
import { useAudioCall, CallState } from '@/hooks/useAudioCall';

// ============================================================
// AUDIO CALL UI - Call screens for 1:1 DM audio calls
// ============================================================

interface AudioCallProviderProps {
    tenantId: string;
    userId: string;
    children: React.ReactNode;
}

// Context for global call state (optional usage)
export function AudioCallProvider({ tenantId, userId, children }: AudioCallProviderProps) {
    // Initialize call hook at app level if needed
    return <>{children}</>;
}

// ============================================================
// INCOMING CALL SHEET
// ============================================================

interface IncomingCallSheetProps {
    callerName: string;
    callerAvatar?: string;
    onAnswer: () => void;
    onReject: () => void;
}

export function IncomingCallSheet({ callerName, callerAvatar, onAnswer, onReject }: IncomingCallSheetProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in">
            <div className="flex flex-col items-center gap-6 p-8">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-semibold text-white">
                        {callerAvatar || callerName.charAt(0)}
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping" />
                </div>

                {/* Caller info */}
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-white">{callerName}</h2>
                    <p className="text-white/70 mt-1">Incoming audio call...</p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-8 mt-4">
                    {/* Reject */}
                    <button
                        onClick={onReject}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Reject call"
                    >
                        <PhoneOff size={28} className="text-white" />
                    </button>

                    {/* Answer */}
                    <button
                        onClick={onAnswer}
                        className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Answer call"
                    >
                        <Phone size={28} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// OUTGOING CALL SHEET (Calling state)
// ============================================================

interface OutgoingCallSheetProps {
    recipientName: string;
    recipientAvatar?: string;
    onCancel: () => void;
}

export function OutgoingCallSheet({ recipientName, recipientAvatar, onCancel }: OutgoingCallSheetProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in">
            <div className="flex flex-col items-center gap-6 p-8">
                {/* Avatar */}
                <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-semibold text-white">
                    {recipientAvatar || recipientName.charAt(0)}
                </div>

                {/* Recipient info */}
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-white">{recipientName}</h2>
                    <p className="text-white/70 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        Calling...
                    </p>
                </div>

                {/* Cancel button */}
                <button
                    onClick={onCancel}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg mt-8"
                    aria-label="Cancel call"
                >
                    <PhoneOff size={28} className="text-white" />
                </button>
            </div>
        </div>
    );
}

// ============================================================
// ACTIVE CALL SCREEN
// ============================================================

interface ActiveCallScreenProps {
    remoteName: string;
    remoteAvatar?: string;
    duration: number;
    isMuted: boolean;
    isSpeakerOn: boolean;
    onToggleMute: () => void;
    onToggleSpeaker: () => void;
    onEndCall: () => void;
}

export function ActiveCallScreen({
    remoteName,
    remoteAvatar,
    duration,
    isMuted,
    isSpeakerOn,
    onToggleMute,
    onToggleSpeaker,
    onEndCall,
}: ActiveCallScreenProps) {
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-gray-900 to-black py-16 px-8">
            {/* Top: Avatar and info */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-5xl font-semibold text-white">
                    {remoteAvatar || remoteName.charAt(0)}
                </div>
                <h2 className="text-2xl font-semibold text-white">{remoteName}</h2>
                <p className="text-primary font-mono text-lg">{formatDuration(duration)}</p>
            </div>

            {/* Bottom: Controls */}
            <div className="flex items-center gap-6">
                {/* Mute */}
                <button
                    onClick={onToggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                {/* End Call */}
                <button
                    onClick={onEndCall}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
                    aria-label="End call"
                >
                    <PhoneOff size={28} className="text-white" />
                </button>

                {/* Speaker */}
                <button
                    onClick={onToggleSpeaker}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${!isSpeakerOn
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
                >
                    {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
            </div>
        </div>
    );
}

// ============================================================
// CALL ENDED SCREEN
// ============================================================

interface CallEndedScreenProps {
    remoteName: string;
    duration: number;
    onClose: () => void;
}

export function CallEndedScreen({ remoteName, duration, onClose }: CallEndedScreenProps) {
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Auto-close after 3 seconds
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in">
            <div className="flex flex-col items-center gap-4 p-8">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                    <Phone size={28} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Call Ended</h2>
                <p className="text-gray-400">
                    {duration > 0 ? formatDuration(duration) : 'No answer'}
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// ============================================================
// CALL BUTTON - For thread header
// ============================================================

interface CallButtonProps {
    disabled?: boolean;
    onClick: () => void;
}

export function CallButton({ disabled, onClick }: CallButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Start audio call"
        >
            <Phone size={20} className="text-foreground" />
        </button>
    );
}

export default ActiveCallScreen;
