'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { getUserRole } from '@/lib/role-permissions';
import { LookupSelect } from '@/components/admin/inputs/LookupSelect';
import { FieldWrapper } from '@/components/admin/inputs/FieldWrapper';
import TenantPhaseSelector from '@/components/admin/school-data/TenantPhaseSelector';
import TenantGradeSelector from '@/components/admin/school-data/TenantGradeSelector';

interface Props { params: Promise<{ slug: string }> }

interface Branch {
    id: string;
    branch_name: string;
}

interface ClassItem {
    id: string;
    class_name: string;
    section_name?: string;
    grade_code: string;
    grade_id?: string;
    branch_id: string;
    branch_name?: string;
    capacity_max: number;
    learner_count?: number;
    is_active?: boolean;
}

type Tab = 'phases' | 'grades' | 'classes';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const EMPTY_FORM: Record<string, any> = {
    class_name: '',
    grade_code: '',
    branch_id: '',
    capacity_max: 30,
};

export default function GradesClassesPage({ params }: Props) {
    const { slug } = use(params);
    const role = getUserRole(slug);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [tab, setTab] = useState<Tab>('phases');
    const [enabledPhases, setEnabledPhases] = useState<string[]>([]);

    // Classes tab state
    const [items, setItems] = useState<ClassItem[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [filterGrade, setFilterGrade] = useState('');

    // Load enabled phases for grade filtering
    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/grades-classes/phases`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : [])
            .then(data => setEnabledPhases(data.map((d: any) => d.phase_code)))
            .catch(() => {});
    }, [tenantId, tab]);

    const fetchBranches = useCallback(async () => {
        if (!tenantId) return;
        try {
            const res = await fetch(`/v1/admin/branches`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setBranches(Array.isArray(data) ? data : data.items || data.data || []);
            }
        } catch { /* silent */ }
    }, [tenantId]);

    const fetchItems = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            let url = `/v1/admin/tenants/${tenantId}/grades-classes/classes`;
            const queryParams = new URLSearchParams();
            if (filterBranch) queryParams.set('branch_id', filterBranch);
            if (filterGrade) queryParams.set('grade_code', filterGrade);
            const qs = queryParams.toString();
            if (qs) url += `?${qs}`;

            const res = await fetch(url, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data) ? data : data.items || data.data || []);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [tenantId, filterBranch, filterGrade]);

    useEffect(() => { fetchBranches(); }, [fetchBranches]);
    useEffect(() => { if (tab === 'classes') fetchItems(); }, [fetchItems, tab]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const url = editingId
                ? `/v1/admin/tenants/${tenantId}/grades-classes/classes/${editingId}`
                : `/v1/admin/tenants/${tenantId}/grades-classes/classes`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...formData, capacity_max: Number(formData.capacity_max) || 30 }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to save class');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ ...EMPTY_FORM });
            fetchItems();
        } catch (e: any) {
            setError(e.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleEdit = (item: ClassItem) => {
        setEditingId(item.id);
        setFormData({
            class_name: item.class_name || item.section_name || '',
            grade_code: item.grade_code || item.grade_id || '',
            branch_id: item.branch_id || '',
            capacity_max: item.capacity_max || 30,
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

    const tabs: { key: Tab; label: string }[] = [
        { key: 'phases', label: 'Phases' },
        { key: 'grades', label: 'Grades' },
        { key: 'classes', label: 'Classes' },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Grades & Classes</h1>
                <p className="text-sm text-[hsl(var(--admin-text-sub))]">Configure phases, grades, and classes for your school.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[hsl(var(--admin-surface-alt))] p-1 rounded-xl w-fit">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                            tab === t.key
                                ? 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-primary))] shadow-sm'
                                : 'text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))]'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="ios-card p-5">
                {tab === 'phases' && <TenantPhaseSelector tenantId={tenantId} />}
                {tab === 'grades' && <TenantGradeSelector tenantId={tenantId} enabledPhases={enabledPhases} />}
                {tab === 'classes' && (
                    <div className="space-y-5">
                        {/* Classes header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">Classes</h3>
                            <button
                                type="button"
                                onClick={() => { setShowForm(true); setEditingId(null); setFormData({ ...EMPTY_FORM }); }}
                                className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--admin-primary))] text-white font-semibold rounded-xl text-sm transition-colors active:scale-95"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Class
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
                                <label className="text-xs font-medium text-[hsl(var(--admin-text-sub))]">Branch</label>
                                <select
                                    value={filterBranch}
                                    onChange={e => setFilterBranch(e.target.value)}
                                    aria-label="Filter by branch"
                                    className="px-3 py-2 text-sm rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] outline-none"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.branch_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
                                <LookupSelect label="Grade" value={filterGrade} onChange={v => setFilterGrade(v as string)} dictName="grades" placeholder="All Grades" />
                            </div>
                            {(filterBranch || filterGrade) && (
                                <button type="button" onClick={() => { setFilterBranch(''); setFilterGrade(''); }}
                                    className="px-3 py-2 text-xs font-semibold text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))]">
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Inline Form */}
                        {showForm && (
                            <div className="p-4 space-y-4 border-2 border-[hsl(var(--admin-primary)/0.2)] rounded-xl bg-[hsl(var(--admin-surface-alt))]">
                                <h4 className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">
                                    {editingId ? 'Edit Class' : 'Add Class'}
                                </h4>
                                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FieldWrapper label="Class Name" required>
                                        <input type="text" value={formData.class_name} onChange={e => updateField('class_name', e.target.value)}
                                            placeholder="e.g. Grade 1A" aria-label="Class Name"
                                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                                    </FieldWrapper>
                                    <LookupSelect label="Grade" value={formData.grade_code} onChange={v => updateField('grade_code', v)} dictName="grades" required />
                                    <FieldWrapper label="Branch" required>
                                        <select value={formData.branch_id} onChange={e => updateField('branch_id', e.target.value)} aria-label="Branch"
                                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]">
                                            <option value="">-- Select Branch --</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                        </select>
                                    </FieldWrapper>
                                    <FieldWrapper label="Maximum Capacity">
                                        <input type="number" value={formData.capacity_max} onChange={e => updateField('capacity_max', e.target.value)}
                                            min={1} max={200} placeholder="30" aria-label="Maximum Capacity"
                                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                                    </FieldWrapper>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <button type="button" onClick={handleSave} disabled={saving || !formData.class_name || !formData.grade_code || !formData.branch_id}
                                        className="px-5 py-2 bg-[hsl(var(--admin-primary))] text-white font-semibold rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-all">
                                        {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                    </button>
                                    <button type="button" onClick={handleCancel}
                                        className="px-5 py-2 border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-sub))] font-semibold rounded-xl text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        {loading ? (
                            <div className="p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">Loading classes...</div>
                        ) : items.length === 0 ? (
                            <div className="p-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">
                                No classes found. Click "Add Class" to create one.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[hsl(var(--admin-border))]">
                                            <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Class</th>
                                            <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Grade</th>
                                            <th className="text-left text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Branch</th>
                                            <th className="text-center text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Capacity</th>
                                            <th className="text-right text-xs font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
                                                <td className="py-3 px-4 text-sm font-medium text-[hsl(var(--admin-text-main))]">{item.class_name || item.section_name}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] rounded-lg text-xs font-medium">{item.grade_code || item.grade_id}</span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-[hsl(var(--admin-text-sub))]">{item.branch_name || item.branch_id || '—'}</td>
                                                <td className="py-3 px-4 text-center text-sm text-[hsl(var(--admin-text-main))]">
                                                    {item.learner_count !== undefined ? `${item.learner_count}/` : ''}{item.capacity_max || '—'}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button type="button" onClick={() => handleEdit(item)}
                                                        className="p-1.5 text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-primary))] transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
