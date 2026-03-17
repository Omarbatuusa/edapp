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

/* iOS-style text input class */
const inputCls = 'w-full h-[44px] px-4 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]';
const textareaCls = 'w-full px-4 py-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)] resize-none leading-relaxed';
const monoCls = 'w-full h-[44px] px-4 text-[14px] font-mono bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]';

/* ── Desktop side panel ── */
function BrandSidePanel({ mode, brandData }: { mode: 'create' | 'edit'; brandData?: any }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[hsl(var(--admin-border)/0.4)] p-4">
                <MiniCalendar />
            </div>
            <div className="bg-white rounded-2xl border border-[hsl(var(--admin-border)/0.4)] p-5">
                {mode === 'edit' && brandData ? (
                    <>
                        <p className="text-[12px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">Brand Info</p>
                        <div className="flex flex-col gap-2 text-[13px]">
                            {brandData.brand_code && (
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--admin-text-muted))]">Code</span>
                                    <span className="font-mono font-bold text-[hsl(var(--admin-text-main))]">{brandData.brand_code}</span>
                                </div>
                            )}
                            {brandData.connected_tenant_count != null && (
                                <div className="flex justify-between">
                                    <span className="text-[hsl(var(--admin-text-muted))]">Schools</span>
                                    <span className="font-semibold text-[hsl(var(--admin-text-main))]">{brandData.connected_tenant_count}</span>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-[12px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-3">Tips</p>
                        <div className="flex flex-col gap-2.5 text-[13px] text-[hsl(var(--admin-text-sub))]">
                            {['A brand groups schools under one identity', 'Brand code auto-generates from the name', 'Logo & cover appear on all linked schools'].map((t, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="material-symbols-outlined text-[15px] text-[hsl(var(--admin-primary))] mt-0.5 flex-shrink-0">check_circle</span>
                                    <span>{t}</span>
                                </div>
                            ))}
                        </div>
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
                    _logo_preview: data.logo_url || '',
                    _cover_preview: data.cover_url || '',
                    _slugEdited: true,
                });
                setBrandMeta(data);
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
                                const patch: Record<string, any> = { brand_name: name };
                                if (!data._slugEdited) patch.brand_slug = slugify(name);
                                onChange(patch);
                            }}
                            placeholder="e.g. Rainbow City Schools"
                            className={inputCls}
                        />
                    </FieldWrapper>
                    <FieldWrapper
                        label="Slug"
                        state={data.brand_slug ? 'success' : 'idle'}
                        helper="Auto-generated from name. You can customise it."
                    >
                        <input
                            type="text"
                            name="brand_slug"
                            data-field="brand_slug"
                            value={data.brand_slug || ''}
                            onChange={e => onChange({ brand_slug: slugify(e.target.value), _slugEdited: true })}
                            placeholder="rainbow-city-schools"
                            className={monoCls}
                        />
                    </FieldWrapper>
                    <FieldWrapper
                        label="Description"
                        state="idle"
                        helper="Optional"
                    >
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
            title: mode === 'edit' ? 'Review & Save' : 'Review & Create',
            helper: 'Check everything looks right.',
            illustration: <ReviewIllustration />,
            content: ({ data }) => (
                <div className="flex flex-col gap-0">
                    {/* iOS grouped list style review */}
                    <div className="rounded-2xl border border-[hsl(var(--admin-border)/0.4)] overflow-hidden bg-[hsl(var(--admin-surface-alt)/0.3)]">
                        {/* Brand Name */}
                        <div className="px-4 py-3.5 border-b border-[hsl(var(--admin-border)/0.3)]">
                            <p className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-0.5">Name</p>
                            <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))]">{data.brand_name || '—'}</p>
                        </div>
                        {/* Slug */}
                        {data.brand_slug && (
                            <div className="px-4 py-3.5 border-b border-[hsl(var(--admin-border)/0.3)]">
                                <p className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-0.5">Slug</p>
                                <p className="text-[14px] font-mono text-[hsl(var(--admin-text-sub))]">{data.brand_slug}</p>
                            </div>
                        )}
                        {/* Description */}
                        {data.description && (
                            <div className="px-4 py-3.5 border-b border-[hsl(var(--admin-border)/0.3)]">
                                <p className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider mb-0.5">Description</p>
                                <p className="text-[14px] text-[hsl(var(--admin-text-sub))] leading-relaxed">{data.description}</p>
                            </div>
                        )}
                        {/* Assets row */}
                        <div className="px-4 py-3.5 flex items-center gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">image</span>
                                <span className="text-[13px] text-[hsl(var(--admin-text-sub))]">Logo</span>
                            </div>
                            {data.logo_file_id ? (
                                <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
                            ) : (
                                <span className="text-[12px] text-[hsl(var(--admin-text-muted))]">None</span>
                            )}
                        </div>
                        <div className="border-t border-[hsl(var(--admin-border)/0.3)] px-4 py-3.5 flex items-center gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">panorama</span>
                                <span className="text-[13px] text-[hsl(var(--admin-text-sub))]">Cover</span>
                            </div>
                            {data.cover_file_id ? (
                                <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
                            ) : (
                                <span className="text-[12px] text-[hsl(var(--admin-text-muted))]">None</span>
                            )}
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

    return (
        <div className="brand-wizard-container">
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
        </div>
    );
}
