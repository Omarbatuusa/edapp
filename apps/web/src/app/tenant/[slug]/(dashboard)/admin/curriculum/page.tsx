'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { getUserRole, canView } from '@/lib/role-permissions';
import { LookupSelect } from '@/components/admin/inputs/LookupSelect';
import { FieldWrapper } from '@/components/admin/inputs/FieldWrapper';

interface Props { params: Promise<{ slug: string }> }

interface Curriculum {
    id: string;
    curriculum_name: string;
    curriculum_code: string;
    certification_type_code: string;
    authority_code: string;
    phases_covered: string[];
    grades_covered: string[];
    is_national: boolean;
    is_active: boolean;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const EMPTY_FORM: Record<string, any> = {
    curriculum_name: '',
    curriculum_code: '',
    certification_type_code: '',
    authority_code: '',
    phases_covered: [],
    grades_covered: [],
    is_national: false,
};

export default function CurriculumPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [items, setItems] = useState<Curriculum[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchItems = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/curricula`, { headers: getAuthHeaders() });
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
                ? `/v1/admin/tenants/${tenantId}/curricula/${editingId}`
                : `/v1/admin/tenants/${tenantId}/curricula`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to save curriculum');
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

    const handleToggleActive = async (item: Curriculum) => {
        try {
            await fetch(`/v1/admin/tenants/${tenantId}/curricula/${item.id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ is_active: !item.is_active }),
            });
            fetchItems();
        } catch {
            // silent
        }
    };

    const handleEdit = (item: Curriculum) => {
        setEditingId(item.id);
        setFormData({
            curriculum_name: item.curriculum_name || '',
            curriculum_code: item.curriculum_code || '',
            certification_type_code: item.certification_type_code || '',
            authority_code: item.authority_code || '',
            phases_covered: item.phases_covered || [],
            grades_covered: item.grades_covered || [],
            is_national: item.is_national || false,
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
                    <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Curriculum Management</h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">Define curricula, certification types, and coverage.</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ ...EMPTY_FORM }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Curriculum
                </button>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="ios-card p-5 space-y-4 border-2 border-blue-200">
                    <h2 className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))]">
                        {editingId ? 'Edit Curriculum' : 'Add Curriculum'}
                    </h2>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldWrapper label="Curriculum Name" required>
                            <input
                                type="text"
                                value={formData.curriculum_name}
                                onChange={e => updateField('curriculum_name', e.target.value)}
                                placeholder="e.g. National Senior Certificate"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Curriculum Code" required>
                            <input
                                type="text"
                                value={formData.curriculum_code}
                                onChange={e => updateField('curriculum_code', e.target.value.toUpperCase())}
                                placeholder="e.g. CAPS"
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 uppercase"
                            />
                        </FieldWrapper>

                        <LookupSelect
                            label="Certification Type"
                            value={formData.certification_type_code}
                            onChange={v => updateField('certification_type_code', v)}
                            dictName="certification_types"
                            required
                        />

                        <LookupSelect
                            label="Authority"
                            value={formData.authority_code}
                            onChange={v => updateField('authority_code', v)}
                            dictName="curriculum_authorities"
                        />

                        <LookupSelect
                            label="Phases Covered"
                            value={formData.phases_covered}
                            onChange={v => updateField('phases_covered', v)}
                            dictName="phases"
                            multiple
                        />

                        <LookupSelect
                            label="Grades Covered"
                            value={formData.grades_covered}
                            onChange={v => updateField('grades_covered', v)}
                            dictName="grades"
                            multiple
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-[hsl(var(--admin-text-main))] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_national}
                            onChange={e => updateField('is_national', e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        National Curriculum
                    </label>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !formData.curriculum_name || !formData.curriculum_code}
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
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">Loading curricula...</div>
            ) : items.length === 0 ? (
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">
                    No curricula found. Click "Add Curriculum" to create one.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="ios-card p-4 flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] truncate">
                                        {item.curriculum_name}
                                    </h3>
                                    <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5">
                                        Code: {item.curriculum_code}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
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
                                        onClick={() => handleToggleActive(item)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            item.is_active ? 'bg-green-500' : 'bg-slate-300'
                                        }`}
                                        title={item.is_active ? 'Active' : 'Inactive'}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            item.is_active ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {item.certification_type_code && (
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                                        {item.certification_type_code}
                                    </span>
                                )}
                                {item.authority_code && (
                                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">
                                        {item.authority_code}
                                    </span>
                                )}
                                {item.is_national && (
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg font-medium">
                                        National
                                    </span>
                                )}
                            </div>
                            {(item.phases_covered?.length > 0 || item.grades_covered?.length > 0) && (
                                <div className="text-xs text-[hsl(var(--admin-text-sub))]">
                                    {item.phases_covered?.length > 0 && (
                                        <p>Phases: {item.phases_covered.join(', ')}</p>
                                    )}
                                    {item.grades_covered?.length > 0 && (
                                        <p>Grades: {item.grades_covered.join(', ')}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
