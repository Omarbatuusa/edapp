'use client';

import { useState } from 'react';
import { UserCheck, Send } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface EarlyLeaveFormProps {
    branchId: string;
    onSuccess?: () => void;
}

export default function EarlyLeaveForm({ branchId, onSuccess }: EarlyLeaveFormProps) {
    const [form, setForm] = useState({
        learner_user_id: '',
        reason: '',
        pickup_person_name: '',
        pickup_person_relation: '',
        pickup_person_id_number: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await apiClient.post('/attendance/early-leave', {
                branch_id: branchId,
                ...form,
            });
            if (res.data?.status === 'success') {
                setSuccess(true);
                setForm({ learner_user_id: '', reason: '', pickup_person_name: '', pickup_person_relation: '', pickup_person_id_number: '' });
                onSuccess?.();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(res.data?.message || 'Failed to create request');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <UserCheck size={20} className="text-[hsl(var(--admin-primary))]" />
                <h3 className="text-[17px] font-semibold">Early Leave Request</h3>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Learner ID</label>
                <input
                    type="text"
                    value={form.learner_user_id}
                    onChange={e => setForm(f => ({ ...f, learner_user_id: e.target.value }))}
                    placeholder="Enter learner user ID"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="Reason for early leave"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Pickup Person</label>
                    <input
                        type="text"
                        value={form.pickup_person_name}
                        onChange={e => setForm(f => ({ ...f, pickup_person_name: e.target.value }))}
                        placeholder="Full name"
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Relation</label>
                    <select
                        value={form.pickup_person_relation}
                        onChange={e => setForm(f => ({ ...f, pickup_person_relation: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    >
                        <option value="">Select...</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">ID/Passport Number (optional)</label>
                <input
                    type="text"
                    value={form.pickup_person_id_number}
                    onChange={e => setForm(f => ({ ...f, pickup_person_id_number: e.target.value }))}
                    placeholder="ID or passport number"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">Request submitted successfully!</p>}

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[hsl(var(--admin-primary))] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
        </form>
    );
}
