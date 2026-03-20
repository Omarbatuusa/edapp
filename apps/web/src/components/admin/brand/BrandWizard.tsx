'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { LogoUpload } from '../inputs/LogoUpload';
import { CoverUpload } from '../inputs/CoverUpload';
import { IllustrationSlot } from '../illustrations/IllustrationSlot';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { NotifItem } from '@/components/dashboard/NotifItem';
import { MOCK_ADMIN_EVENTS } from '@/lib/calendar-events';

interface BrandWizardProps {
    tenantSlug: string;
    mode?: 'create' | 'edit';
    brandId?: string;
}

const step1Schema = z.object({
    brand_name: z.string().min(2, 'Brand name must be at least 2 characters'),
});

/** Preview slug (first 3 letters, server is authoritative on save) */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z]/g, '')
        .substring(0, 3)
        .padEnd(3, 'x');
}

/** Preview code: 1 letter + 3 digits — server generates the real one on save */
function previewCode(name: string): string {
    const letter = name.replace(/[^a-zA-Z]/g, '').substring(0, 1).toUpperCase() || 'B';
    const num = Math.floor(Math.random() * 900) + 100;
    return `${letter}${num}`;
}

/* iOS-style text input class */
const inputCls = 'w-full h-[44px] px-4 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]';
const textareaCls = 'w-full px-4 py-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)] resize-none leading-relaxed';
const readOnlyCls = 'w-full h-[44px] px-4 text-[14px] font-mono bg-[hsl(var(--admin-surface-alt)/0.4)] text-[hsl(var(--admin-text-muted))] outline-none cursor-default';

