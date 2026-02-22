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
import { SchoolIllustration } from '../illustrations/SchoolIllustration';
import { BrandingIllustration } from '../illustrations/BrandingIllustration';
import { MapIllustration } from '../illustrations/MapIllustration';
import { ContactIllustration } from '../illustrations/ContactIllustration';
import { ReviewIllustration } from '../illustrations/ReviewIllustration';
import { BrandIllustration } from '../illustrations/BrandIllustration';

interface BranchWizardProps {
    tenantSlug: string;
    tenantId?: string;
    mainBranchId?: string;
}

const CURRICULUM_OPTIONS = [
    { value: 'CAPS', label: 'CAPS' },
    { value: 'IEB', label: 'IEB' },
    { value: 'CAMBRIDGE', label: 'Cambridge' },
    { value: 'IB', label: 'IB' },
    { value: 'TVET', label: 'TVET' },
    { value: 'ABE', label: 'ABE' },
    { value: 'OTHER', label: 'Other' },
];

const EMPTY_PHONE: PhoneValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = { formatted_address: '', google_place_id: '', street: '', suburb: '', city: '', province: '', postal_code: '', country: '', lat: null, lng: null };

const step1Schema = z.object({ parent_branch_id: z.string().min(1, 'Please select a main branch') });
const step2Schema = z.object({
    branch_name: z.string().min(2, 'Branch name is required'),
    branch_code: z.string().min(2, 'Branch code is required'),
    curriculum_framework: z.string().min(1, 'Please select a curriculum'),
});
const step3Schema = z.object({ school_logo_url: z.string().min(1, 'School logo is required') });
const step4Schema = z.object({ address: z.object({ formatted_address: z.string().min(3, 'Address is required') }) });
const step5Schema = z.object({
    mobile: z.object({ e164: z.string().min(5, 'Mobile number is required') }),
    landline: z.object({ e164: z.string().min(5, 'Landline number is required') }),
    branch_email: z.string().email('Valid email is required'),
});

