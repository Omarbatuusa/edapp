'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Clock, AlertTriangle, CheckCircle, UserX, ChevronRight, FileText, Shield } from 'lucide-react';
import { apiClient } from '../../../../../../lib/api-client';
import EarlyLeaveForm from '../../../../../../components/attendance/EarlyLeaveForm';

interface DashboardStats {
    total_learners: number;
    present: number;
    absent: number;
    late: number;
    early_leave: number;
    missing_checkout: number;
}

interface EarlyLeaveReq {
    id: string;
    learner_name: string;
    reason: string;
    pickup_person_name: string;
    pickup_person_relation: string;
    status: string;
    created_at: string;
}

export default function AdminAttendancePage() {
    const params = useParams();
    const slug = params.slug as string;
    const [branchId, setBranchId] = useState('');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [earlyLeaveRequests, setEarlyLeaveRequests] = useState<EarlyLeaveReq[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEarlyLeaveForm, setShowEarlyLeaveForm] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        apiClient.get('/auth/me').then(res => {
            if (res.data?.branch_id) setBranchId(res.data.branch_id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!branchId) return;
        const load = async () => {
            try {
                const [learnersRes, earlyRes] = await Promise.all([
                    apiClient.get(`/attendance/learner/branch?branch_id=${branchId}&date=${today}`).catch(() => null),
                    apiClient.get(`/attendance/early-leave?branch_id=${branchId}&status=PENDING`).catch(() => null),
                ]);

                if (learnersRes?.data?.status === 'success') {
                    const learners = learnersRes.data.learners || [];
                    setStats({
                        total_learners: learners.length,
                        present: learners.filter((l: any) => l.status === 'PRESENT' || l.status === 'LATE').length,
                        absent: learners.filter((l: any) => l.status === 'ABSENT' || l.status === 'UNKNOWN').length,
                        late: learners.filter((l: any) => l.status === 'LATE').length,
                        early_leave: learners.filter((l: any) => l.status === 'EARLY_PICKUP').length,
                        missing_checkout: learners.filter((l: any) => l.flags?.missing_checkout).length,
                    });
                }

                if (earlyRes?.data?.status === 'success') {
                    setEarlyLeaveRequests(earlyRes.data.requests || []);
                }
            } catch {
                // Silent
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [branchId, today]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await apiClient.patch(`/attendance/early-leave/${id}/approve`);
            if (res.data?.status === 'success') {
                setEarlyLeaveRequests(prev => prev.filter(r => r.id !== id));
            }
        } catch {
            // Silent
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await apiClient.patch(`/attendance/early-leave/${id}/reject`, { reason: 'Rejected by admin' });
            if (res.data?.status === 'success') {
                setEarlyLeaveRequests(prev => prev.filter(r => r.id !== id));
            }
        } catch {
            // Silent
        } finally {
            setActionLoading(null);
        }
    };

    const attendanceRate = stats && stats.total_learners > 0
        ? Math.round((stats.present / stats.total_learners) * 100)
        : 0;

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-1">
                        Attendance Dashboard
                    </h1>
                    <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))]">
                        Today's overview &bull; {today}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/tenant/${slug}/admin/attendance/exceptions`}
                        className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-bold hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                        <AlertTriangle size={14} /> Exceptions
                    </Link>
                    <Link
                        href={`/tenant/${slug}/reports/attendance`}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                        <FileText size={14} /> Reports
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="ios-card text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users size={20} className="text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold">{stats?.total_learners ?? '-'}</p>
                    <p className="text-xs text-gray-500">Total Learners</p>
                </div>
                <div className="ios-card text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats?.present ?? '-'}</p>
                    <p className="text-xs text-gray-500">Present ({attendanceRate}%)</p>
                </div>
                <div className="ios-card text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <UserX size={20} className="text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-red-500">{stats?.absent ?? '-'}</p>
                    <p className="text-xs text-gray-500">Absent</p>
                </div>
                <div className="ios-card text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock size={20} className="text-amber-600" />
                    </div>
                    <p className="text-3xl font-bold text-amber-600">{stats?.late ?? '-'}</p>
                    <p className="text-xs text-gray-500">Late</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Early Leave Requests */}
                <div className="ios-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[17px] font-semibold flex items-center gap-2">
                            <Shield size={18} className="text-orange-500" />
                            Pending Early Leave ({earlyLeaveRequests.length})
                        </h2>
                        <button
                            type="button"
                            onClick={() => setShowEarlyLeaveForm(!showEarlyLeaveForm)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                            {showEarlyLeaveForm ? 'Hide Form' : 'New Request'}
                        </button>
                    </div>

                    {showEarlyLeaveForm && branchId && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                            <EarlyLeaveForm
                                branchId={branchId}
                                onSuccess={() => {
                                    setShowEarlyLeaveForm(false);
                                    // Refresh
                                    apiClient.get(`/attendance/early-leave?branch_id=${branchId}&status=PENDING`)
                                        .then(res => {
                                            if (res.data?.status === 'success') {
                                                setEarlyLeaveRequests(res.data.requests || []);
                                            }
                                        }).catch(() => {});
                                }}
                            />
                        </div>
                    )}

                    {earlyLeaveRequests.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
                    ) : (
                        <div className="space-y-3">
                            {earlyLeaveRequests.map(req => (
                                <div key={req.id} className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-sm">{req.learner_name || req.id}</p>
                                            <p className="text-xs text-gray-500">{req.reason}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Pickup: {req.pickup_person_name} ({req.pickup_person_relation})
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(req.id)}
                                            disabled={actionLoading === req.id}
                                            className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReject(req.id)}
                                            disabled={actionLoading === req.id}
                                            className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links + Alerts */}
                <div className="space-y-4">
                    {/* Alerts */}
                    {stats && stats.missing_checkout > 0 && (
                        <div className="ios-card bg-amber-50 border-amber-200">
                            <div className="flex items-center gap-2 text-amber-700">
                                <AlertTriangle size={18} />
                                <span className="font-bold text-sm">
                                    {stats.missing_checkout} learner{stats.missing_checkout !== 1 ? 's' : ''} missing checkout
                                </span>
                            </div>
                            <Link
                                href={`/tenant/${slug}/admin/attendance/exceptions`}
                                className="text-xs font-bold text-amber-800 mt-2 inline-flex items-center gap-1 hover:underline"
                            >
                                View exceptions <ChevronRight size={12} />
                            </Link>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="ios-card">
                        <h2 className="text-[17px] font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link
                                href={`/tenant/${slug}/reports/attendance`}
                                className="p-3 bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] rounded-xl flex items-center justify-between transition-colors"
                            >
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <FileText size={16} className="text-blue-500" /> Generate Reports
                                </span>
                                <ChevronRight size={16} className="text-gray-400" />
                            </Link>
                            <Link
                                href={`/tenant/${slug}/settings/attendance`}
                                className="p-3 bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] rounded-xl flex items-center justify-between transition-colors"
                            >
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <Clock size={16} className="text-purple-500" /> Attendance Policy
                                </span>
                                <ChevronRight size={16} className="text-gray-400" />
                            </Link>
                            <Link
                                href={`/tenant/${slug}/gate`}
                                className="p-3 bg-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-surface-alt))] rounded-xl flex items-center justify-between transition-colors"
                            >
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <Shield size={16} className="text-green-500" /> Gate Kiosk
                                </span>
                                <ChevronRight size={16} className="text-gray-400" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
