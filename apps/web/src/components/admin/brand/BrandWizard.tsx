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

interface BrandWizardProps {
    tenantSlug: string;
    mode?: 'create' | 'edit';
    brandId?: string;
}

const step1Schema = z.object({
    brand_name: z.string().min(2, 'Brand name must be at least 2 characters'),
});

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 60);
}

/* ── Side panel for desktop: calendar + tips/stats ── */
function BrandSidePanel({ mode, brandData }: { mode: 'create' | 'edit'; brandData?: any }) {
    return (
        <div className="flex flex-col gap-5">
            {/* Calendar widget */}
            <div className="bg-[hsl(var(--admin-surface))] rounded-2xl border border-[hsl(var(--admin-border)/0.5)] p-4 shadow-sm">
                <MiniCalendar />
            </div>

            {/* Info card */}
            <div className="bg-[hsl(var(--admin-surface))] rounded-2xl border border-[hsl(var(--admin-border)/0.5)] p-5 shadow-sm">
                {mode === 'edit' && brandData ? (
                    <>
                        <h3 className="text-[13px] font-bold text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))]">info</span>
                            Brand Info
                        </h3>
                        <div className="flex flex-col gap-2.5 text-[12px]">
                            {brandData.brand_code && (
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--admin-text-muted))]">Code</span>
                                    <span className="font-mono font-bold text-[hsl(var(--admin-text-main))]">{brandData.brand_code}</span>
                                </div>
                            )}
                            {brandData.connected_tenant_count != null && (
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--admin-text-muted))]">Linked Schools</span>
                                    <span className="font-semibold text-[hsl(var(--admin-text-main))]">{brandData.connected_tenant_count}</span>
                                </div>
                            )}
                            {brandData.created_at && (
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--admin-text-muted))]">Created</span>
                                    <span className="text-[hsl(var(--admin-text-sub))]">
                                        {new Date(brandData.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-[13px] font-bold text-[hsl(var(--admin-text-main))] mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))]">lightbulb</span>
                            Quick Tips
                        </h3>
                        <ul className="flex flex-col gap-2 text-[12px] text-[hsl(var(--admin-text-sub))]">
                            <li className="flex gap-2">
                                <span className="material-symbols-outlined text-[14px] text-[hsl(var(--admin-primary))] mt-0.5 flex-shrink-0">check_circle</span>
                                <span>A brand groups multiple schools under one identity</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="material-symbols-outlined text-[14px] text-[hsl(var(--admin-primary))] mt-0.5 flex-shrink-0">check_circle</span>
                                <span>Brand code is auto-generated from the name</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="material-symbols-outlined text-[14px] text-[hsl(var(--admin-primary))] mt-0.5 flex-shrink-0">check_circle</span>
                                <span>Logo and cover appear on all schools within the brand</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="material-symbols-outlined text-[14px] text-[hsl(var(--admin-primary))] mt-0.5 flex-shrink-0">check_circle</span>
                                <span>You can always edit brand details later</span>
                            </li>
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}

