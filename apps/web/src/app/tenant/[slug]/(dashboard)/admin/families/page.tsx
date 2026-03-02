'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { getUserRole, canView } from '@/lib/role-permissions';
import { FieldWrapper } from '@/components/admin/inputs/FieldWrapper';

interface Props { params: Promise<{ slug: string }> }

interface Family {
    id: string;
    family_name: string;
    family_code: string;
    eldest_learner?: string;
    learner_count?: number;
    created_at?: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const EMPTY_FORM: Record<string, any> = {
    family_name: '',
};

export default function FamiliesPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [items, setItems] = useState<Family[]>([]);
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
            const res = await fetch(`/v1/admin/tenants/${tenantId}/families`, { headers: getAuthHeaders() });
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
                ? `/v1/admin/tenants/${tenantId}/families/${editingId}`
                : `/v1/admin/tenants/${tenantId}/families`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to save family');
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
        if (!confirm('Are you sure you want to delete this family? This may affect linked learners.')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/families/${id}`, {
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

    const handleEdit = (item: Family) => {
        setEditingId(item.id);
        setFormData({
            family_name: item.family_name || '',
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
                    <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Families</h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">Manage family groups and their associated learners.</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ ...EMPTY_FORM }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Family
                </button>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="ios-card p-5 space-y-4 border-2 border-blue-200">
                    <h2 className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))]">
                        {editingId ? 'Edit Family' : 'Add Family'}
                    </h2>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldWrapper label="Family Name" required>
                            <input
                                type="text"
                                value={formData.family_name}
                                onChange={e => updateField('family_name', e.target.value)}
                                placeholder="e.g. The Smith Family"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <div className="flex flex-col gap-1.5 justify-center">
                            <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                                Family code will be auto-generated upon creation.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !formData.family_name}
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
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">Loading families...</div>
            ) : items.length === 0 ? (
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">
                    No families found. Click "Add Family" to create one.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="ios-card p-4 flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-indigo-600 text-[20px]">family_restroom</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] truncate">
                                            {item.family_name}
                                        </h3>
                                        <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                                            Code: {item.family_code}
                                        </p>
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

                            <div className="flex items-center gap-4 text-xs text-[hsl(var(--admin-text-sub))]">
                                {item.eldest_learner && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">school</span>
                                        Eldest: {item.eldest_learner}
                                    </span>
                                )}
                                {item.learner_count !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">group</span>
                                        {item.learner_count} learner{item.learner_count !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
