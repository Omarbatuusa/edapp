'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, Clock, Users, Send, CheckCircle } from 'lucide-react';
import { apiClient } from '../../../../../../../lib/api-client';

type MarkStatus = 'PRESENT' | 'ABSENT' | 'LATE';

interface LearnerMark {
    learner_user_id: string;
    name: string;
    student_number?: string;
    status: MarkStatus;
    notes: string;
    gate_status?: string;
}

export default function ClassRegisterPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId as string;
    const slug = params.slug as string;

    const [classInfo, setClassInfo] = useState<any>(null);
    const [marks, setMarks] = useState<LearnerMark[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingRegister, setExistingRegister] = useState<any>(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch class info and learners
                const [classRes, registerRes] = await Promise.all([
                    apiClient.get(`/classes/${classId}`),
                    apiClient.get(`/attendance/register/${classId}/${today}`).catch(() => null),
                ]);

                if (classRes.data?.status === 'success') {
                    const cls = classRes.data.class;
                    setClassInfo(cls);

                    // If existing register, load it
                    if (registerRes?.data?.status === 'success' && registerRes.data.register) {
                        const reg = registerRes.data.register;
                        setExistingRegister(reg);
                        setMarks(reg.marks.map((m: any) => ({
                            learner_user_id: m.learner_user_id,
                            name: m.name || m.learner_user_id,
                            status: m.status,
                            notes: m.notes || '',
                        })));
                    } else {
                        // Build blank register from class learner list
                        const learnerIds: string[] = cls.learner_user_ids || [];
                        setMarks(learnerIds.map((id: string) => ({
                            learner_user_id: id,
                            name: id,
                            status: 'PRESENT' as MarkStatus,
                            notes: '',
                        })));
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load class data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [classId, today]);

    const setMarkStatus = (index: number, status: MarkStatus) => {
        setMarks(prev => prev.map((m, i) => i === index ? { ...m, status } : m));
    };

    const markAllPresent = () => {
        setMarks(prev => prev.map(m => ({ ...m, status: 'PRESENT' })));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await apiClient.post('/attendance/register', {
                class_id: classId,
                date: today,
                marks: marks.map(m => ({
                    learner_user_id: m.learner_user_id,
                    status: m.status,
                    notes: m.notes || undefined,
                })),
            });
            if (res.data?.status === 'success') {
                setSubmitted(true);
            } else {
                setError(res.data?.message || 'Failed to submit register');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto text-center py-20">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Register Submitted</h2>
                <p className="text-gray-500 mb-6">
                    {marks.filter(m => m.status === 'PRESENT').length} present,{' '}
                    {marks.filter(m => m.status === 'ABSENT').length} absent,{' '}
                    {marks.filter(m => m.status === 'LATE').length} late
                </p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-[hsl(var(--admin-primary))] text-white rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button type="button" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Go back">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">
                        Class Register
                    </h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">
                        {classInfo?.section_name || classInfo?.class_code} &bull; {today}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="ios-card text-center p-3">
                    <p className="text-2xl font-bold text-green-600">{marks.filter(m => m.status === 'PRESENT').length}</p>
                    <p className="text-xs text-gray-500">Present</p>
                </div>
                <div className="ios-card text-center p-3">
                    <p className="text-2xl font-bold text-red-500">{marks.filter(m => m.status === 'ABSENT').length}</p>
                    <p className="text-xs text-gray-500">Absent</p>
                </div>
                <div className="ios-card text-center p-3">
                    <p className="text-2xl font-bold text-amber-500">{marks.filter(m => m.status === 'LATE').length}</p>
                    <p className="text-xs text-gray-500">Late</p>
                </div>
            </div>

            {/* Bulk actions */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={markAllPresent}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold hover:bg-green-200 transition-colors"
                >
                    Mark All Present
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Users size={14} />
                    {marks.length} learners
                </div>
            </div>

            {/* Learner list */}
            <div className="space-y-2">
                {marks.map((mark, index) => (
                    <div
                        key={mark.learner_user_id}
                        className={`p-3 rounded-xl border transition-colors ${
                            mark.status === 'PRESENT' ? 'bg-green-50 border-green-200' :
                            mark.status === 'ABSENT' ? 'bg-red-50 border-red-200' :
                            'bg-amber-50 border-amber-200'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium flex-1 min-w-0 truncate">
                                {mark.name}
                            </span>
                            {mark.gate_status && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                    Gate: {mark.gate_status}
                                </span>
                            )}
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setMarkStatus(index, 'PRESENT')}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                        mark.status === 'PRESENT'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white border hover:bg-green-50'
                                    }`}
                                    title="Present"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMarkStatus(index, 'ABSENT')}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                        mark.status === 'ABSENT'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white border hover:bg-red-50'
                                    }`}
                                    title="Absent"
                                >
                                    <X size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMarkStatus(index, 'LATE')}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                        mark.status === 'LATE'
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-white border hover:bg-amber-50'
                                    }`}
                                    title="Late"
                                >
                                    <Clock size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || marks.length === 0}
                className="w-full py-4 bg-[hsl(var(--admin-primary))] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
                <Send size={18} />
                {submitting ? 'Submitting...' : existingRegister ? 'Update Register' : 'Submit Register'}
            </button>
        </div>
    );
}
