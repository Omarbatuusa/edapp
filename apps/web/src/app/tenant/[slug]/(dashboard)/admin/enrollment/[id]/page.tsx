'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Props { params: Promise<{ slug: string; id: string }> }

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    WAITLISTED: 'bg-violet-100 text-violet-700',
};

export default function EnrollmentDetailPage({ params }: Props) {
    const { slug, id } = use(params);
    const router = useRouter();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';

    const fetchApp = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/enrollment/${id}`, { headers: getAuthHeaders() });
            if (res.ok) setApp(await res.json());
        } catch {} finally {
            setLoading(false);
        }
    }, [tenantId, id]);

    useEffect(() => { fetchApp(); }, [fetchApp]);

    const handleApprove = async () => {
        if (!tenantId) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/enrollment/${id}/approve`, {
                method: 'POST', headers: getAuthHeaders(),
            });
            if (res.ok) { await fetchApp(); }
            else { const err = await res.json(); alert(err.message || 'Failed to approve'); }
        } catch {} finally { setActionLoading(false); }
    };

    const handleReject = async () => {
        if (!tenantId || !rejectReason.trim()) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/enrollment/${id}/reject`, {
                method: 'POST', headers: getAuthHeaders(),
                body: JSON.stringify({ reason: rejectReason }),
            });
            if (res.ok) { setShowReject(false); await fetchApp(); }
            else { const err = await res.json(); alert(err.message || 'Failed to reject'); }
        } catch {} finally { setActionLoading(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[hsl(var(--admin-primary))] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!app) {
        return (
            <div className="p-6 text-center">
                <p className="text-[hsl(var(--admin-text-muted))]">Application not found.</p>
            </div>
        );
    }

    const canAct = ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status);
    const learner = app.learner_data || {};
    const guardians = app.guardians_data || [];
    const contacts = app.emergency_contacts || [];
    const medical = app.medical_data || {};
    const placement = app.placement_data || {};

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button type="button" onClick={() => router.push(`/tenant/${slug}/admin/enrollment`)} className="text-sm text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))] flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to list
                    </button>
                    <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">
                        {learner.first_name || 'Draft'} {learner.surname || 'Application'}
                    </h1>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[app.status] || STATUS_COLORS.DRAFT}`}>
                    {app.status.replace('_', ' ')}
                </span>
            </div>

            {/* Action buttons */}
            {canAct && (
                <div className="ios-card p-4 flex items-center gap-3">
                    <button type="button" onClick={handleApprove} disabled={actionLoading} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-colors">
                        {actionLoading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">check</span>}
                        Approve
                    </button>
                    <button type="button" onClick={() => setShowReject(!showReject)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span> Reject
                    </button>
                    {showReject && (
                        <div className="flex-1 flex items-center gap-2">
                            <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="flex-1 px-3 py-2 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] text-sm" />
                            <button type="button" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">Confirm</button>
                        </div>
                    )}
                </div>
            )}

            {app.status === 'REJECTED' && app.rejection_reason && (
                <div className="ios-card p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{app.rejection_reason}</p>
                </div>
            )}

            {/* Placement */}
            <div className="ios-card p-4">
                <p className="text-xs font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider mb-3">Placement</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-[hsl(var(--admin-text-muted))]">Phase:</span> <span className="font-medium">{placement.phase_code || '\u2014'}</span></div>
                    <div><span className="text-[hsl(var(--admin-text-muted))]">Grade:</span> <span className="font-medium">{placement.grade_code || '\u2014'}</span></div>
                    <div><span className="text-[hsl(var(--admin-text-muted))]">Class:</span> <span className="font-medium">{placement.class_id?.slice(0, 8) || '\u2014'}</span></div>
                </div>
            </div>

            {/* Learner Details */}
            <div className="ios-card p-4">
                <p className="text-xs font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider mb-3">Learner Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                        { label: 'First Name', value: learner.first_name },
                        { label: 'Surname', value: learner.surname },
                        { label: 'Date of Birth', value: learner.dob },
                        { label: 'Gender', value: learner.gender_code },
                        { label: 'Citizenship', value: learner.citizenship_type },
                        { label: 'SA ID', value: learner.sa_id_number },
                        { label: 'Passport', value: learner.passport_number },
                        { label: 'Race', value: learner.race_code },
                    ].filter(i => i.value).map(item => (
                        <div key={item.label}>
                            <span className="text-[hsl(var(--admin-text-muted))]">{item.label}:</span>{' '}
                            <span className="font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guardians */}
            {guardians.length > 0 && (
                <div className="ios-card p-4">
                    <p className="text-xs font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider mb-3">Guardians ({guardians.length})</p>
                    <div className="space-y-3">
                        {guardians.map((g: any, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-sm">
                                <p className="font-medium">{g.first_name} {g.surname}</p>
                                <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                                    {g.email} {g.mobile_whatsapp?.e164 && `| ${g.mobile_whatsapp.e164}`}
                                    {g.is_fee_payer && <span className="ml-2 text-blue-600 font-semibold">Fee Payer</span>}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Emergency Contacts */}
            {contacts.length > 0 && (
                <div className="ios-card p-4">
                    <p className="text-xs font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider mb-3">Emergency Contacts ({contacts.length})</p>
                    <div className="space-y-2">
                        {contacts.map((c: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-sm">
                                <span className="text-xs font-semibold text-[hsl(var(--admin-text-muted))] w-6">#{c.priority_level || i + 1}</span>
                                <div>
                                    <p className="font-medium">{c.full_name}</p>
                                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">{c.mobile_number?.e164 || c.email || ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Medical */}
            {Object.keys(medical).length > 0 && (
                <div className="ios-card p-4">
                    <p className="text-xs font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider mb-3">Medical Details</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {medical.blood_type && <div><span className="text-[hsl(var(--admin-text-muted))]">Blood Type:</span> <span className="font-medium">{medical.blood_type}</span></div>}
                        {medical.medical_aid_provider_code && <div><span className="text-[hsl(var(--admin-text-muted))]">Medical Aid:</span> <span className="font-medium">{medical.medical_aid_provider_code}</span></div>}
                        {medical.has_medical_conditions && <div className="col-span-2"><span className="text-[hsl(var(--admin-text-muted))]">Conditions:</span> <span className="font-medium">{medical.medical_conditions_details}</span></div>}
                    </div>
                </div>
            )}

            {/* Documents */}
            {(app.uploaded_documents || []).length > 0 && (
                <div className="ios-card p-4">
                    <p className="text-xs font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider mb-3">Documents ({app.uploaded_documents.length})</p>
                    <div className="space-y-1">
                        {app.uploaded_documents.map((doc: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-[hsl(var(--admin-surface-alt))]">
                                <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-sm">description</span>
                                <span className="font-medium">{doc.filename}</span>
                                <span className="text-xs text-[hsl(var(--admin-text-muted))]">({doc.doc_type})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meta */}
            <div className="ios-card p-4">
                <p className="text-xs font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider mb-3">Application Info</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[hsl(var(--admin-text-muted))]">ID:</span> <span className="font-mono text-xs">{app.id}</span></div>
                    <div><span className="text-[hsl(var(--admin-text-muted))]">Created:</span> <span>{new Date(app.created_at).toLocaleString()}</span></div>
                    {app.submitted_at && <div><span className="text-[hsl(var(--admin-text-muted))]">Submitted:</span> <span>{new Date(app.submitted_at).toLocaleString()}</span></div>}
                    {app.submitted_by_email && <div><span className="text-[hsl(var(--admin-text-muted))]">Submitted By:</span> <span>{app.submitted_by_email}</span></div>}
                </div>
            </div>
        </div>
    );
}
