'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Flag, Search } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../../../../lib/api-client';

interface ExceptionItem {
    id: string;
    subject_user_id: string;
    learner_name?: string;
    date: string;
    status: string;
    flags: {
        missing_checkout?: boolean;
        outside_policy?: boolean;
        overridden?: boolean;
        register_conflict?: boolean;
    };
    earliest_check_in?: string;
    latest_check_out?: string;
    late_minutes: number;
}

export default function ExceptionsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [branchId, setBranchId] = useState('');
    const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'missing_checkout' | 'outside_policy' | 'register_conflict'>('all');
    const [resolving, setResolving] = useState<string | null>(null);
    const [resolveReason, setResolveReason] = useState('');
    const [showResolveFor, setShowResolveFor] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get('/auth/me').then(res => {
            if (res.data?.branch_id) setBranchId(res.data.branch_id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!branchId) return;
        setLoading(true);
        const flagParam = filter !== 'all' ? `&flag=${filter}` : '';
        apiClient.get(`/attendance/exceptions?branch_id=${branchId}${flagParam}`)
            .then(res => {
                if (res.data?.status === 'success') {
                    setExceptions(res.data.exceptions || []);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [branchId, filter]);

    const handleResolve = async (summaryId: string) => {
        if (!resolveReason.trim()) return;
        setResolving(summaryId);
        try {
            const res = await apiClient.patch(`/attendance/exceptions/${summaryId}/resolve`, {
                reason: resolveReason,
                new_status: 'PRESENT',
            });
            if (res.data?.status === 'success') {
                setExceptions(prev => prev.filter(e => e.id !== summaryId));
                setShowResolveFor(null);
                setResolveReason('');
            }
        } catch {
            // Silent
        } finally {
            setResolving(null);
        }
    };

    const getFlagBadge = (flags: ExceptionItem['flags']) => {
        if (flags.missing_checkout) return { label: 'Missing Checkout', color: 'bg-red-100 text-red-700' };
        if (flags.outside_policy) return { label: 'Outside Policy', color: 'bg-amber-100 text-amber-700' };
        if (flags.register_conflict) return { label: 'Register Conflict', color: 'bg-purple-100 text-purple-700' };
        if (flags.overridden) return { label: 'Overridden', color: 'bg-blue-100 text-blue-700' };
        return { label: 'Flagged', color: 'bg-gray-100 text-gray-700' };
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href={`/tenant/${slug}/admin/attendance`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">
                        Attendance Exceptions
                    </h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">
                        Flagged events requiring review
                    </p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'missing_checkout', label: 'Missing Checkout' },
                    { key: 'outside_policy', label: 'Outside Policy' },
                    { key: 'register_conflict', label: 'Register Conflict' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                            filter === tab.key
                                ? 'bg-[hsl(var(--admin-primary))] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Exception list */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : exceptions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg">No Exceptions</h3>
                    <p className="text-sm text-gray-500">All attendance records look good.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {exceptions.map(ex => {
                        const badge = getFlagBadge(ex.flags);
                        return (
                            <div key={ex.id} className="ios-card">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Flag size={14} className="text-amber-500" />
                                            <span className="font-semibold text-sm">
                                                {ex.learner_name || ex.subject_user_id}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span>Date: {ex.date}</span>
                                            <span>Status: {ex.status}</span>
                                            {ex.earliest_check_in && <span>In: {ex.earliest_check_in}</span>}
                                            {ex.latest_check_out && <span>Out: {ex.latest_check_out}</span>}
                                            {ex.late_minutes > 0 && <span className="text-red-500">Late: {ex.late_minutes}m</span>}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowResolveFor(showResolveFor === ex.id ? null : ex.id)}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                                    >
                                        Resolve
                                    </button>
                                </div>

                                {showResolveFor === ex.id && (
                                    <div className="mt-3 pt-3 border-t flex gap-2">
                                        <input
                                            type="text"
                                            value={resolveReason}
                                            onChange={e => setResolveReason(e.target.value)}
                                            placeholder="Override reason..."
                                            className="flex-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleResolve(ex.id)}
                                            disabled={resolving === ex.id || !resolveReason.trim()}
                                            className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
                                        >
                                            {resolving === ex.id ? '...' : 'Confirm'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
