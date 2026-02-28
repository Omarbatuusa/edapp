'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Clock, Shield, Wifi, Monitor } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../../../lib/api-client';

interface PolicyForm {
    working_days: string[];
    school_start_time: string;
    school_end_time: string;
    staff_shift_start: string;
    staff_shift_end: string;
    grace_minutes: number;
    overtime_grace_minutes: number;
    late_threshold_minutes: number;
    missing_checkout_cutoff_minutes: number;
    anti_passback_minutes: number;
}

interface DeviceItem {
    id: string;
    device_code: string;
    device_name: string;
    location_label: string;
    scan_point_type: string;
    is_active: boolean;
    last_heartbeat_at?: string;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function AttendanceSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [branchId, setBranchId] = useState('');
    const [policy, setPolicy] = useState<PolicyForm>({
        working_days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        school_start_time: '07:30',
        school_end_time: '14:30',
        staff_shift_start: '07:00',
        staff_shift_end: '16:00',
        grace_minutes: 10,
        overtime_grace_minutes: 15,
        late_threshold_minutes: 0,
        missing_checkout_cutoff_minutes: 480,
        anti_passback_minutes: 5,
    });
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'policy' | 'devices'>('policy');

    useEffect(() => {
        apiClient.get('/auth/me').then(res => {
            if (res.data?.branch_id) setBranchId(res.data.branch_id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!branchId) return;

        // Load existing policy
        apiClient.get(`/sync/pull?branch_id=${branchId}`).then(res => {
            if (res.data?.status === 'success' && res.data.policy) {
                const p = res.data.policy;
                setPolicy({
                    working_days: p.working_days || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
                    school_start_time: p.school_start_time || '07:30',
                    school_end_time: p.school_end_time || '14:30',
                    staff_shift_start: p.staff_shift_start || '07:00',
                    staff_shift_end: p.staff_shift_end || '16:00',
                    grace_minutes: p.grace_minutes ?? 10,
                    overtime_grace_minutes: p.overtime_grace_minutes ?? 15,
                    late_threshold_minutes: p.late_threshold_minutes ?? 0,
                    missing_checkout_cutoff_minutes: p.missing_checkout_cutoff_minutes ?? 480,
                    anti_passback_minutes: p.anti_passback_minutes ?? 5,
                });
            }
        }).catch(() => {});

        // Load devices
        apiClient.get(`/attendance/kiosk/devices?branch_id=${branchId}`).then(res => {
            if (res.data?.status === 'success') {
                setDevices(res.data.devices || []);
            }
        }).catch(() => {});
    }, [branchId]);

    const handleSavePolicy = async () => {
        setSaving(true);
        setError(null);
        try {
            // The policy endpoint would be an upsert
            const res = await apiClient.post('/attendance/override/summary/policy', {
                branch_id: branchId,
                ...policy,
            });
            if (res.data?.status === 'success') {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(res.data?.message || 'Failed to save');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save policy');
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: string) => {
        setPolicy(prev => ({
            ...prev,
            working_days: prev.working_days.includes(day)
                ? prev.working_days.filter(d => d !== day)
                : [...prev.working_days, day],
        }));
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href={`/tenant/${slug}/admin/attendance`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">
                        Attendance Settings
                    </h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">
                        Configure attendance policy and manage kiosk devices
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('policy')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors ${
                        activeTab === 'policy'
                            ? 'bg-[hsl(var(--admin-primary))] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Clock size={14} /> Policy
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('devices')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors ${
                        activeTab === 'devices'
                            ? 'bg-[hsl(var(--admin-primary))] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Monitor size={14} /> Devices ({devices.length})
                </button>
            </div>

            {/* Policy Tab */}
            {activeTab === 'policy' && (
                <div className="space-y-4">
                    {/* Working Days */}
                    <div className="ios-card">
                        <h3 className="font-semibold text-sm mb-3">Working Days</h3>
                        <div className="flex gap-2 flex-wrap">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                        policy.working_days.includes(day)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* School Times */}
                    <div className="ios-card">
                        <h3 className="font-semibold text-sm mb-3">School Hours</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">School Start</label>
                                <input
                                    type="time"
                                    value={policy.school_start_time}
                                    onChange={e => setPolicy(p => ({ ...p, school_start_time: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">School End</label>
                                <input
                                    type="time"
                                    value={policy.school_end_time}
                                    onChange={e => setPolicy(p => ({ ...p, school_end_time: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Staff Shift Times */}
                    <div className="ios-card">
                        <h3 className="font-semibold text-sm mb-3">Staff Shift Hours</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">Shift Start</label>
                                <input
                                    type="time"
                                    value={policy.staff_shift_start}
                                    onChange={e => setPolicy(p => ({ ...p, staff_shift_start: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Shift End</label>
                                <input
                                    type="time"
                                    value={policy.staff_shift_end}
                                    onChange={e => setPolicy(p => ({ ...p, staff_shift_end: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grace Periods */}
                    <div className="ios-card">
                        <h3 className="font-semibold text-sm mb-3">Grace Periods & Thresholds</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">Grace (min)</label>
                                <input
                                    type="number"
                                    value={policy.grace_minutes}
                                    onChange={e => setPolicy(p => ({ ...p, grace_minutes: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">OT Grace (min)</label>
                                <input
                                    type="number"
                                    value={policy.overtime_grace_minutes}
                                    onChange={e => setPolicy(p => ({ ...p, overtime_grace_minutes: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Anti-Passback (min)</label>
                                <input
                                    type="number"
                                    value={policy.anti_passback_minutes}
                                    onChange={e => setPolicy(p => ({ ...p, anti_passback_minutes: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Late Threshold (min)</label>
                                <input
                                    type="number"
                                    value={policy.late_threshold_minutes}
                                    onChange={e => setPolicy(p => ({ ...p, late_threshold_minutes: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Missing Checkout Cutoff (min)</label>
                                <input
                                    type="number"
                                    value={policy.missing_checkout_cutoff_minutes}
                                    onChange={e => setPolicy(p => ({ ...p, missing_checkout_cutoff_minutes: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {saved && <p className="text-sm text-green-600">Policy saved successfully!</p>}

                    <button
                        type="button"
                        onClick={handleSavePolicy}
                        disabled={saving}
                        className="w-full py-3 bg-[hsl(var(--admin-primary))] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Policy'}
                    </button>
                </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
                <div className="space-y-4">
                    {devices.length === 0 ? (
                        <div className="ios-card text-center py-8">
                            <Monitor size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="font-bold text-gray-500">No Kiosk Devices</p>
                            <p className="text-sm text-gray-400">Devices register automatically when they first connect.</p>
                        </div>
                    ) : (
                        devices.map(device => (
                            <div key={device.id} className="ios-card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm">{device.device_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {device.location_label} &bull; {device.scan_point_type} &bull; Code: {device.device_code}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {device.last_heartbeat_at && (
                                            <span className="text-xs text-gray-400">
                                                Last seen: {new Date(device.last_heartbeat_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        <span className={`w-3 h-3 rounded-full ${device.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
