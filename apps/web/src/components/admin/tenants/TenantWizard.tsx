'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { LookupSelect } from '../inputs/LookupSelect';
import { AddressInput, AddressValue } from '../inputs/AddressInput';
import { PhoneInput, PhoneValue } from '../inputs/PhoneInput';
import { LogoUpload } from '../inputs/LogoUpload';
import { CoverUpload } from '../inputs/CoverUpload';
import { GalleryUpload } from '../inputs/GalleryUpload';
import { IllustrationSlot } from '../illustrations/IllustrationSlot';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { NotifItem } from '@/components/dashboard/NotifItem';
import { MOCK_ADMIN_EVENTS } from '@/lib/calendar-events';
import { authFetch } from '@/lib/authFetch';

interface TenantWizardProps {
    tenantSlug: string;
}

const TENANT_TYPES = [
    { key: 'school', label: 'School', icon: 'school', desc: 'A standalone school with no branch structure' },
    { key: 'main_branch', label: 'Main Branch', icon: 'corporate_fare', desc: 'The primary campus of a multi-branch school' },
    { key: 'branch', label: 'Branch', icon: 'domain_add', desc: 'A secondary campus linked to a main branch' },
    { key: 'campus', label: 'Campus', icon: 'location_city', desc: 'A satellite campus within a school group' },
];

/** Mirror of backend generateTenantSlug — 3-6 alpha chars for preview */
function tenantSlugPreview(name: string): string {
    const words = name.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w));
    let slug = words.length >= 3
        ? words.map(w => w.replace(/[^a-zA-Z]/g, '')[0] || '').join('').toLowerCase()
        : (words[0] || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    slug = slug.substring(0, 6);
    if (slug.length < 3) slug = slug.padEnd(3, 'x');
    return slug;
}

/** Mirror of backend generateSchoolCode — 3-letter prefix + 3-digit number */
function codePreview(name: string): string {
    return name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X') + '001';
}

const EMPTY_PHONE: PhoneValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = {
    formatted_address: '', google_place_id: '', street: '', suburb: '',
    city: '', province: '', postal_code: '', country: '', country_iso2: '', lat: null, lng: null,
};

/* iOS-style input classes — matches BrandWizard */
const inputCls = 'w-full h-[44px] px-4 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]';
const textareaCls = 'w-full px-4 py-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)] resize-none leading-relaxed';
const readOnlyCls = 'w-full h-[44px] px-4 text-[14px] font-mono bg-[hsl(var(--admin-surface-alt)/0.4)] text-[hsl(var(--admin-text-muted))] outline-none cursor-default';

const step1Schema = z.object({
    tenant_type: z.string().min(1, 'Please select a school type'),
});

const step3Schema = z.object({
    school_name: z.string().min(2, 'School name must be at least 2 characters'),
});

const step6Schema = z.object({
    initial_admin_email: z.string().email('Please enter a valid email').or(z.literal('')),
});

