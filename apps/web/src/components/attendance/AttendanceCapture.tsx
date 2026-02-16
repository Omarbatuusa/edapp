'use client';

import { useState, useEffect } from 'react';
import { useGeoLocation } from '../../hooks/useGeoLocation';

interface AttendanceCaptureProps {
    endpoint: string;
    headers?: Record<string, string>;
    label?: string;
}

interface QueuedItem {
    id: string;
    endpoint: string;
    headers: Record<string, string>;
    body: any;
    timestamp: number;
}

export default function AttendanceCapture({ endpoint, headers = {}, label = 'Check In' }: AttendanceCaptureProps) {
    const { getLocation, loading: locationLoading, error: locationError } = useGeoLocation();
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
    const [queueLength, setQueueLength] = useState(0);

    const QUEUE_KEY = 'attendance_queue';

    useEffect(() => {
        // Load initial queue size
        updateQueueLength();

        // Listen for online events to sync
        window.addEventListener('online', syncQueue);
        return () => window.removeEventListener('online', syncQueue);
    }, []);

    const updateQueueLength = () => {
        const queue: QueuedItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        setQueueLength(queue.length);
    };

    const syncQueue = async () => {
        if (!navigator.onLine) return;

        const queue: QueuedItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        if (queue.length === 0) return;

        setStatus({ type: 'warning', message: `Syncing ${queue.length} offline records...` });

        const remaining: QueuedItem[] = [];

        for (const item of queue) {
            try {
                const res = await fetch(item.endpoint, {
                    method: 'POST',
                    headers: item.headers,
                    body: JSON.stringify(item.body)
                });

                if (!res.ok) {
                    // Check if 4xx error (logic error), don't retry?
                    // For now, if 5xx or network, keep it.
                    // If 403 Forbidden (Geo blocked), maybe discard and log?
                    // Safe approach: keep unless 2xx. 
                    // But if it's a permanent error, we might jam the queue.
                    // Let's assume text response explains it.
                    // For now, we only retry if it looks like a network glitch.
                    // If status is 4xx, we likely remove it.
                    if (res.status >= 400 && res.status < 500) {
                        console.error('Failed to sync item, discarding:', await res.text());
                    } else {
                        remaining.push(item);
                    }
                }
            } catch (e) {
                remaining.push(item); // Network error likely
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
        updateQueueLength();

        if (remaining.length === 0) {
            setStatus({ type: 'success', message: 'All offline records synced!' });
            setTimeout(() => setStatus(null), 3000);
        } else {
            setStatus({ type: 'warning', message: `${remaining.length} items still pending sync.` });
        }
    };

    const handleCheckIn = async () => {
        setSubmitting(true);
        setStatus(null);

        try {
            const loc = await getLocation();
            if (loc.error) {
                setStatus({ type: 'error', message: `Location Error: ${loc.error}` });
                setSubmitting(false);
                return;
            }

            const geoPayload = {
                lat: loc.lat,
                lng: loc.lng,
                accuracy: loc.accuracy,
                timestamp: loc.timestamp
            };

            const body = { geo: geoPayload };

            if (!navigator.onLine) {
                // Queue it
                const item: QueuedItem = {
                    id: Date.now().toString(),
                    endpoint,
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body,
                    timestamp: Date.now()
                };

                const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
                queue.push(item);
                localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
                updateQueueLength();

                setStatus({ type: 'warning', message: 'Offline: Attendance stored. Will sync when online.' });
                setSubmitting(false);
                return;
            }

            // Online attempt
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Check-in failed');
            }

            setStatus({ type: 'success', message: 'Checked in successfully!' });

        } catch (e: any) {
            let msg = e.message || 'Failed to check in';
            if (msg.includes('GEO_')) msg = `Security Check Failed: ${msg}`;
            // If Fetch Failed (Network Error) and we are nominally online?
            // Maybe queue here too?
            if (e.message === 'Failed to fetch') {
                // Try queuing
                // Duplicate logic, should refactor. For now, just show error.
                setStatus({ type: 'error', message: 'Connection failed. Please check internet.' });
            } else {
                setStatus({ type: 'error', message: msg });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">{label}</h3>

            {status && (
                <div className={`mb-4 p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' :
                        status.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {status.message}
                </div>
            )}

            {queueLength > 0 && !status && (
                <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-xs rounded flex justify-between items-center">
                    <span>{queueLength} offline records pending.</span>
                    <button onClick={syncQueue} className="underline hover:no-underline font-medium">Sync Now</button>
                </div>
            )}

            <button
                onClick={handleCheckIn}
                disabled={submitting || locationLoading}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors
                    ${submitting || locationLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md transform active:scale-95'}
                `}
            >
                {submitting || locationLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {locationLoading ? 'Getting Location...' : 'Checking In...'}
                    </span>
                ) : (
                    label
                )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
                Your location will be verified for attendance.
            </p>
        </div>
    );
}
