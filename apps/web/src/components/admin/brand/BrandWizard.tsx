'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { LogoUpload } from '../inputs/LogoUpload';
import { CoverUpload } from '../inputs/CoverUpload';
import { BrandIllustration } from '../illustrations/BrandIllustration';
import { BrandingIllustration } from '../illustrations/BrandingIllustration';
import { ReviewIllustration } from '../illustrations/ReviewIllustration';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

interface BrandWizardProps {
    tenantSlug: string;
    mode?: 'create' | 'edit';
    brandId?: string;
}

const step1Schema = z.object({
    brand_name: z.string().min(2, 'Brand name must be at least 2 characters'),
});

/** Generate a short slug (max 6 chars) from a name */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .substring(0, 6);
}

/** Generate a brand code like BRD-XXXXXX */
function generateCode(name: string): string {
    const base = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${base || 'BRD'}-${rand}`;
}

/* iOS-style text input class */
const inputCls = 'w-full h-[44px] px-4 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]';
const textareaCls = 'w-full px-4 py-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)] resize-none leading-relaxed';
const readOnlyCls = 'w-full h-[44px] px-4 text-[14px] font-mono bg-[hsl(var(--admin-surface-alt)/0.4)] text-[hsl(var(--admin-text-muted))] outline-none cursor-default';

export function BrandWizard({ tenantSlug, mode = 'create', brandId }: BrandWizardProps) {
    const router = useRouter();
    const [initialData, setInitialData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(mode === 'edit');

    useEffect(() => {
        if (mode !== 'edit' || !brandId) return;
        const token = localStorage.getItem('session_token');
        fetch(`/v1/admin/brands/${brandId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => r.json())
            .then(data => {
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
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [mode, brandId]);

    const steps: WizardStep[] = [
        {
            title: 'Brand Identity',
            helper: 'Give your brand a name. This will group schools under a single identity.',
            illustration: <BrandIllustration />,
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
                                    brand_code: data.brand_code || generateCode(name),
                                });
                            }}
                            placeholder="e.g. Rainbow City Schools"
                            className={inputCls}
                        />
                    </FieldWrapper>

                    {/* Slug — auto-generated, read-only */}
                    <FieldWrapper label="Slug" state="idle" helper="Auto-generated (max 6 characters)">
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
                    <FieldWrapper label="Brand Code" state="idle" helper="Auto-generated unique code">
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
            illustration: <BrandingIllustration />,
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
            illustration: <ReviewIllustration />,
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
        const payload = {
            brand_name: data.brand_name,
            brand_slug: data.brand_slug,
            description: data.description,
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

    const dashboardPanel = (
        <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[hsl(var(--admin-border)/0.4)] p-4">
                <MiniCalendar />
            </div>
            <div className="bg-white rounded-2xl border border-[hsl(var(--admin-border)/0.4)] overflow-hidden">
                <ActivityFeed role="admin" />
            </div>
        </div>
    );

    return (
        <div className="brand-wizard-container">
            <WizardShell
                steps={steps}
                formType={mode === 'edit' ? `BRAND_EDIT_${brandId}` : 'BRAND'}
                submitLabel={mode === 'edit' ? 'Save Changes' : 'Create Brand'}
                onComplete={handleComplete}
                onCancel={() => router.push(`/tenant/${tenantSlug}/admin/brands`)}
                initialData={initialData}
                sidePanel={dashboardPanel}
            />
        </div>
    );
}
