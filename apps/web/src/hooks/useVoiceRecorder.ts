'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================
// VOICE RECORDER HOOK - MediaRecorder API for voice notes
// ============================================================

export interface VoiceRecorderState {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    error: string | null;
}

export interface VoiceRecorderResult {
    state: VoiceRecorderState;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    cancelRecording: () => void;
    getAudioLevel: () => number;
}

const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
    },
    video: false,
};

export function useVoiceRecorder(): VoiceRecorderResult {
    const [state, setState] = useState<VoiceRecorderState>({
        isRecording: false,
        isPaused: false,
        duration: 0,
        error: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Start recording
    const startRecording = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, error: null }));

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
            streamRef.current = stream;

            // Set up audio analyser for level visualization
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Create MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setState(prev => ({ ...prev, error: 'Recording failed' }));
            };

            // Start recording
            mediaRecorder.start(100); // Collect data every 100ms

            // Start duration timer
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    duration: Math.floor((Date.now() - startTime) / 1000),
                }));
            }, 100);

            setState({
                isRecording: true,
                isPaused: false,
                duration: 0,
                error: null,
            });
        } catch (error: unknown) {
            console.error('Failed to start recording:', error);
            setState(prev => ({
                ...prev,
                error: (error as Error).name === 'NotAllowedError'
                    ? 'Microphone access denied'
                    : 'Failed to start recording',
            }));
        }
    }, []);

    // Stop recording and return the blob
    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                resolve(null);
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                // Clear timer
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // Close audio context
                if (audioContextRef.current) {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                }

                // Create blob from chunks
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                chunksRef.current = [];

                setState({
                    isRecording: false,
                    isPaused: false,
                    duration: 0,
                    error: null,
                });

                resolve(blob);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    // Pause recording
    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setState(prev => ({ ...prev, isPaused: true }));
        }
    }, []);

    // Resume recording
    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'paused') {
            mediaRecorderRef.current.resume();

            // Resume timer from current duration
            const startTime = Date.now() - state.duration * 1000;
            timerRef.current = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    duration: Math.floor((Date.now() - startTime) / 1000),
                }));
            }, 100);

            setState(prev => ({ ...prev, isPaused: false }));
        }
    }, [state.duration]);

    // Cancel recording without saving
    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = null;

            if (mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        chunksRef.current = [];

        setState({
            isRecording: false,
            isPaused: false,
            duration: 0,
            error: null,
        });
    }, []);

    // Get current audio level (0-1) for visualizer
    const getAudioLevel = useCallback((): number => {
        if (!analyserRef.current) return 0;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average level
        const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        return Math.min(average / 128, 1); // Normalize to 0-1
    }, []);

    return {
        state,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        cancelRecording,
        getAudioLevel,
    };
}

// ============================================================
// AUDIO PLAYER HOOK - For playing voice notes
// ============================================================

export interface AudioPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    error: string | null;
}

export interface AudioPlayerResult {
    state: AudioPlayerState;
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    load: (url: string) => void;
}

export function useAudioPlayer(): AudioPlayerResult {
    const [state, setState] = useState<AudioPlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        error: null,
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Load audio from URL
    const load = useCallback((url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            setState(prev => ({
                ...prev,
                duration: audio.duration,
                error: null,
            }));
        };

        audio.ontimeupdate = () => {
            setState(prev => ({
                ...prev,
                currentTime: audio.currentTime,
            }));
        };

        audio.onended = () => {
            setState(prev => ({
                ...prev,
                isPlaying: false,
                currentTime: 0,
            }));
        };

        audio.onerror = () => {
            setState(prev => ({
                ...prev,
                error: 'Failed to load audio',
            }));
        };
    }, []);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
            setState(prev => ({ ...prev, isPlaying: true }));
        }
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setState(prev => ({ ...prev, isPlaying: false }));
        }
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setState(prev => ({ ...prev, currentTime: time }));
        }
    }, []);

    return {
        state,
        play,
        pause,
        seek,
        load,
    };
}
