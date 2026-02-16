'use client';

import React from 'react';
import type { AudioCallState } from '../../hooks/useAudioCall';

// ============================================================
// CALL OVERLAY - Full-screen audio call UI
// ============================================================

interface CallOverlayProps {
    state: AudioCallState;
    onAnswer: () => void;
    onReject: () => void;
    onEnd: () => void;
    onToggleMute: () => void;
    onToggleSpeaker: () => void;
    onReset: () => void;
    remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function CallOverlay({
    state,
    onAnswer,
    onReject,
    onEnd,
    onToggleMute,
    onToggleSpeaker,
    onReset,
    remoteAudioRef,
}: CallOverlayProps) {
    if (state.callState === 'idle') return null;

    const isRinging = state.callState === 'ringing';
    const isCalling = state.callState === 'calling';
    const isConnected = state.callState === 'connected';
    const isEnded = state.callState === 'ended';

    return (
        <div className="fixed inset-0 z-[200] bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-between py-16 px-6 animate-in fade-in duration-300">
            {/* Hidden audio element */}
            <audio ref={remoteAudioRef} autoPlay playsInline />

            {/* User info */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/20">
                    <span className="material-symbols-outlined text-5xl text-white/80">person</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                    {state.remoteUserName || state.remoteUserId || 'Unknown'}
                </h2>
                <p className="text-white/60 text-sm">
                    {isCalling && 'Calling...'}
                    {isRinging && 'Incoming call'}
                    {isConnected && formatDuration(state.duration)}
                    {isEnded && (state.error || 'Call ended')}
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                {isConnected && (
                    <>
                        <button
                            onClick={onToggleMute}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                                state.isMuted ? 'bg-white text-slate-900' : 'bg-white/20 text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined">
                                {state.isMuted ? 'mic_off' : 'mic'}
                            </span>
                        </button>

                        <button
                            onClick={onToggleSpeaker}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                                state.isSpeakerOn ? 'bg-white text-slate-900' : 'bg-white/20 text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined">
                                {state.isSpeakerOn ? 'volume_up' : 'volume_off'}
                            </span>
                        </button>
                    </>
                )}

                {isRinging && (
                    <>
                        <button
                            onClick={onReject}
                            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30"
                        >
                            <span className="material-symbols-outlined text-3xl">call_end</span>
                        </button>

                        <button
                            onClick={onAnswer}
                            className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse"
                        >
                            <span className="material-symbols-outlined text-3xl">call</span>
                        </button>
                    </>
                )}

                {(isCalling || isConnected) && (
                    <button
                        onClick={onEnd}
                        className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30"
                    >
                        <span className="material-symbols-outlined text-3xl">call_end</span>
                    </button>
                )}

                {isEnded && (
                    <button
                        onClick={onReset}
                        className="px-6 py-3 rounded-full bg-white/20 text-white font-medium"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}
