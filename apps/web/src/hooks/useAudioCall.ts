'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// ============================================================
// AUDIO CALL HOOK - WebRTC for 1:1 DM audio calls
// ============================================================

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

export interface AudioCallState {
    callState: CallState;
    callId: string | null;
    remoteUserId: string | null;
    remoteUserName: string | null;
    duration: number;
    isMuted: boolean;
    isSpeakerOn: boolean;
    error: string | null;
}

export interface AudioCallOptions {
    tenant_id: string;
    user_id: string;
    onIncomingCall?: (callerId: string, callerName: string) => void;
}

interface RTCConfig {
    iceServers: RTCIceServer[];
}

const RTC_CONFIG: RTCConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function useAudioCall(options: AudioCallOptions) {
    const { tenant_id, user_id, onIncomingCall } = options;

    const [state, setState] = useState<AudioCallState>({
        callState: 'idle',
        callId: null,
        remoteUserId: null,
        remoteUserName: null,
        duration: 0,
        isMuted: false,
        isSpeakerOn: true,
        error: null,
    });

    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize signaling socket
    useEffect(() => {
        if (!tenant_id || !user_id) return;

        const backendUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

        const socket = io(`${backendUrl}/calls`, {
            query: { tenant_id, user_id },
            transports: ['websocket'],
        });

        socketRef.current = socket;

        // Handle incoming call
        socket.on('call:incoming', ({ call_id, caller_id, caller_name }) => {
            setState(prev => ({
                ...prev,
                callState: 'ringing',
                callId: call_id,
                remoteUserId: caller_id,
                remoteUserName: caller_name,
            }));
            onIncomingCall?.(caller_id, caller_name);
        });

        // Handle call accepted
        socket.on('call:accepted', async ({ answer }) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
                setState(prev => ({ ...prev, callState: 'connected' }));
                startDurationTimer();
            }
        });

        // Handle call rejected
        socket.on('call:rejected', () => {
            cleanup();
            setState(prev => ({
                ...prev,
                callState: 'ended',
                error: 'Call rejected',
            }));
        });

        // Handle call ended
        socket.on('call:ended', () => {
            cleanup();
            setState(prev => ({ ...prev, callState: 'ended' }));
        });

        // Handle ICE candidate
        socket.on('call:ice-candidate', async ({ candidate }) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );
            }
        });

        // Handle offer (for answering calls)
        socket.on('call:offer', async ({ offer }) => {
            if (state.callState === 'ringing' && peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(
                    new RTCSessionDescription(offer)
                );
            }
        });

        return () => {
            socket.disconnect();
            cleanup();
        };
    }, [tenant_id, user_id, onIncomingCall, state.callState]);

    // Start duration timer
    const startDurationTimer = useCallback(() => {
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
            setState(prev => ({
                ...prev,
                duration: Math.floor((Date.now() - startTime) / 1000),
            }));
        }, 1000);
    }, []);

    // Cleanup resources
    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    }, []);

    // Start a call
    const startCall = useCallback(async (targetUserId: string, targetUserName?: string) => {
        try {
            setState(prev => ({
                ...prev,
                callState: 'calling',
                remoteUserId: targetUserId,
                remoteUserName: targetUserName || null,
                error: null,
            }));

            // Get local audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;

            // Create peer connection
            const pc = new RTCPeerConnection(RTC_CONFIG);
            peerConnectionRef.current = pc;

            // Add local stream
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Handle remote stream
            pc.ontrack = (event) => {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && socketRef.current) {
                    socketRef.current.emit('call:ice-candidate', {
                        target_user_id: targetUserId,
                        candidate: event.candidate,
                    });
                }
            };

            // Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const callId = `call-${Date.now()}`;
            setState(prev => ({ ...prev, callId }));

            socketRef.current?.emit('call:start', {
                call_id: callId,
                target_user_id: targetUserId,
                offer,
            });

        } catch (error: any) {
            console.error('Failed to start call:', error);
            cleanup();
            setState(prev => ({
                ...prev,
                callState: 'idle',
                error: error.name === 'NotAllowedError'
                    ? 'Microphone access denied'
                    : 'Failed to start call',
            }));
        }
    }, [cleanup]);

    // Answer an incoming call
    const answerCall = useCallback(async () => {
        if (!state.callId || !state.remoteUserId) return;

        try {
            // Get local audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;

            // Create peer connection
            const pc = new RTCPeerConnection(RTC_CONFIG);
            peerConnectionRef.current = pc;

            // Add local stream
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Handle remote stream
            pc.ontrack = (event) => {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && socketRef.current) {
                    socketRef.current.emit('call:ice-candidate', {
                        target_user_id: state.remoteUserId,
                        candidate: event.candidate,
                    });
                }
            };

            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketRef.current?.emit('call:accept', {
                call_id: state.callId,
                caller_id: state.remoteUserId,
                answer,
            });

            setState(prev => ({ ...prev, callState: 'connected' }));
            startDurationTimer();

        } catch (error: any) {
            console.error('Failed to answer call:', error);
            cleanup();
            setState(prev => ({
                ...prev,
                callState: 'idle',
                error: error.name === 'NotAllowedError'
                    ? 'Microphone access denied'
                    : 'Failed to answer call',
            }));
        }
    }, [state.callId, state.remoteUserId, cleanup, startDurationTimer]);

    // Reject an incoming call
    const rejectCall = useCallback(() => {
        if (state.callId && state.remoteUserId) {
            socketRef.current?.emit('call:reject', {
                call_id: state.callId,
                caller_id: state.remoteUserId,
            });
        }
        cleanup();
        setState(prev => ({ ...prev, callState: 'idle' }));
    }, [state.callId, state.remoteUserId, cleanup]);

    // End the current call
    const endCall = useCallback(() => {
        if (state.callId && state.remoteUserId) {
            socketRef.current?.emit('call:end', {
                call_id: state.callId,
                target_user_id: state.remoteUserId,
            });
        }
        cleanup();
        setState(prev => ({ ...prev, callState: 'ended' }));
    }, [state.callId, state.remoteUserId, cleanup]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
            }
        }
    }, []);

    // Toggle speaker
    const toggleSpeaker = useCallback(() => {
        setState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
        // Note: Actual speaker routing requires setSinkId which has limited support
    }, []);

    // Reset state
    const resetState = useCallback(() => {
        setState({
            callState: 'idle',
            callId: null,
            remoteUserId: null,
            remoteUserName: null,
            duration: 0,
            isMuted: false,
            isSpeakerOn: true,
            error: null,
        });
    }, []);

    return {
        state,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        resetState,
        remoteAudioRef,
    };
}
