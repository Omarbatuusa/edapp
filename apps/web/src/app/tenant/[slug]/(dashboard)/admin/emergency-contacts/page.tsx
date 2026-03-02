'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { getUserRole, canView } from '@/lib/role-permissions';
import { LookupSelect } from '@/components/admin/inputs/LookupSelect';
import { FieldWrapper } from '@/components/admin/inputs/FieldWrapper';

interface Props { params: Promise<{ slug: string }> }

interface EmergencyContact {
    id: string;
    contact_name: string;
    relationship_code: string;
    mobile_number: string;
    alternate_number: string;
    email: string;
    priority_level: number;
    authorized_to_pick_up: boolean;
    medical_alert_notes: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const EMPTY_FORM: Record<string, any> = {
    contact_name: '',
    relationship_code: '',
    mobile_number: '',
    alternate_number: '',
    email: '',
    priority_level: 1,
    authorized_to_pick_up: false,
    medical_alert_notes: '',
};

export default function EmergencyContactsPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [items, setItems] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/emergency-contacts`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data) ? data : data.items || data.data || []);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const url = editingId
                ? `/v1/admin/tenants/${tenantId}/emergency-contacts/${editingId}`
                : `/v1/admin/tenants/${tenantId}/emergency-contacts`;
            const method = editingId ? 'PUT' : 'POST';
            const payload = {
                ...formData,
                priority_level: Number(formData.priority_level) || 1,
            };
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to save contact');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ ...EMPTY_FORM });
            fetchItems();
        } catch (e: any) {
            setError(e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this emergency contact?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/emergency-contacts/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                fetchItems();
            }
        } catch {
            // silent
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (item: EmergencyContact) => {
        setEditingId(item.id);
        setFormData({
            contact_name: item.contact_name || '',
            relationship_code: item.relationship_code || '',
            mobile_number: item.mobile_number || '',
            alternate_number: item.alternate_number || '',
            email: item.email || '',
            priority_level: item.priority_level || 1,
            authorized_to_pick_up: item.authorized_to_pick_up || false,
            medical_alert_notes: item.medical_alert_notes || '',
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ ...EMPTY_FORM });
        setError('');
    };

    const updateField = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const priorityLabel = (level: number) => {
        switch (level) {
            case 1: return 'Highest';
            case 2: return 'High';
            case 3: return 'Medium';
            case 4: return 'Low';
            case 5: return 'Lowest';
            default: return `Level ${level}`;
        }
    };

    const priorityColor = (level: number) => {
        switch (level) {
            case 1: return 'bg-red-50 text-red-700';
            case 2: return 'bg-orange-50 text-orange-700';
            case 3: return 'bg-yellow-50 text-yellow-700';
            case 4: return 'bg-blue-50 text-blue-700';
            case 5: return 'bg-slate-50 text-slate-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    if (!tenantId) {
        return (
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-[15px] font-medium">
                    Unable to load. Please ensure you are logged in with a valid tenant account.
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Emergency Contacts</h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">Manage emergency contact records for learners and families.</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ ...EMPTY_FORM }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Contact
                </button>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="ios-card p-5 space-y-4 border-2 border-blue-200">
                    <h2 className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))]">
                        {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                    </h2>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldWrapper label="Contact Name" required>
                            <input
                                type="text"
                                value={formData.contact_name}
                                onChange={e => updateField('contact_name', e.target.value)}
                                placeholder="e.g. Jane Doe"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <LookupSelect
                            label="Relationship"
                            value={formData.relationship_code}
                            onChange={v => updateField('relationship_code', v)}
                            dictName="emergency_relationships"
                            required
                        />

                        <FieldWrapper label="Mobile Number" required>
                            <input
                                type="tel"
                                value={formData.mobile_number}
                                onChange={e => updateField('mobile_number', e.target.value)}
                                placeholder="e.g. +27 82 123 4567"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Alternate Number">
                            <input
                                type="tel"
                                value={formData.alternate_number}
                                onChange={e => updateField('alternate_number', e.target.value)}
                                placeholder="e.g. +27 11 123 4567"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Email">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="e.g. jane@example.com"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Priority Level (1-5)" required>
                            <input
                                type="number"
                                value={formData.priority_level}
                                onChange={e => updateField('priority_level', e.target.value)}
                                min={1}
                                max={5}
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-[hsl(var(--admin-text-main))] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.authorized_to_pick_up}
                            onChange={e => updateField('authorized_to_pick_up', e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        Authorized to pick up learner
                    </label>

                    <FieldWrapper label="Medical Alert Notes">
                        <textarea
                            value={formData.medical_alert_notes}
                            onChange={e => updateField('medical_alert_notes', e.target.value)}
                            placeholder="Any medical information this contact should be aware of..."
                            rows={3}
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 resize-none"
                        />
                    </FieldWrapper>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !formData.contact_name || !formData.mobile_number}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))] font-semibold rounded-xl text-sm transition-colors hover:bg-[hsl(var(--admin-surface-alt))]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">Loading emergency contacts...</div>
            ) : items.length === 0 ? (
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">
                    No emergency contacts found. Click "Add Contact" to create one.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[hsl(var(--admin-border))]">
                                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Contact Name</th>
                                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Relationship</th>
                                <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Phone</th>
                                <th className="text-center text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Priority</th>
                                <th className="text-center text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Pickup</th>
                                <th className="text-right text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items
                                .sort((a, b) => (a.priority_level || 5) - (b.priority_level || 5))
                                .map(item => (
                                <tr key={item.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface))] transition-colors">
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-medium text-[hsl(var(--admin-text-main))]">{item.contact_name}</p>
                                        {item.email && (
                                            <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.email}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-[hsl(var(--admin-text-sub))]">{item.relationship_code}</td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm text-[hsl(var(--admin-text-main))]">{item.mobile_number}</p>
                                        {item.alternate_number && (
                                            <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.alternate_number}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityColor(item.priority_level)}`}>
                                            {priorityLabel(item.priority_level)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {item.authorized_to_pick_up ? (
                                            <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-300 text-[18px]">cancel</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                className="p-1.5 text-[hsl(var(--admin-text-sub))] hover:text-blue-600 transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                className="p-1.5 text-[hsl(var(--admin-text-sub))] hover:text-red-600 transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