export function BrandWizard({ tenantSlug, mode = 'create', brandId }: BrandWizardProps) {
    const router = useRouter();
    const [initialData, setInitialData] = useState<Record<string, any>>({});
    const [brandMeta, setBrandMeta] = useState<any>(null);
    const [loading, setLoading] = useState(mode === 'edit');

    // Fetch brand data for edit mode
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
                    description: data.description || '',
                    logo_file_id: data.logo_file_id || '',
                    cover_file_id: data.cover_file_id || '',
                    // Store preview URLs for review step
                    _logo_preview: data.logo_url || '',
                    _cover_preview: data.cover_url || '',
                    _slugEdited: true, // Don't auto-generate slug for existing brands
                });
                setBrandMeta(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [mode, brandId]);

    const steps: WizardStep[] = [
        {
            title: 'Brand Identity',
            helper: 'Set up your brand identity. This groups schools under a single brand.',
            illustration: <BrandIllustration />,
            schema: step1Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <FieldWrapper
                        label="Brand Name"
                        required
                        state={errors.brand_name ? 'error' : data.brand_name ? 'success' : 'idle'}
                        error={errors.brand_name}
                        helper="e.g. Rainbow City Schools, Allied Academy Group"
                    >
                        <input
                            type="text"
                            name="brand_name"
                            data-field="brand_name"
                            value={data.brand_name || ''}
                            onChange={e => {
                                const name = e.target.value;
                                const patch: Record<string, any> = { brand_name: name };
                                if (!data._slugEdited) patch.brand_slug = slugify(name);
                                onChange(patch);
                            }}
                            placeholder="Enter brand name"
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none"
                        />
                    </FieldWrapper>
                    <FieldWrapper
                        label="Brand Slug"
                        state={data.brand_slug ? 'success' : 'idle'}
                        helper="URL-safe identifier. Auto-generated from name, but you can customize it."
                    >
                        <input
                            type="text"
                            name="brand_slug"
                            data-field="brand_slug"
                            value={data.brand_slug || ''}
                            onChange={e => onChange({ brand_slug: slugify(e.target.value), _slugEdited: true })}
                            placeholder="e.g. rainbow-city-schools"
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none font-mono"
                        />
                    </FieldWrapper>
                    <FieldWrapper
                        label="Description"
                        state="idle"
                        helper="Optional — a short description of this brand group"
                    >
                        <textarea
                            name="description"
                            data-field="description"
                            value={data.description || ''}
                            onChange={e => onChange({ description: e.target.value })}
                            rows={3}
                            placeholder="Describe this brand or school group..."
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none"
                        />
                    </FieldWrapper>
                </>
            ),
        },
        {
            title: 'Brand Assets',
            helper: 'Upload a logo and cover image for this brand. These will appear on all schools within the brand.',
            illustration: <BrandingIllustration />,
            content: ({ data, onChange }) => (
                <>
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
                </>
            ),
        },
        {
            title: mode === 'edit' ? 'Review & Save' : 'Review & Create',
            helper: mode === 'edit' ? 'Confirm your changes before saving.' : 'Confirm your brand details before creating.',
            illustration: <ReviewIllustration />,
            content: ({ data }) => (
                <div className="flex flex-col gap-4">
                    <div className="bg-[hsl(var(--admin-surface-alt))] rounded-xl p-4 flex flex-col gap-3">
                        <div data-field="brand_name">
                            <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wide mb-1">Brand Name</p>
                            <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">{data.brand_name || '—'}</p>
                        </div>
                        {data.brand_slug && (
                            <div>
                                <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wide mb-1">Brand Slug</p>
                                <p className="text-[13px] font-mono text-[hsl(var(--admin-text-sub))]">{data.brand_slug}</p>
                            </div>
                        )}
                        {data.description && (
                            <div>
                                <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wide mb-1">Description</p>
                                <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">{data.description}</p>
                            </div>
                        )}

                        {/* Asset previews */}
                        <div className="flex gap-4 flex-wrap mt-1">
                            {data.logo_file_id ? (
                                <div>
                                    <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wide mb-1.5">Logo</p>
                                    {data._logo_preview ? (
                                        <img src={data._logo_preview} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-[hsl(var(--admin-border))] bg-white" />
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[12px] text-green-600">
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Uploaded
                                        </span>
                                    )}
                                </div>
                            ) : null}
                            {data.cover_file_id ? (
                                <div>
                                    <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wide mb-1.5">Cover</p>
                                    {data._cover_preview ? (
                                        <img src={data._cover_preview} alt="Cover" className="w-28 h-10 object-cover rounded-lg border border-[hsl(var(--admin-border))]" />
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[12px] text-green-600">
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Uploaded
                                        </span>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">
                        {mode === 'edit' ? 'Review your changes above, then click Save.' : 'Brand code will be auto-generated from the brand name.'}
                    </p>
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
            <div className="min-h-screen bg-[hsl(var(--admin-background))] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[hsl(var(--admin-primary)/0.25)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                    <p className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))]">Loading brand...</p>
                </div>
            </div>
        );
    }

    return (
        <WizardShell
            steps={steps}
            formType={mode === 'edit' ? `BRAND_EDIT_${brandId}` : 'BRAND'}
            submitLabel={mode === 'edit' ? 'Save Changes' : 'Create Brand'}
            onComplete={handleComplete}
            onCancel={() => router.push(`/tenant/${tenantSlug}/admin/brands`)}
            initialData={initialData}
            hideCancel
            sidePanel={<BrandSidePanel mode={mode} brandData={brandMeta} />}
        />
    );
}
