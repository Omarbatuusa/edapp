'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { PhoneInput, PhoneValue } from '../inputs/PhoneInput';
import { EmailInput } from '../inputs/EmailInput';
import { AddressInput, AddressValue } from '../inputs/AddressInput';
import { LogoUpload } from '../inputs/LogoUpload';
import { CoverUpload } from '../inputs/CoverUpload';
import { GalleryUpload } from '../inputs/GalleryUpload';
import { BrandIllustration } from '../illustrations/BrandIllustration';
import { SchoolIllustration } from '../illustrations/SchoolIllustration';
import { BrandingIllustration } from '../illustrations/BrandingIllustration';
import { MapIllustration } from '../illustrations/MapIllustration';
import { ContactIllustration } from '../illustrations/ContactIllustration';
import { ReviewIllustration } from '../illustrations/ReviewIllustration';

interface MainBranchWizardProps {
    tenantSlug: string;
    tenantId?: string;
}

const CURRICULUM_OPTIONS = [
    { value: 'CAPS', label: 'CAPS (Curriculum and Assessment Policy Statement)' },
    { value: 'IEB', label: 'IEB (Independent Examinations Board)' },
    { value: 'CAMBRIDGE', label: 'Cambridge International' },
    { value: 'IB', label: 'IB (International Baccalaureate)' },
    { value: 'TVET', label: 'TVET (Technical & Vocational Education)' },
    { value: 'ABE', label: 'ABE (Adult Basic Education)' },
    { value: 'OTHER', label: 'Other' },
];

const EMPTY_PHONE: PhoneValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = { formatted_address: '', google_place_id: '', street: '', suburb: '', city: '', province: '', postal_code: '', country: '', lat: null, lng: null };

const step1Schema = z.object({ brand_id: z.string().min(1, 'Please select a brand') });
const step2Schema = z.object({
    branch_name: z.string().min(2, 'Branch name is required'),
    branch_code: z.string().min(2, 'Branch code is required'),
    curriculum_framework: z.string().min(1, 'Please select a curriculum'),
});
const step3Schema = z.object({ school_logo_url: z.string().min(1, 'School logo is required') });
const step4Schema = z.object({
    address: z.object({ formatted_address: z.string().min(3, 'Address is required') }),
});
const step5Schema = z.object({
    mobile: z.object({ e164: z.string().min(5, 'Mobile number is required') }),
    landline: z.object({ e164: z.string().min(5, 'Landline number is required') }),
    branch_email: z.string().email('Valid email is required'),
});