export function BranchWizard({ tenantSlug, tenantId, mainBranchId }: BranchWizardProps) {
    const router = useRouter();
    const [mainBranches, setMainBranches] = useState<Array<{ id: string; branch_name: string; brand_id: string }>>([]);

    useEffect(() => {
        const token = localStorage.getItem('session_token');
        fetch('/v1/admin/branches', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => r.json())
            .then((data: Array<{ id: string; branch_name: string; is_main_branch: boolean; brand_id: string }>) => {
                setMainBranches(Array.isArray(data) ? data.filter(b => b.is_main_branch) : []);
            })
            .catch(() => {});
    }, []);

    const steps: WizardStep[] = [
        {
            title: 'Main Branch',
            helper: 'Which main school does this branch belong to?',
            illustration: <BrandIllustration />,
            schema: step1Schema,
            content: ({ data, onChange, errors }) => (
                <FieldWrapper label="Main Branch" required state={errors.parent_branch_id ? 'error' : data.parent_branch_id ? 'success' : 'idle'} error={errors.parent_branch_id}>
                    <select
                        value={data.parent_branch_id || mainBranchId || ''}
                        onChange={e => onChange({ parent_branch_id: e.target.value })}
                        className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                    >
                        <option value="">— Select main branch —</option>
                        {mainBranches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                    </select>
                </FieldWrapper>
            ),
        },
        {
            title: 'Branch Details',
            helper: 'Information about this campus or branch.',
            illustration: <SchoolIllustration />,
            schema: step2Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <FieldWrapper label="Branch Name" required state={errors.branch_name ? 'error' : data.branch_name ? 'success' : 'idle'} error={errors.branch_name}>
                        <input type="text" value={data.branch_name || ''} onChange={e => onChange({ branch_name: e.target.value })} placeholder="e.g. Soweto Campus" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>
                    <FieldWrapper label="Branch Code" required state={errors.branch_code ? 'error' : data.branch_code ? 'success' : 'idle'} error={errors.branch_code} helper="Short unique code">
                        <input type="text" value={data.branch_code || ''} onChange={e => onChange({ branch_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} placeholder="SOWETO" maxLength={20} className="w-full px-3 py-3 text-sm bg-transparent outline-none font-mono" />
                    </FieldWrapper>
                    <FieldWrapper label="Curriculum" required state={errors.curriculum_framework ? 'error' : data.curriculum_framework ? 'success' : 'idle'} error={errors.curriculum_framework}>
                        <select value={data.curriculum_framework || ''} onChange={e => onChange({ curriculum_framework: e.target.value })} className="w-full px-3 py-3 text-sm bg-transparent outline-none">
                            <option value="">— Select —</option>
                            {CURRICULUM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FieldWrapper>
                    {data.curriculum_framework === 'CAPS' && (
                        <FieldWrapper label="EMIS Number" state="idle">
                            <input type="text" value={data.emis_number || ''} onChange={e => onChange({ emis_number: e.target.value })} placeholder="e.g. 700140086" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    )}
                    <FieldWrapper label="About" state="idle">
                        <textarea value={data.about || ''} onChange={e => onChange({ about: e.target.value })} rows={3} placeholder="Describe this branch..." className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none" />
                    </FieldWrapper>
                </>
            ),
        },
        {
            title: 'Branding',
            helper: 'Upload this branch logo and cover.',
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
            helper: 'Where is this branch located?',
            illustration: <MapIllustration />,
            schema: step4Schema,
            content: ({ data, onChange }) => (
                <AddressInput label="Physical Address" value={data.address || EMPTY_ADDRESS} onChange={addr => onChange({ address: addr })} required />
            ),
        },
        {
            title: 'Contact',
            helper: 'Contact details for this branch.',
            illustration: <ContactIllustration />,
            schema: step5Schema,
            content: ({ data, onChange, draftId }) => (
                <>
                    <PhoneInput label="Mobile / WhatsApp" value={data.mobile || EMPTY_PHONE} onChange={v => onChange({ mobile: v })} required />
                    <PhoneInput label="Landline" value={data.landline || EMPTY_PHONE} onChange={v => onChange({ landline: v })} required />
                    <EmailInput label="Branch Email" value={data.branch_email || ''} onChange={v => onChange({ branch_email: v })} draftId={draftId || ''} onVerified={email => onChange({ branch_email: email, branch_email_verified: true })} required />
                    <FieldWrapper label="Secondary Email" state="idle">
                        <input type="email" value={data.secondary_email || ''} onChange={e => onChange({ secondary_email: e.target.value })} placeholder="secondary@school.co.za" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>
                </>
            ),
        },
        {
            title: 'Review',
            helper: 'Confirm all details before creating this branch.',
            illustration: <ReviewIllustration />,
            content: ({ data }) => (
                <div className="flex flex-col gap-4">
                    {[
                        { label: 'Branch Name', value: data.branch_name },
                        { label: 'Code', value: data.branch_code },
                        { label: 'Curriculum', value: data.curriculum_framework },
                        { label: 'Address', value: data.address?.formatted_address },
                        { label: 'Mobile', value: data.mobile?.e164 || data.mobile?.raw },
                        { label: 'Landline', value: data.landline?.e164 || data.landline?.raw },
                        { label: 'Email', value: data.branch_email, badge: data.branch_email_verified ? '✓ Verified' : undefined },
                    ].filter(i => i.value).map(item => (
                        <div key={item.label} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <span className="text-xs font-medium text-slate-400 w-24 flex-shrink-0">{item.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-700 dark:text-slate-200">{item.value}</span>
                                {item.badge && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.badge}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    const handleComplete = async (data: Record<string, any>) => {
        const token = localStorage.getItem('session_token');
        const body = {
            is_main_branch: false,
            tenant_id: tenantId,
            parent_branch_id: data.parent_branch_id || mainBranchId,
            branch_name: data.branch_name,
            branch_code: data.branch_code,
            curriculum_framework: data.curriculum_framework,
            emis_number: data.emis_number || null,
            about: data.about || null,
            school_logo_url: data.school_logo_url || null,
            cover_photo_url: data.cover_photo_url || null,
            image_gallery_urls: data.image_gallery_urls || [],
            google_place_id: data.address?.google_place_id || null,
            formatted_address: data.address?.formatted_address || null,
            address_components: data.address ? { street: data.address.street, suburb: data.address.suburb, city: data.address.city, province: data.address.province, postal_code: data.address.postal_code, country: data.address.country } : null,
            geo: data.address?.lat ? { lat: data.address.lat, lng: data.address.lng } : null,
            physical_address: data.address?.formatted_address || null,
            mobile_whatsapp: data.mobile?.raw || null,
            mobile_e164: data.mobile?.e164 || null,
            mobile_country_iso2: data.mobile?.country_iso2 || null,
            mobile_dial_code: data.mobile?.dial_code || null,
            phone_landline: data.landline?.raw || null,
            landline_e164: data.landline?.e164 || null,
            landline_country_iso2: data.landline?.country_iso2 || null,
            landline_dial_code: data.landline?.dial_code || null,
            branch_email: data.branch_email || null,
            secondary_email: data.secondary_email || null,
            branch_email_verified: data.branch_email_verified || false,
        };
        const res = await fetch('/v1/admin/branches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to create branch');
        router.push(`/tenant/${tenantSlug}/admin/branches`);
    };

    return (
        <WizardShell
            steps={steps}
            formType="BRANCH"
            tenantId={tenantId}
            submitLabel="Create Branch"
            onComplete={handleComplete}
            onCancel={() => router.push(`/tenant/${tenantSlug}/admin/branches`)}
        />
    );
}