export function BrandWizard({ tenantSlug, mode = 'create', brandId }: BrandWizardProps) {
    const router = useRouter();
    const [initialData, setInitialData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(mode === 'edit');
    const [loadError, setLoadError] = useState('');
    // Static form key: 'BRAND' for new (enables draft resume), 'BRAND_EDIT_<id>' for edit
    const wizardKey = mode === 'edit' ? `BRAND_EDIT_${brandId}` : 'BRAND';

    useEffect(() => {
        if (mode !== 'edit' || !brandId) return;
        const token = localStorage.getItem('session_token');
        fetch(`/v1/admin/brands/${brandId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: 'no-store',
        })
            .then(async r => {
                const data = await r.json();
                if (!r.ok) {
                    setLoadError(data.message || 'Brand not found');
                    return;
                }
                setInitialData({
                    brand_name: data.brand_name || '',
                    brand_slug: data.brand_slug || '',
                    brand_code: data.brand_code || '',
                    description: data.description || '',
                    logo_file_id: data.logo_file_id || '',
                    cover_file_id: data.cover_file_id || '',
                    _logo_preview: data.logo_url || '',
                    _cover_preview: data.cover_url || '',
                });
            })
            .catch(() => setLoadError('Could not load brand. Please try again.'))
            .finally(() => setLoading(false));
    }, [mode, brandId]);

    const steps: WizardStep[] = [
        {
            title: 'Brand Identity',
            helper: 'Give your brand a name. This will group schools under a single identity.',
            illustration: <IllustrationSlot slotKey="brand_step_1" />,
            schema: step1Schema,
            content: ({ data, onChange, errors }) => (
                <div className="flex flex-col gap-4">
                    <FieldWrapper
                        label="Brand Name"
                        required
                        state={errors.brand_name ? 'error' : data.brand_name ? 'success' : 'idle'}
                        error={errors.brand_name}
                    >
                        <input
                            type="text"
                            name="brand_name"
                            data-field="brand_name"
                            value={data.brand_name || ''}
                            onChange={e => {
                                const name = e.target.value;
                                onChange({
                                    brand_name: name,
                                    brand_slug: slugify(name),
                                    brand_code: previewCode(name),
                                });
                            }}
                            placeholder="e.g. Rainbow City Schools"
                            className={inputCls}
                        />
                    </FieldWrapper>

                    {/* Slug — auto-generated, read-only */}
                    <FieldWrapper label="Slug" state="idle" helper="Auto-generated (first 3 letters)">
                        <input
                            type="text"
                            readOnly
                            tabIndex={-1}
                            aria-label="Brand slug"
                            value={data.brand_slug || ''}
                            className={readOnlyCls}
                        />
                    </FieldWrapper>

                    {/* Brand Code — auto-generated, read-only */}
                    <FieldWrapper label="Brand Code" state="idle" helper="Preview — final code assigned on save">
                        <input
                            type="text"
                            readOnly
                            tabIndex={-1}
                            aria-label="Brand code"
                            value={data.brand_code || ''}
                            className={readOnlyCls}
                        />
                    </FieldWrapper>

                    <FieldWrapper label="Description" state="idle" helper="Optional">
                        <textarea
                            name="description"
                            data-field="description"
                            value={data.description || ''}
                            onChange={e => onChange({ description: e.target.value })}
                            rows={3}
                            placeholder="A short description of this brand group..."
                            className={textareaCls}
                        />
                    </FieldWrapper>
                </div>
            ),
        },
        {
            title: 'Brand Assets',
            helper: 'Upload a logo and cover image. These appear on all schools within this brand.',
            illustration: <IllustrationSlot slotKey="brand_step_2" />,
            content: ({ data, onChange }) => (
                <div className="flex flex-col gap-5">
                    <LogoUpload
                        label="Brand Logo"
                        value={data.logo_file_id || ''}
                        onChange={key => onChange({ logo_file_id: key })}
                    />
                    <CoverUpload
                        label="Brand Cover Photo"
                        value={data.cover_file_id || ''}
                        onChange={key => onChange({ cover_file_id: key })}
                    />
                </div>
            ),
        },
        {
            title: 'Review',
            helper: 'Review',
            illustration: <IllustrationSlot slotKey="brand_step_3" />,
            content: ({ data }) => (
                <div className="flex flex-col gap-4">
                    {/* Brand identity card */}
                    <div className="rounded-2xl border border-[hsl(var(--admin-border)/0.4)] overflow-hidden">
                        <div className="px-4 py-3 bg-[hsl(var(--admin-surface-alt)/0.3)] border-b border-[hsl(var(--admin-border)/0.3)]">
                            <p className="text-[12px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Brand Details</p>
                        </div>
                        <div className="divide-y divide-[hsl(var(--admin-border)/0.2)]">
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-[13px] text-[hsl(var(--admin-text-muted))]">Name</span>
                                <span className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">{data.brand_name || '—'}</span>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-[13px] text-[hsl(var(--admin-text-muted))]">Slug</span>
                                <span className="text-[13px] font-mono text-[hsl(var(--admin-text-sub))]">{data.brand_slug || '—'}</span>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-[13px] text-[hsl(var(--admin-text-muted))]">Code</span>
                                <span className="text-[13px] font-mono font-bold text-[hsl(var(--admin-text-main))]">{data.brand_code || '—'}</span>
                            </div>
                            {data.description && (
                                <div className="px-4 py-3">
                                    <span className="text-[13px] text-[hsl(var(--admin-text-muted))]">Description</span>
                                    <p className="text-[13px] text-[hsl(var(--admin-text-sub))] mt-1 leading-relaxed">{data.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assets card */}
                    <div className="rounded-2xl border border-[hsl(var(--admin-border)/0.4)] overflow-hidden">
                        <div className="px-4 py-3 bg-[hsl(var(--admin-surface-alt)/0.3)] border-b border-[hsl(var(--admin-border)/0.3)]">
                            <p className="text-[12px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Assets</p>
                        </div>
                        <div className="p-4 flex gap-4 flex-wrap">
                            {/* Logo preview */}
                            <div className="flex flex-col items-center gap-1.5">
                                <p className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase">Logo</p>
                                {data.logo_file_id ? (
                                    data._logo_preview ? (
                                        <img src={data._logo_preview} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-[hsl(var(--admin-border)/0.3)] bg-white" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                                        </div>
                                    )
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border)/0.3)] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-[20px]">image</span>
                                    </div>
                                )}
                            </div>
                            {/* Cover preview */}
                            <div className="flex flex-col items-center gap-1.5">
                                <p className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase">Cover</p>
                                {data.cover_file_id ? (
                                    data._cover_preview ? (
                                        <img src={data._cover_preview} alt="Cover" className="w-28 h-16 object-cover rounded-xl border border-[hsl(var(--admin-border)/0.3)]" />
                                    ) : (
                                        <div className="w-28 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                                        </div>
                                    )
                                ) : (
                                    <div className="w-28 h-16 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border)/0.3)] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-[20px]">panorama</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const handleComplete = async (data: Record<string, any>) => {
        const token = localStorage.getItem('session_token');
        // On create: send slug so server can use it as base (server still ensures uniqueness)
        // On edit: never send slug or code — they're immutable
        const payload = mode === 'edit' ? {
            brand_name: data.brand_name,
            description: data.description ?? null,
            logo_file_id: data.logo_file_id || null,
            cover_file_id: data.cover_file_id || null,
        } : {
            brand_name: data.brand_name,
            brand_slug: data.brand_slug,
            description: data.description ?? null,
            logo_file_id: data.logo_file_id || null,
            cover_file_id: data.cover_file_id || null,
        };
        const url = mode === 'edit' ? `/v1/admin/brands/${brandId}` : '/v1/admin/brands';
        const method = mode === 'edit' ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} brand`);
        router.push(`/tenant/${tenantSlug}/admin/brands`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-[hsl(var(--admin-primary)/0.2)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6 text-center">
                <span className="material-symbols-outlined text-[48px] text-[hsl(var(--admin-text-muted))]">error_outline</span>
                <div>
                    <p className="text-[16px] font-semibold text-[hsl(var(--admin-text-main))]">{loadError}</p>
                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-1">This brand may have been deleted or you may not have access.</p>
                </div>
                <button
                    type="button"
                    onClick={() => router.push(`/tenant/${tenantSlug}/admin/brands`)}
                    className="px-5 py-2.5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-semibold rounded-xl"
                >
                    Back to Brands
                </button>
            </div>
        );
    }

    const dashboardPanel = (
        <div className="flex flex-col gap-4">
            <MiniCalendar events={MOCK_ADMIN_EVENTS} />

            {/* Urgent Tasks */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-danger))]">priority_high</span>
                    Urgent Tasks
                </h3>
                <div className="space-y-1">
                    <TaskItem title="Approve Leave Request" time="2h ago" urgent />
                    <TaskItem title="Review Incident Report #102" time="4h ago" urgent />
                    <TaskItem title="Monthly Fee Reconciliation" time="1d ago" />
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="ios-card">
                <h3 className="type-card-title text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">notifications</span>
                    Recent Notifications
                </h3>
                <div className="space-y-2">
                    <NotifItem icon="person_add" text="New enrollment application received" time="10m ago" />
                    <NotifItem icon="event_available" text="Staff meeting confirmed for tomorrow" time="1h ago" />
                    <NotifItem icon="payments" text="3 fee payments processed" time="2h ago" />
                </div>
            </div>

            <ActivityFeed role="admin" />
        </div>
    );

    return (
        <div className="brand-wizard-container">
            <WizardShell
                steps={steps}
                formType={wizardKey}
                submitLabel={mode === 'edit' ? 'Save Changes' : 'Create Brand'}
                onComplete={handleComplete}
                onCancel={() => router.push(`/tenant/${tenantSlug}/admin/brands`)}
                initialData={initialData}
                sidePanel={dashboardPanel}
            />
        </div>
    );
}