export function MainBranchWizard({ tenantSlug, tenantId }: MainBranchWizardProps) {
    const router = useRouter();
    const [brands, setBrands] = useState<Array<{ id: string; brand_name: string; brand_code: string }>>([]);

    useEffect(() => {
        const token = localStorage.getItem('session_token');
        fetch('/v1/admin/brands', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => r.json())
            .then(data => setBrands(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, []);

    const steps: WizardStep[] = [
        {
            title: 'Select Brand',
            helper: 'Choose which brand this main school branch belongs to.',
            illustration: <BrandIllustration />,
            schema: step1Schema,
            content: ({ data, onChange, errors }) => (
                <FieldWrapper label="Brand" required state={errors.brand_id ? 'error' : data.brand_id ? 'success' : 'idle'} error={errors.brand_id} helper="Select an existing brand or create one first">
                    <select
                        value={data.brand_id || ''}
                        onChange={e => onChange({ brand_id: e.target.value })}
                        className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                    >
                        <option value="">— Select brand —</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.brand_name} ({b.brand_code})</option>
                        ))}
                    </select>
                </FieldWrapper>
            ),
        },
        {
            title: 'School Details',
            helper: 'Basic information about this school.',
            illustration: <SchoolIllustration />,
            schema: step2Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <FieldWrapper label="School Name" required state={errors.branch_name ? 'error' : data.branch_name ? 'success' : 'idle'} error={errors.branch_name} helper="e.g. Midrand Main Campus">
                        <input type="text" value={data.branch_name || ''} onChange={e => onChange({ branch_name: e.target.value })} placeholder="School name" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>
                    <FieldWrapper label="Branch Code" required state={errors.branch_code ? 'error' : data.branch_code ? 'success' : 'idle'} error={errors.branch_code} helper="Short unique code e.g. MIDRAND, MAIN">
                        <input type="text" value={data.branch_code || ''} onChange={e => onChange({ branch_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} placeholder="MIDRAND" maxLength={20} className="w-full px-3 py-3 text-sm bg-transparent outline-none font-mono" />
                    </FieldWrapper>
                    <FieldWrapper label="Curriculum Framework" required state={errors.curriculum_framework ? 'error' : data.curriculum_framework ? 'success' : 'idle'} error={errors.curriculum_framework}>
                        <select value={data.curriculum_framework || ''} onChange={e => onChange({ curriculum_framework: e.target.value })} className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100">
                            <option value="">— Select curriculum —</option>
                            {CURRICULUM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FieldWrapper>
                    {data.curriculum_framework === 'CAPS' && (
                        <FieldWrapper label="EMIS Number" state="idle" helper="Education Management Information System number (CAPS schools only)">
                            <input type="text" value={data.emis_number || ''} onChange={e => onChange({ emis_number: e.target.value })} placeholder="e.g. 700140086" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    )}
                    <FieldWrapper label="About" state="idle" helper="Brief description of the school">
                        <textarea value={data.about || ''} onChange={e => onChange({ about: e.target.value })} rows={3} placeholder="Describe the school..." className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none" />
                    </FieldWrapper>
                </>
            ),
        },
        {
            title: 'Branding',
            helper: 'Upload your school logo and cover image.',
            illustration: <BrandingIllustration />,
            schema: step3Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <div className={errors.school_logo_url ? 'ring-2 ring-red-400 rounded-2xl' : ''}>
                        <LogoUpload value={data.school_logo_url || ''} onChange={url => onChange({ school_logo_url: url })} required />
                        {errors.school_logo_url && <p className="text-xs text-red-500 mt-1 px-1">{errors.school_logo_url}</p>}
                    </div>
                    <CoverUpload value={data.cover_photo_url || ''} onChange={url => onChange({ cover_photo_url: url })} />
                    <GalleryUpload value={data.image_gallery_urls || []} onChange={urls => onChange({ image_gallery_urls: urls })} />
                </>
            ),
        },
        {
            title: 'Address',
            helper: 'Where is this school located?',
            illustration: <MapIllustration />,
            schema: step4Schema,
            content: ({ data, onChange, errors }) => (
                <AddressInput
                    label="Physical Address"
                    value={data.address || EMPTY_ADDRESS}
                    onChange={addr => onChange({ address: addr })}
                    required
                />
            ),
        },
        {
            title: 'Contact Details',
            helper: 'How can parents and learners reach this school?',
            illustration: <ContactIllustration />,
            schema: step5Schema,
            content: ({ data, onChange, errors, draftId }) => (
                <>
                    <PhoneInput label="Mobile / WhatsApp" value={data.mobile || EMPTY_PHONE} onChange={v => onChange({ mobile: v })} required placeholder="e.g. 060 000 0000" />
                    <PhoneInput label="Landline" value={data.landline || EMPTY_PHONE} onChange={v => onChange({ landline: v })} required placeholder="e.g. 011 000 0000" />
                    <EmailInput label="Branch Email" value={data.branch_email || ''} onChange={v => onChange({ branch_email: v })} draftId={draftId || ''} onVerified={email => onChange({ branch_email: email, branch_email_verified: true })} required />
                    <FieldWrapper label="Secondary Email" state="idle" helper="Optional — billing, admin, or alternative contact">
                        <input type="email" value={data.secondary_email || ''} onChange={e => onChange({ secondary_email: e.target.value })} placeholder="secondary@school.co.za" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>
                </>
            ),
        },
        {
            title: 'Review & Create',
            helper: 'Review all details before creating the main branch.',
            illustration: <ReviewIllustration />,
            content: ({ data }) => {
                const brand = brands.find(b => b.id === data.brand_id);
                return (
                    <div className="flex flex-col gap-4">
                        {[
                            { label: 'Brand', value: brand?.brand_name },
                            { label: 'School Name', value: data.branch_name },
                            { label: 'Branch Code', value: data.branch_code },
                            { label: 'Curriculum', value: data.curriculum_framework },
                            { label: 'EMIS Number', value: data.emis_number, show: data.curriculum_framework === 'CAPS' },
                            { label: 'Address', value: data.address?.formatted_address },
                            { label: 'Mobile', value: data.mobile?.e164 || data.mobile?.raw },
                            { label: 'Landline', value: data.landline?.e164 || data.landline?.raw },
                            { label: 'Email', value: data.branch_email, badge: data.branch_email_verified ? '✓ Verified' : undefined },
                        ].filter(item => item.show !== false && item.value).map(item => (
                            <div key={item.label} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="text-xs font-medium text-slate-400 w-28 flex-shrink-0 mt-0.5">{item.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-700 dark:text-slate-200">{item.value}</span>
                                    {item.badge && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.badge}</span>}
                                </div>
                            </div>
                        ))}
                        {data.school_logo_url && (
                            <div className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-medium text-slate-400 w-28 flex-shrink-0">Logo</span>
                                <img src={data.school_logo_url} alt="Logo" className="w-12 h-12 object-contain rounded-lg border border-slate-200" />
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    const handleComplete = async (data: Record<string, any>) => {
        const token = localStorage.getItem('session_token');
        const body = {
            is_main_branch: true,
            tenant_id: tenantId,
            brand_id: data.brand_id,
            branch_name: data.branch_name,
            branch_code: data.branch_code,
            curriculum_framework: data.curriculum_framework,
            emis_number: data.emis_number || null,
            about: data.about || null,
            school_logo_url: data.school_logo_url || null,
            cover_photo_url: data.cover_photo_url || null,
            image_gallery_urls: data.image_gallery_urls || [],
            // Structured address
            google_place_id: data.address?.google_place_id || null,
            formatted_address: data.address?.formatted_address || null,
            address_components: data.address ? {
                street: data.address.street,
                suburb: data.address.suburb,
                city: data.address.city,
                province: data.address.province,
                postal_code: data.address.postal_code,
                country: data.address.country,
            } : null,
            geo: data.address?.lat ? { lat: data.address.lat, lng: data.address.lng } : null,
            physical_address: data.address?.formatted_address || null,
            // Phone
            mobile_whatsapp: data.mobile?.raw || null,
            mobile_e164: data.mobile?.e164 || null,
            mobile_country_iso2: data.mobile?.country_iso2 || null,
            mobile_dial_code: data.mobile?.dial_code || null,
            phone_landline: data.landline?.raw || null,
            landline_e164: data.landline?.e164 || null,
            landline_country_iso2: data.landline?.country_iso2 || null,
            landline_dial_code: data.landline?.dial_code || null,
            // Email
            branch_email: data.branch_email || null,
            secondary_email: data.secondary_email || null,
            branch_email_verified: data.branch_email_verified || false,
            branch_email_verified_at: data.branch_email_verified ? new Date().toISOString() : null,
        };

        const res = await fetch('/v1/admin/branches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to create main branch');
        router.push(`/tenant/${tenantSlug}/admin/main-branch`);
    };

    return (
        <WizardShell
            steps={steps}
            formType="MAIN_BRANCH"
            tenantId={tenantId}
            submitLabel="Create Main Branch"
            onComplete={handleComplete}
            onCancel={() => router.push(`/tenant/${tenantSlug}/admin/main-branch`)}
        />
    );
}
