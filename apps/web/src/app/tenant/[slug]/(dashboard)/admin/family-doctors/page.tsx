'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { getUserRole, canView } from '@/lib/role-permissions';
import { FieldWrapper } from '@/components/admin/inputs/FieldWrapper';

interface Props { params: Promise<{ slug: string }> }

interface FamilyDoctor {
    id: string;
    doctor_name: string;
    contact_number: string;
    email: string;
    work_address: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const EMPTY_FORM: Record<string, any> = {
    doctor_name: '',
    contact_number: '',
    email: '',
    work_address: '',
};

export default function FamilyDoctorsPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [items, setItems] = useState<FamilyDoctor[]>([]);
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
            const res = await fetch(`/v1/admin/tenants/${tenantId}/family-doctors`, { headers: getAuthHeaders() });
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
                ? `/v1/admin/tenants/${tenantId}/family-doctors/${editingId}`
                : `/v1/admin/tenants/${tenantId}/family-doctors`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to save doctor');
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
        if (!confirm('Are you sure you want to delete this doctor record?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/family-doctors/${id}`, {
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

    const handleEdit = (item: FamilyDoctor) => {
        setEditingId(item.id);
        setFormData({
            doctor_name: item.doctor_name || '',
            contact_number: item.contact_number || '',
            email: item.email || '',
            work_address: item.work_address || '',
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
                    <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Family Doctors</h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">Manage family doctor records for learner medical references.</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ ...EMPTY_FORM }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Doctor
                </button>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="ios-card p-5 space-y-4 border-2 border-blue-200">
                    <h2 className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))]">
                        {editingId ? 'Edit Doctor' : 'Add Doctor'}
                    </h2>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldWrapper label="Doctor Name" required>
                            <input
                                type="text"
                                value={formData.doctor_name}
                                onChange={e => updateField('doctor_name', e.target.value)}
                                placeholder="e.g. Dr. Smith"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Contact Number">
                            <input
                                type="tel"
                                value={formData.contact_number}
                                onChange={e => updateField('contact_number', e.target.value)}
                                placeholder="e.g. +27 11 123 4567"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Email">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="e.g. doctor@practice.co.za"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Work Address">
                            <input
                                type="text"
                                value={formData.work_address}
                                onChange={e => updateField('work_address', e.target.value)}
                                placeholder="e.g. 123 Medical Drive, Sandton"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !formData.doctor_name}
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
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">Loading doctors...</div>
            ) : items.length === 0 ? (
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">
                    No family doctors found. Click "Add Doctor" to create one.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="ios-card p-4 flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-teal-600 text-[18px]">stethoscope</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] truncate">
                                            {item.doctor_name}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
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
                            </div>
                            <div className="space-y-1 text-xs text-[hsl(var(--admin-text-sub))]">
                                {item.contact_number && (
                                    <p className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">call</span>
                                        {item.contact_number}
                                    </p>
                                )}
                                {item.email && (
                                    <p className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">mail</span>
                                        {item.email}
                                    </p>
                                )}
                                {item.work_address && (
                                    <p className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                        {item.work_address}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
