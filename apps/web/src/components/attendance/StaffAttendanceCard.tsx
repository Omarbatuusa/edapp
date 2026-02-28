'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, LogIn, LogOut, Timer } from 'lucide-react';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { attendanceQueue, generateIdempotencyKey } from '../../lib/attendance-offline-queue';
import { apiClient } from '../../lib/api-client';
import SyncCenter from './SyncCenter';

interface StaffAttendanceCardProps {
    branchId: string;
}

export default function StaffAttendanceCard({ branchId }: StaffAttendanceCardProps) {
    const { getLocation } = useGeoLocation();
    const [loading, setLoading] = useState(false);
    const [todayData, setTodayData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [elapsedHours, setElapsedHours] = useState<string>('0.0');

    const fetchToday = useCallback(async () => {
        try {
            const res = await apiClient.get(`/attendance/staff/today?branch_id=${branchId}`);
            if (res.data?.status === 'success') {
                setTodayData(res.data);
            }
        } catch {
            // Offline or not authenticated
        }
    }, [branchId]);

    useEffect(() => {
        fetchToday();
        const interval = setInterval(fetchToday, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchToday]);

    // Live hours counter
    useEffect(() => {
        if (!todayData?.checked_in || !todayData?.check_in_time) return;

        const updateElapsed = () => {
            const checkIn = new Date(todayData.check_in_time).getTime();
            const now = Date.now();
            const hours = (now - checkIn) / 3600000;
            setElapsedHours(hours.toFixed(1));
        };

        updateElapsed();
        const timer = setInterval(updateElapsed, 60000);
        return () => clearInterval(timer);
    }, [todayData?.checked_in, todayData?.check_in_time]);

    const handleAction = async (action: 'check-in' | 'check-out') => {
        setLoading(true);
        setError(null);

        try {
            const loc = await getLocation();
            const geo = loc.error ? undefined : { lat: loc.lat!, lng: loc.lng!, accuracy: loc.accuracy! };
            const idempotency_key = generateIdempotencyKey();

            if (!navigator.onLine) {
                await attendanceQueue.enqueue({
                    idempotency_key,
                    tenant_id: '',
                    branch_id: branchId,
                    subject_type: 'STAFF',
                    subject_user_id: '',
                    event_type: action === 'check-in' ? 'CHECK_IN' : 'CHECK_OUT',
                    source: 'PWA_GEO',
                    captured_at_device: new Date().toISOString(),
                    captured_lat: geo?.lat,
                    captured_lng: geo?.lng,
                    captured_accuracy_m: geo?.accuracy,
                });
                setError('Offline: Saved locally. Will sync when online.');
                setLoading(false);
                return;
            }

            const endpoint = `/attendance/staff/${action}`;
            const res = await apiClient.post(endpoint, {
                branch_id: branchId,
                geo,
                idempotency_key,
            });

            if (res.data?.status === 'success') {
                fetchToday();
            } else {
                setError(res.data?.message || 'Failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const isCheckedIn = todayData?.checked_in;
    const checkInTime = todayData?.check_in_time
        ? new Date(todayData.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div className="ios-card space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-semibold tracking-tight flex items-center gap-2">
                    <Clock size={20} className="text-[hsl(var(--admin-primary))]" />
                    Attendance
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCheckedIn
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                }`}>
                    {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                </div>
            </div>

            {checkInTime && (
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[hsl(var(--admin-surface))] rounded-2xl">
                        <p className="text-xs text-[hsl(var(--admin-text-sub))]">In</p>
                        <p className="text-lg font-bold">{checkInTime}</p>
                    </div>
                    <div className="p-3 bg-[hsl(var(--admin-surface))] rounded-2xl">
                        <p className="text-xs text-[hsl(var(--admin-text-sub))]">Hours</p>
                        <p className="text-lg font-bold">{isCheckedIn ? elapsedHours : (todayData?.hours_worked || 0)}</p>
                    </div>
                    <div className="p-3 bg-[hsl(var(--admin-surface))] rounded-2xl">
                        <p className="text-xs text-[hsl(var(--admin-text-sub))]">Late</p>
                        <p className={`text-lg font-bold ${(todayData?.late_minutes || 0) > 0 ? 'text-red-500' : ''}`}>
                            {todayData?.late_minutes || 0}m
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className={`p-2 rounded-xl text-xs ${error.includes('Offline') ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                    {error}
                </div>
            )}

            <button
                onClick={() => handleAction(isCheckedIn ? 'check-out' : 'check-in')}
                disabled={loading}
                className={`w-full py-3 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' :
                    isCheckedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
            >
                {loading ? (
                    <Timer size={18} className="animate-spin" />
                ) : isCheckedIn ? (
                    <><LogOut size={18} /> Check Out</>
                ) : (
                    <><LogIn size={18} /> Check In</>
                )}
            </button>

            <SyncCenter />
        </div>
    );
}