export function TenantWizard({ tenantSlug }: TenantWizardProps) {
    const router = useRouter();
    const [createdTenant, setCreatedTenant] = useState<{ slug: string; school_name: string } | null>(null);

    const steps: WizardStep[] = [
        // Step 1: School Type
        {
            title: 'School Type',
            helper: 'What type of school are you creating?',
            illustration: <IllustrationSlot slotKey="tenant_step_1" />,
            schema: step1Schema,
            content: ({ data, onChange, errors }) => (
                <div className="flex flex-col gap-3">
                    {TENANT_TYPES.map(t => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => onChange({ tenant_type: t.key })}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                data.tenant_type === t.key
                                    ? 'border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.06)]'
                                    : 'border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary)/0.4)] bg-[hsl(var(--admin-surface-alt)/0.3)]'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                data.tenant_type === t.key
                                    ? 'bg-[hsl(var(--admin-primary))] text-white'
                                    : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))]'
                            }`}>
                                <span className="material-symbols-outlined text-[24px]">{t.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-bold text-[hsl(var(--admin-text-main))]">{t.label}</p>
                                <p className="text-[12px] text-[hsl(var(--admin-text-muted))] mt-0.5">{t.desc}</p>
                            </div>
                            {data.tenant_type === t.key && (
                                <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] flex-shrink-0">check_circle</span>
                            )}
                        </button>
                    ))}
                    {errors.tenant_type && (
                        <p className="text-[12px] text-red-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.tenant_type}
                        </p>
                    )}
                </div>
            ),
        },

        // Step 2: Brand & Group
        {
            title: 'Brand & Group',
            helper: 'Link this school to a brand and optionally to a parent school.',
            illustration: <IllustrationSlot slotKey="tenant_step_2" />,
            content: ({ data, onChange }) => (
                <>
                    <LookupSelect
                        label="Brand"
                        value={data.brand_id || ''}
                        onChange={v => onChange({ brand_id: v as string })}
                        endpoint="/v1/admin/brands"
                        labelKey="brand_name"
                        valueKey="id"
                        placeholder="— Select a brand (optional) —"
                    />
                    {(data.tenant_type === 'branch' || data.tenant_type === 'campus') && (
                        <LookupSelect
                            label="Parent School (Main Branch)"
                            value={data.parent_tenant_id || ''}
                            onChange={v => onChange({ parent_tenant_id: v as string })}
                            endpoint="/v1/admin/tenants"
                            filterParams={{ status: 'active' }}
                            labelKey="school_name"
                            valueKey="id"
                            required
                            placeholder="— Select the main branch —"
                            error={!data.parent_tenant_id && (data.tenant_type === 'branch' || data.tenant_type === 'campus') ? '' : undefined}
                        />
                    )}
                </>
            ),
        },

        // Step 3: School Details
        {
            title: 'School Details',
            helper: 'Enter the core information about this school.',
            illustration: <IllustrationSlot slotKey="tenant_step_3" />,
            schema: step3Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <FieldWrapper
                        label="School Name"
                        required
                        state={errors.school_name ? 'error' : data.school_name ? 'success' : 'idle'}
                        error={errors.school_name}
                    >
                        <input
                            type="text"
                            value={data.school_name || ''}
                            onChange={e => {
                                const name = e.target.value;
                                onChange({
                                    school_name: name,
                                    tenant_slug: tenantSlugPreview(name),
                                    school_code: codePreview(name),
                                });
                            }}
                            placeholder="Enter school name"
                            className={inputCls}
                        />
                    </FieldWrapper>
                    <FieldWrapper label="Legal Name" state={data.legal_name ? 'success' : 'idle'} helper="Official registered entity name (if different)">
                        <input type="text" value={data.legal_name || ''} onChange={e => onChange({ legal_name: e.target.value })} placeholder="e.g. Rainbow City Schools (Pty) Ltd" className={inputCls} />
                    </FieldWrapper>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] px-1">Subdomain</label>
                            <div className={`${readOnlyCls} flex items-center gap-2 rounded-xl border border-[hsl(var(--admin-border)/0.5)]`}>
                                <span className="material-symbols-outlined text-[15px] text-[hsl(var(--admin-text-muted))] flex-shrink-0">lock</span>
                                <span className="flex-1 truncate">{data.tenant_slug || '—'}</span>
                                <span className="text-[11px] text-[hsl(var(--admin-text-muted))] flex-shrink-0">.edapp.co.za</span>
                            </div>
                            <p className="text-[11px] text-[hsl(var(--admin-text-muted))] px-1">Auto-generated from school name</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] px-1">School Code</label>
                            <div className={`${readOnlyCls} flex items-center gap-2 rounded-xl border border-[hsl(var(--admin-border)/0.5)]`}>
                                <span className="material-symbols-outlined text-[15px] text-[hsl(var(--admin-text-muted))] flex-shrink-0">lock</span>
                                <span className="font-mono">{data.school_code || '—'}</span>
                            </div>
                            <p className="text-[11px] text-[hsl(var(--admin-text-muted))] px-1">Auto-generated from school name</p>
                        </div>
                    </div>
                    <FieldWrapper label="About" state="idle" helper="A short description of this school">
                        <textarea value={data.about || ''} onChange={e => onChange({ about: e.target.value })} rows={3} placeholder="Describe this school..." className={textareaCls} />
                    </FieldWrapper>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldWrapper label="EMIS Number" state={data.emis_number ? 'success' : 'idle'} helper="DoE EMIS number">
                            <input type="text" value={data.emis_number || ''} onChange={e => onChange({ emis_number: e.target.value })} placeholder="e.g. 700360015" className={inputCls} />
                        </FieldWrapper>
                        <FieldWrapper label="Area Label" state={data.area_label ? 'success' : 'idle'} helper="Displayed as location subtitle">
                            <input type="text" value={data.area_label || ''} onChange={e => onChange({ area_label: e.target.value })} placeholder="e.g. Robertsham" className={inputCls} />
                        </FieldWrapper>
                    </div>
                </>
            ),
        },

        // Step 4: Contact & Location
        {
            title: 'Contact & Location',
            helper: 'Add contact details and the physical address for this school.',
            illustration: <IllustrationSlot slotKey="tenant_step_4" />,
            content: ({ data, onChange }) => (
                <>
                    <FieldWrapper label="Contact Email" state={data.contact_email ? 'success' : 'idle'}>
                        <input type="email" value={data.contact_email || ''} onChange={e => onChange({ contact_email: e.target.value })} placeholder="info@school.co.za" className={inputCls} />
                    </FieldWrapper>
                    <FieldWrapper label="Secondary Email" state={data.secondary_email ? 'success' : 'idle'}>
                        <input type="email" value={data.secondary_email || ''} onChange={e => onChange({ secondary_email: e.target.value })} placeholder="admin@school.co.za" className={inputCls} />
                    </FieldWrapper>
                    <PhoneInput
                        label="Contact Phone"
                        value={data.contact_phone_obj || EMPTY_PHONE}
                        onChange={v => onChange({ contact_phone_obj: v, contact_phone: v.e164 || v.raw })}
                    />
                    <AddressInput
                        label="Physical Address"
                        value={data.physical_address || EMPTY_ADDRESS}
                        onChange={v => onChange({ physical_address: v })}
                    />
                </>
            ),
        },

        // Step 5: Branding & Media
        {
            title: 'Branding & Media',
            helper: 'Upload the school logo, cover image, and optional gallery photos.',
            illustration: <IllustrationSlot slotKey="tenant_step_5" />,
            content: ({ data, onChange }) => (
                <>
                    <LogoUpload
                        label="School Logo"
                        value={data.logo_file_id || ''}
                        onChange={key => onChange({ logo_file_id: key })}
                    />
                    <CoverUpload
                        label="Cover Photo"
                        value={data.cover_file_id || ''}
                        onChange={key => onChange({ cover_file_id: key })}
                    />
                    <GalleryUpload
                        label="School Gallery"
                        value={data.gallery_file_ids || []}
                        onChange={keys => onChange({ gallery_file_ids: keys })}
                        max={8}
                    />
                </>
            ),
        },

        // Step 6: Initial Admin
        {
            title: 'Initial Admin',
            helper: 'Invite the first administrator for this school. They will receive an email to set up their account.',
            illustration: <IllustrationSlot slotKey="tenant_step_6" />,
            schema: step6Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <FieldWrapper
                        label="Admin Email"
                        state={errors.initial_admin_email ? 'error' : data.initial_admin_email ? 'success' : 'idle'}
                        error={errors.initial_admin_email}
                        helper="This person will be assigned the tenant_admin role"
                    >
                        <input
                            type="email"
                            value={data.initial_admin_email || ''}
                            onChange={e => onChange({ initial_admin_email: e.target.value })}
                            placeholder="admin@school.co.za"
                            className={inputCls}
                        />
                    </FieldWrapper>
                    <FieldWrapper
                        label="Admin Display Name"
                        state={data.initial_admin_name ? 'success' : 'idle'}
                        helper="Optional — defaults to the email prefix"
                    >
                        <input
                            type="text"
                            value={data.initial_admin_name || ''}
                            onChange={e => onChange({ initial_admin_name: e.target.value })}
                            placeholder="e.g. John Smith"
                            className={inputCls}
                        />
                    </FieldWrapper>
                    <div className="rounded-2xl bg-[hsl(var(--admin-primary)/0.06)] border border-[hsl(var(--admin-primary)/0.2)] p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] text-[20px] mt-0.5 flex-shrink-0">info</span>
                            <div>
                                <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-main))]">What happens next?</p>
                                <p className="text-[12px] text-[hsl(var(--admin-text-sub))] mt-1 leading-relaxed">
                                    After creating the school, a user account and tenant_admin role will be created for this email. The admin can log in to manage this school immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            ),
        },

        // Step 7: Review & Create
        {
            title: 'Review & Create',
            helper: 'Review all details before creating this school.',
            illustration: <IllustrationSlot slotKey="tenant_step_7" />,
            content: ({ data }) => {
                const typeLabel = TENANT_TYPES.find(t => t.key === data.tenant_type)?.label || data.tenant_type;
                return (
                    <div className="flex flex-col gap-3">
                        <div className="ios-card flex flex-col gap-3">
                            <p className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">School</p>
                            <ReviewRow label="Type" value={typeLabel} />
                            <ReviewRow label="School Name" value={data.school_name} />
                            {data.legal_name && <ReviewRow label="Legal Name" value={data.legal_name} />}
                            <ReviewRow label="URL Slug" value={data.tenant_slug} mono />
                            <ReviewRow label="School Code" value={data.school_code} mono />
                            {data.area_label && <ReviewRow label="Area" value={data.area_label} />}
                            {data.emis_number && <ReviewRow label="EMIS" value={data.emis_number} />}
                        </div>

                        {(data.contact_email || data.contact_phone) && (
                            <div className="ios-card flex flex-col gap-3">
                                <p className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Contact</p>
                                {data.contact_email && <ReviewRow label="Email" value={data.contact_email} />}
                                {data.secondary_email && <ReviewRow label="Secondary" value={data.secondary_email} />}
                                {data.contact_phone && <ReviewRow label="Phone" value={data.contact_phone} />}
                                {data.physical_address?.formatted_address && <ReviewRow label="Address" value={data.physical_address.formatted_address} />}
                            </div>
                        )}

                        <div className="ios-card flex flex-col gap-3">
                            <p className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Assets & Admin</p>
                            <div className="flex gap-4">
                                <ReviewCheck label="Logo" done={!!data.logo_file_id} />
                                <ReviewCheck label="Cover" done={!!data.cover_file_id} />
                                <ReviewCheck label="Gallery" done={(data.gallery_file_ids || []).length > 0} />
                            </div>
                            {data.initial_admin_email && <ReviewRow label="Initial Admin" value={data.initial_admin_email} />}
                        </div>

                        <p className="text-[12px] text-[hsl(var(--admin-text-muted))] px-1">
                            Domain: <span className="font-mono text-[hsl(var(--admin-text-sub))]">{data.tenant_slug || '...'}.edapp.co.za</span>
                        </p>
                    </div>
                );
            },
        },
    ];

    const handleComplete = async (data: Record<string, any>) => {
        const res = await authFetch('/v1/admin/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                school_name: data.school_name,
                legal_name: data.legal_name || null,
                tenant_slug: data.tenant_slug || undefined,
                school_code: data.school_code || undefined,
                tenant_type: data.tenant_type,
                brand_id: data.brand_id || null,
                parent_tenant_id: data.parent_tenant_id || null,
                about: data.about || null,
                emis_number: data.emis_number || null,
                area_label: data.area_label || null,
                contact_email: data.contact_email || null,
                contact_phone: data.contact_phone || null,
                secondary_email: data.secondary_email || null,
                physical_address: data.physical_address?.formatted_address ? data.physical_address : null,
                country_code: data.physical_address?.country_iso2 || 'ZA',
                logo_file_id: data.logo_file_id || null,
                cover_file_id: data.cover_file_id || null,
                gallery_file_ids: data.gallery_file_ids || [],
            }),
        });
        const tenant = await res.json();
        if (!res.ok) throw new Error(tenant.message || 'Failed to create school');

        if (data.initial_admin_email) {
            try {
                await authFetch(`/v1/admin/tenants/${tenant.id}/invite-admin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: data.initial_admin_email,
                        display_name: data.initial_admin_name || undefined,
                    }),
                });
            } catch {
                // Non-fatal — tenant was created, admin invite can be retried
            }
        }

        setCreatedTenant({ slug: tenant.tenant_slug, school_name: tenant.school_name });
    };

    const dashboardPanel = (
        <div className="flex flex-col gap-4">
            <MiniCalendar events={MOCK_ADMIN_EVENTS} />
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

    if (createdTenant) {
        return (
            <div className="brand-wizard-container">
                <div className="flex flex-col items-center gap-5 p-8 text-center max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 text-[32px]">check_circle</span>
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-[hsl(var(--admin-text-main))]">
                            {createdTenant.school_name} created!
                        </h2>
                        <p className="text-[14px] text-[hsl(var(--admin-text-muted))] mt-1">
                            The school is now active on the platform.
                        </p>
                    </div>
                    <div className="w-full ios-card p-4 text-left space-y-2">
                        <p className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">Tenant Login Link</p>
                        <p className="text-[15px] font-mono font-bold text-[hsl(var(--admin-primary))] break-all">
                            {createdTenant.slug}.edapp.co.za
                        </p>
                        <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(`https://${createdTenant.slug}.edapp.co.za`)}
                            className="text-[12px] text-[hsl(var(--admin-primary))] font-semibold flex items-center gap-1 mt-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            Copy link
                        </button>
                    </div>
                    <div className="flex gap-2 w-full">
                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                            <button
                                type="button"
                                onClick={() => (navigator as any).share({
                                    title: createdTenant.school_name,
                                    url: `https://${createdTenant.slug}.edapp.co.za`,
                                })}
                                className="flex-1 h-10 rounded-xl border border-[hsl(var(--admin-border)/0.6)] text-[13px] font-medium text-[hsl(var(--admin-text-main))] flex items-center justify-center gap-1.5 active:bg-[hsl(var(--admin-surface-alt))]"
                            >
                                <span className="material-symbols-outlined text-[15px]">share</span>
                                Share
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => window.open(`https://${createdTenant.slug}.edapp.co.za`, '_blank')}
                            className="flex-1 h-10 rounded-xl border border-[hsl(var(--admin-border)/0.6)] text-[13px] font-medium text-[hsl(var(--admin-text-main))] flex items-center justify-center gap-1.5 active:bg-[hsl(var(--admin-surface-alt))]"
                        >
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                            Open
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push(`/tenant/${tenantSlug}/admin/tenants`)}
                        className="h-11 px-6 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 transition-all"
                    >
                        Back to Schools
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="brand-wizard-container">
            <WizardShell
                steps={steps}
                formType="TENANT_CREATE"
                submitLabel="Create School"
                onComplete={handleComplete}
                onCancel={() => router.push(`/tenant/${tenantSlug}/admin/tenants`)}
                sidePanel={dashboardPanel}
            />
        </div>
    );
}

function ReviewRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <p className="text-[12px] font-medium text-[hsl(var(--admin-text-muted))] flex-shrink-0">{label}</p>
            <p className={`text-[13px] font-semibold text-[hsl(var(--admin-text-main))] text-right ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
        </div>
    );
}

function ReviewCheck({ label, done }: { label: string; done: boolean }) {
    return (
        <div className="flex items-center gap-1.5 text-[12px]">
            <span className={`material-symbols-outlined text-[16px] ${done ? 'text-green-500' : 'text-[hsl(var(--admin-border))]'}`}>
                {done ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span className={done ? 'text-green-700 font-semibold' : 'text-[hsl(var(--admin-text-muted))]'}>{label}</span>
        </div>
    );
}
