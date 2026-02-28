'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Wifi, WifiOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { attendanceQueue, PendingAttendanceEvent } from '../../lib/attendance-offline-queue';
import { apiClient } from '../../lib/api-client';

export default function SyncCenter() {
    const [queueCount, setQueueCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [online, setOnline] = useState(true);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const updateCount = useCallback(async () => {
        try {
            const count = await attendanceQueue.count();
            setQueueCount(count);
        } catch {
            // IndexedDB not available
        }
    }, []);

    useEffect(() => {
        setOnline(navigator.onLine);
        updateCount();

        const handleOnline = () => { setOnline(true); syncQueue(); };
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const interval = setInterval(updateCount, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [updateCount]);

    const syncQueue = async () => {
        if (syncing || !navigator.onLine) return;
        setSyncing(true);
        setError(null);

        try {
            const events = await attendanceQueue.getAll();
            if (events.length === 0) {
                setSyncing(false);
                return;
            }

            const response = await apiClient.post('/sync/push', { events });

            if (response.data?.status === 'success') {
                // Remove synced events
                for (const result of response.data.results || []) {
                    if (result.status === 'created' || result.status === 'duplicate') {
                        await attendanceQueue.dequeue(result.idempotency_key);
                    }
                }
                setLastSync(new Date().toLocaleTimeString());
            }
        } catch (err: any) {
            setError(err.message || 'Sync failed');
        } finally {
            setSyncing(false);
            updateCount();
        }
    };

    if (queueCount === 0 && !error) {
        return (
            <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle size={14} />
                <span>All synced</span>
                {lastSync && <span className="text-gray-400">({lastSync})</span>}
            </div>
        );
    }

    return (
        <div className="p-3 rounded-xl border bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {online ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
                    <span className="text-sm font-medium">
                        {online ? 'Online' : 'Offline'}
                    </span>
                </div>
                <span className="text-xs text-gray-500">
                    {lastSync ? `Last sync: ${lastSync}` : 'Not synced yet'}
                </span>
            </div>

            {queueCount > 0 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {queueCount} event{queueCount !== 1 ? 's' : ''} pending
                    </span>
                    <button
                        onClick={syncQueue}
                        disabled={syncing || !online}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
