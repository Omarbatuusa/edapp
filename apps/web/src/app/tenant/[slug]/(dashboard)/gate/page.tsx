'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserCheck, CheckCircle, XCircle, AlertTriangle, Camera, Keyboard, Hash, Shield } from 'lucide-react';
import { useParams } from 'next/navigation';
import { attendanceQueue, generateIdempotencyKey } from '../../../../../lib/attendance-offline-queue';
import { apiClient } from '../../../../../lib/api-client';
import SyncCenter from '../../../../../components/attendance/SyncCenter';

type ScanMode = 'HID' | 'CAMERA' | 'PIN';
type ScanStatus = 'idle' | 'success' | 'error' | 'early_leave' | 'blocked';

interface ScanResult {
    learner_name?: string;
    grade?: string;
    class_name?: string;
    event_type?: string;
    photo_url?: string;
    message?: string;
    pickup_person_name?: string;
    pickup_person_relation?: string;
    early_leave?: boolean;
    blocked?: boolean;
    block_reason?: string;
}

export default function GateKiosk() {
    const params = useParams();
    const slug = params.slug as string;

    const [mode, setMode] = useState<ScanMode>('HID');
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [result, setResult] = useState<ScanResult | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [online, setOnline] = useState(true);

    // HID scanner buffer
    const hidBuffer = useRef('');
    const hidTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track online status
    useEffect(() => {
        setOnline(navigator.onLine);
        const onOnline = () => setOnline(true);
        const onOffline = () => setOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    // Auto-reset after result display
    const scheduleReset = useCallback(() => {
        if (autoResetTimer.current) clearTimeout(autoResetTimer.current);
        autoResetTimer.current = setTimeout(() => {
            setStatus('idle');
            setResult(null);
            setError(null);
            setPin('');
        }, 5000);
    }, []);

    // Process a scanned QR token
    const processScan = useCallback(async (qrToken: string) => {
        if (processing) return;
        setProcessing(true);
        setError(null);

        try {
            if (!navigator.onLine) {
                // Queue offline
                await attendanceQueue.enqueue({
                    idempotency_key: generateIdempotencyKey(),
                    tenant_id: '',
                    branch_id: '',
                    subject_type: 'LEARNER',
                    subject_user_id: '',
                    event_type: 'CHECK_IN',
                    source: 'KIOSK_SCAN',
                    captured_at_device: new Date().toISOString(),
                    qr_token: qrToken,
                });
                setResult({ learner_name: 'Queued Offline', message: 'Will sync when online' });
                setStatus('success');
                scheduleReset();
                return;
            }

            const res = await apiClient.post('/attendance/kiosk/scan', {
                qr_token: qrToken,
                device_id: 'web-kiosk',
            });

            if (res.data?.status === 'success') {
                const d = res.data;
                if (d.blocked) {
                    setResult({
                        learner_name: d.learner_name,
                        blocked: true,
                        block_reason: d.block_reason || 'Blocked',
                    });
                    setStatus('blocked');
                } else if (d.early_leave) {
                    setResult({
                        learner_name: d.learner_name,
                        grade: d.grade,
                        class_name: d.class_name,
                        event_type: 'CHECK_OUT',
                        early_leave: true,
                        pickup_person_name: d.pickup_person_name,
                        pickup_person_relation: d.pickup_person_relation,
                    });
                    setStatus('early_leave');
                } else {
                    setResult({
                        learner_name: d.learner_name,
                        grade: d.grade,
                        class_name: d.class_name,
                        event_type: d.event_type,
                        photo_url: d.photo_url,
                    });
                    setStatus('success');
                }
                scheduleReset();
            } else {
                setResult({ message: res.data?.message || 'Scan failed' });
                setStatus('error');
                scheduleReset();
            }
        } catch (err: any) {
            setResult({ message: err.response?.data?.message || 'Scan failed' });
            setStatus('error');
            scheduleReset();
        } finally {
            setProcessing(false);
        }
    }, [processing, scheduleReset]);

    // HID keyboard-wedge scanner detection
    useEffect(() => {
        if (mode !== 'HID') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore modifier keys
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                const token = hidBuffer.current.trim();
                hidBuffer.current = '';
                if (hidTimeout.current) clearTimeout(hidTimeout.current);
                if (token.length > 5) {
                    processScan(token);
                }
                return;
            }

            if (e.key.length === 1) {
                hidBuffer.current += e.key;
                // Reset buffer after 100ms of inactivity (HID scanners are very fast)
                if (hidTimeout.current) clearTimeout(hidTimeout.current);
                hidTimeout.current = setTimeout(() => {
                    hidBuffer.current = '';
                }, 100);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (hidTimeout.current) clearTimeout(hidTimeout.current);
        };
    }, [mode, processScan]);

    // PIN pad handlers
    const handleNumberClick = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
        }
    };

    const handlePinSubmit = () => {
        if (pin.length >= 4) {
            processScan(pin);
            setPin('');
        }
    };

    const handlePinClear = () => {
        setPin('');
        setStatus('idle');
        setResult(null);
        setError(null);
    };

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (autoResetTimer.current) clearTimeout(autoResetTimer.current);
            if (hidTimeout.current) clearTimeout(hidTimeout.current);
        };
    }, []);

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 select-none">
            {/* Mode selector */}
            <div className="fixed top-4 right-4 flex gap-2 z-50">
                <button
                    onClick={() => setMode('HID')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        mode === 'HID' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    <Keyboard size={14} /> HID Scanner
                </button>
                <button
                    onClick={() => setMode('CAMERA')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        mode === 'CAMERA' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    <Camera size={14} /> Camera
                </button>
                <button
                    onClick={() => setMode('PIN')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        mode === 'PIN' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    <Hash size={14} /> PIN
                </button>
            </div>

            {/* Online/Offline indicator */}
            {!online && (
                <div className="fixed top-4 left-4 px-3 py-2 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1 z-50">
                    <AlertTriangle size={14} /> Offline Mode
                </div>
            )}

            {/* IDLE STATE */}
            {status === 'idle' && (
                <div className="text-center w-full max-w-md">
                    {mode === 'HID' && (
                        <>
                            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Keyboard size={56} className="text-blue-500" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Ready to Scan</h1>
                            <p className="text-gray-500 text-lg">Present QR card to scanner</p>
                            {processing && (
                                <div className="mt-4 text-blue-600 font-bold animate-pulse">Processing...</div>
                            )}
                        </>
                    )}

                    {mode === 'CAMERA' && (
                        <>
                            <div className="w-full aspect-square max-w-xs mx-auto bg-gray-900 rounded-3xl overflow-hidden mb-6 flex items-center justify-center">
                                <div className="text-center text-white/60">
                                    <Camera size={48} className="mx-auto mb-2" />
                                    <p className="text-sm">Camera QR scanning</p>
                                    <p className="text-xs text-white/40 mt-1">Position QR code in frame</p>
                                </div>
                            </div>
                            <p className="text-gray-500">Hold QR card up to camera</p>
                        </>
                    )}

                    {mode === 'PIN' && (
                        <>
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserCheck size={40} className="text-blue-500" />
                                </div>
                                <h1 className="text-2xl font-bold">Gate Check-in</h1>
                                <p className="text-gray-500">Enter your PIN code</p>
                            </div>

                            {/* PIN dots */}
                            <div className="flex gap-3 justify-center mb-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full transition-all ${
                                            i < pin.length ? 'bg-blue-600 scale-110' : 'bg-gray-200'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Number pad */}
                            <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumberClick(num.toString())}
                                        className="h-16 rounded-2xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold transition-all active:scale-95"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={handlePinClear}
                                    className="h-16 rounded-2xl text-red-500 hover:bg-red-50 text-sm font-bold transition-all active:scale-95"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => handleNumberClick('0')}
                                    className="h-16 rounded-2xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold transition-all active:scale-95"
                                >
                                    0
                                </button>
                                <button
                                    onClick={handlePinSubmit}
                                    disabled={pin.length < 4}
                                    className="h-16 rounded-2xl bg-blue-600 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
                                >
                                    Enter
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* SUCCESS STATE */}
            {status === 'success' && result && (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="w-36 h-36 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={72} />
                    </div>
                    <h2 className="text-4xl font-bold mb-2">
                        {result.event_type === 'CHECK_IN' ? 'Welcome!' : 'Goodbye!'}
                    </h2>
                    <p className="text-2xl font-semibold text-blue-600">{result.learner_name}</p>
                    {result.grade && (
                        <p className="text-lg text-gray-500 mt-1">{result.grade}{result.class_name ? ` • ${result.class_name}` : ''}</p>
                    )}
                    <div className={`mt-4 inline-block px-6 py-2 rounded-full text-lg font-bold ${
                        result.event_type === 'CHECK_IN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                    }`}>
                        {result.event_type === 'CHECK_IN' ? 'Checked In' : 'Checked Out'}
                    </div>
                    {result.message && (
                        <p className="text-sm text-gray-400 mt-2">{result.message}</p>
                    )}
                </div>
            )}

            {/* EARLY LEAVE STATE */}
            {status === 'early_leave' && result && (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="w-36 h-36 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield size={72} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-orange-700">Early Leave Checkout</h2>
                    <p className="text-2xl font-semibold text-blue-600">{result.learner_name}</p>
                    {result.grade && (
                        <p className="text-lg text-gray-500 mt-1">{result.grade}</p>
                    )}
                    <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl max-w-sm mx-auto">
                        <p className="text-sm font-bold text-orange-800 mb-2">Verify Pickup Person:</p>
                        <p className="text-xl font-bold">{result.pickup_person_name}</p>
                        <p className="text-sm text-gray-600">Relation: {result.pickup_person_relation}</p>
                    </div>
                </div>
            )}

            {/* BLOCKED STATE */}
            {status === 'blocked' && result && (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="w-36 h-36 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={72} />
                    </div>
                    <h2 className="text-3xl font-bold text-red-600 mb-2">Blocked</h2>
                    {result.learner_name && (
                        <p className="text-xl font-semibold">{result.learner_name}</p>
                    )}
                    <p className="text-lg text-red-500 mt-2">{result.block_reason}</p>
                </div>
            )}

            {/* ERROR STATE */}
            {status === 'error' && (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="w-36 h-36 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={72} />
                    </div>
                    <h2 className="text-3xl font-bold text-red-600">Scan Failed</h2>
                    <p className="text-gray-500 mt-2">{result?.message || 'Please try again'}</p>
                </div>
            )}

            {/* Sync status */}
            <div className="fixed bottom-4 left-4 z-50">
                <SyncCenter />
            </div>
        </div>
    );
}
