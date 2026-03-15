'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { LogoUpload } from '../inputs/LogoUpload';
import { CoverUpload } from '../inputs/CoverUpload';
import { BrandIllustration } from '../illustrations/BrandIllustration';
import { BrandingIllustration } from '../illustrations/BrandingIllustration';
import { ReviewIllustration } from '../illustrations/ReviewIllustration';

interface BrandWizardProps {
    tenantSlug: string;
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

export function BrandWizard({ tenantSlug }: BrandWizardProps) {
    const router = useRouter();

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
            title: 'Review & Create',
            helper: 'Confirm your brand details before creating.',
            illustration: <ReviewIllustration />,
            content: ({ data }) => (
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Brand Name</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.brand_name || '—'}</p>
                        </div>
                        {data.brand_slug && (
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Brand Slug</p>
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{data.brand_slug}</p>
                            </div>
                        )}
                        {data.description && (
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Description</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{data.description}</p>
                            </div>
                        )}
                        <div className="flex gap-4">
                            {data.logo_file_id && (
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Logo</p>
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600"><span className="material-symbols-outlined text-sm">check_circle</span> Uploaded</span>
                                </div>
                            )}
                            {data.cover_file_id && (
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Cover</p>
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600"><span className="material-symbols-outlined text-sm">check_circle</span> Uploaded</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Brand code will be auto-generated from the brand name.</p>
                </div>
            ),
        },
    ];

    const handleComplete = async (data: Record<string, any>) => {
        const token = localStorage.getItem('session_token');
        const res = await fetch('/v1/admin/brands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                brand_name: data.brand_name,
                brand_slug: data.brand_slug,
                description: data.description,
                logo_file_id: data.logo_file_id || null,
                cover_file_id: data.cover_file_id || null,
            }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to create brand');
        router.push(`/tenant/${tenantSlug}/admin/brands`);
    };

    return (
        <WizardShell
            steps={steps}
            formType="BRAND"
            submitLabel="Create Brand"
            onComplete={handleComplete}
            onCancel={() => router.push(`/tenant/${tenantSlug}/admin/brands`)}
        />
    );
}
