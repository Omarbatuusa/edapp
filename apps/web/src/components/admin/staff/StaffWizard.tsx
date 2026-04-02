'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { DateField } from '../inputs/DateField';
import { PhoneField, PhoneFieldValue } from '../inputs/PhoneField';
import { AddressInput, AddressValue } from '../inputs/AddressInput';
import { LookupSelect } from '../inputs/LookupSelect';
import { ConditionalFieldGroup } from '../inputs/ConditionalFieldGroup';
import { DocumentUpload, DocFile } from '../inputs/DocumentUpload';
import DateOfBirthInput from '../inputs/DateOfBirthInput';
import { StaffIllustration } from '../illustrations/StaffIllustration';
import { DocumentIllustration } from '../illustrations/DocumentIllustration';
import { EnrollmentIllustration } from '../illustrations/EnrollmentIllustration';
import { MedicalIllustration } from '../illustrations/MedicalIllustration';
import { initialsFromName } from '@/lib/name-validation';
import { validateName, validateEmail, validateEmailOptional, validateSaId, validateSaIdDobMatch, validatePassport, validatePermit, validateSace, validateDateNotWeekend, validateJoiningDateNotTooOld, autoCapitalizeName } from '@/lib/validators';

const EMPTY_PHONE: PhoneFieldValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = { formatted_address: '', google_place_id: '', street: '', suburb: '', city: '', province: '', postal_code: '', country: '', lat: null, lng: null };

interface StaffWizardProps {
    tenantSlug: string;
    tenantId?: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const step1Schema = z.object({
    first_name: z.string().min(2, 'First name is required (min 2 chars)'),
    last_name: z.string().min(2, 'Last name is required (min 2 chars)'),
    email: z.string().email('Valid email is required'),
});

const STAFF_DOC_TYPES = [
    { code: 'sa_id', label: 'SA ID Copy' },
    { code: 'passport', label: 'Passport Copy' },
    { code: 'permit', label: 'Permit Copy' },
    { code: 'matric_cert', label: 'Matric Certificate' },
    { code: 'tertiary_qual', label: 'Tertiary Qualification' },
    { code: 'academic_transcripts', label: 'Academic Transcripts' },
    { code: 'sace_cert', label: 'SACE Certificate' },
    { code: 'proof_of_residence', label: 'Proof of Residence' },
    { code: 'cv', label: 'CV / Resume' },
    { code: 'reference_letters', label: 'Reference Letters' },
    { code: 'teaching_practice', label: 'Proof of Teaching Practice' },
    { code: 'first_aid', label: 'First Aid Certificate' },
];

export function StaffWizard({ tenantSlug, tenantId }: StaffWizardProps) {
    const router = useRouter();
    const [branches, setBranches] = useState<Array<{ id: string; branch_name: string }>>([]);

    useEffect(() => {
        fetch('/v1/admin/branches', { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(data => setBranches(Array.isArray(data) ? data : data.items || data.data || []))
            .catch(() => {});
    }, []);

    const steps: WizardStep[] = [
        // ── Step 1: Identity & Contact ──
        {
            title: 'Identity & Contact',
            helper: 'Name, email, and contact numbers for the staff member.',
            illustration: <StaffIllustration />,
            schema: step1Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <LookupSelect
                        label="Title"
                        value={data.title_code || ''}
                        onChange={v => onChange({ title_code: v as string })}
                        dictName="salutations"
                        placeholder="-- Select title --"
                    />

                    <FieldWrapper label="First Name" required icon="person" state={errors.first_name ? 'error' : (data.first_name ? (validateName(data.first_name) ? 'error' : 'success') : 'idle')} error={errors.first_name || (data.first_name ? (validateName(data.first_name) || undefined) : undefined)}>
                        <input type="text" value={data.first_name || ''} onChange={e => onChange({ first_name: e.target.value })} onBlur={() => { if (data.first_name) onChange({ first_name: autoCapitalizeName(data.first_name) }); }} placeholder="First name" aria-label="First Name" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <FieldWrapper label="Last Name" required icon="person" state={errors.last_name ? 'error' : (data.last_name ? (validateName(data.last_name) ? 'error' : 'success') : 'idle')} error={errors.last_name || (data.last_name ? (validateName(data.last_name) || undefined) : undefined)}>
                        <input type="text" value={data.last_name || ''} onChange={e => onChange({ last_name: e.target.value })} onBlur={() => { if (data.last_name) onChange({ last_name: autoCapitalizeName(data.last_name) }); }} placeholder="Last name" aria-label="Last Name" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <FieldWrapper label="Preferred Name(s)" icon="person" state={data.preferred_name ? 'success' : 'idle'}>
                        <input type="text" value={data.preferred_name || ''} onChange={e => onChange({ preferred_name: e.target.value })} onBlur={() => { if (data.preferred_name) onChange({ preferred_name: autoCapitalizeName(data.preferred_name) }); }} placeholder="Preferred / known-as name" aria-label="Preferred Name" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <FieldWrapper label="Initials" state={data.initials ? 'success' : 'idle'} helper="Auto-generated from name">
                        <input
                            type="text"
                            value={data.initials || (data.first_name && data.last_name ? initialsFromName(data.first_name, data.last_name) : '')}
                            onChange={e => onChange({ initials: e.target.value })}
                            placeholder="e.g. JD"
                            maxLength={5}
                            aria-label="Initials"
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]"
                        />
                    </FieldWrapper>

                    <FieldWrapper label="Email" required icon="email" state={errors.email ? 'error' : (data.email ? (validateEmail(data.email) ? 'error' : 'success') : 'idle')} error={errors.email || (data.email ? (validateEmail(data.email) || undefined) : undefined)}>
                        <input type="email" value={data.email || ''} onChange={e => onChange({ email: e.target.value })} placeholder="email@example.com" aria-label="Email" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <FieldWrapper label="Secondary Email" icon="email" state={data.secondary_email ? (validateEmailOptional(data.secondary_email) ? 'error' : 'success') : 'idle'} error={data.secondary_email ? (validateEmailOptional(data.secondary_email) || undefined) : undefined}>
                        <input type="email" value={data.secondary_email || ''} onChange={e => onChange({ secondary_email: e.target.value })} placeholder="Personal email" aria-label="Secondary Email" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <PhoneField label="Mobile" value={data.mobile || EMPTY_PHONE} onChange={v => onChange({ mobile: v })} placeholder="e.g. 060 000 0000" />
                    <PhoneField label="Alternate Phone" value={data.alt_phone || EMPTY_PHONE} onChange={v => onChange({ alt_phone: v })} placeholder="e.g. 011 000 0000" />
                    <PhoneField label="Home Phone" value={data.home_phone || EMPTY_PHONE} onChange={v => onChange({ home_phone: v })} placeholder="e.g. 012 000 0000" />
                </>
            ),
        },

        // ── Step 2: Personal Details ──
        {
            title: 'Personal Details',
            helper: 'Date of birth, demographics, and identification.',
            illustration: <MedicalIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <DateOfBirthInput
                        label="Date of Birth"
                        value={data.dob || ''}
                        onChange={v => onChange({ dob: v })}
                        context="staff"
                        employmentStartDate={data.joining_date}
                    />

                    <LookupSelect label="Gender" value={data.gender_code || ''} onChange={v => onChange({ gender_code: v as string })} dictName="genders" />
                    <LookupSelect label="Religion" value={data.religion_code || ''} onChange={v => onChange({ religion_code: v as string })} dictName="religions" />
                    <LookupSelect label="Race" value={data.race_code || ''} onChange={v => onChange({ race_code: v as string })} dictName="races" />
                    <LookupSelect label="Marital Status" value={data.marital_status_code || ''} onChange={v => onChange({ marital_status_code: v as string })} dictName="marital_statuses" />

                    <LookupSelect
                        label="Citizenship Type"
                        value={data.citizenship_type || ''}
                        onChange={v => onChange({ citizenship_type: v as string })}
                        dictName="citizenship_types"
                    />

                    <ConditionalFieldGroup watchValue={data.citizenship_type || ''} showWhen={['sa_citizen', 'SA_CITIZEN', 'permanent_resident', 'PERMANENT_RESIDENT']}>
                        <FieldWrapper label="SA ID Number" icon="badge" state={(() => { const err = data.sa_id_number ? (validateSaId(data.sa_id_number) || validateSaIdDobMatch(data.sa_id_number, data.date_of_birth || '')) : null; return err ? 'error' : data.sa_id_number ? 'success' : 'idle'; })()} error={data.sa_id_number ? (validateSaId(data.sa_id_number) || validateSaIdDobMatch(data.sa_id_number, data.date_of_birth || '') || undefined) : undefined}>
                            <input type="text" value={data.sa_id_number || ''} onChange={e => onChange({ sa_id_number: e.target.value.replace(/\D/g, '').slice(0, 13) })} placeholder="13-digit SA ID number" maxLength={13} aria-label="SA ID Number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                        </FieldWrapper>
                    </ConditionalFieldGroup>

                    <ConditionalFieldGroup watchValue={data.citizenship_type || ''} showWhen={['foreign_national', 'FOREIGN_NATIONAL', 'refugee', 'REFUGEE', 'asylum_seeker', 'ASYLUM_SEEKER']}>
                        <FieldWrapper label="Passport Number" icon="flight" state={(() => { const err = data.passport_number ? validatePassport(data.passport_number) : null; return err ? 'error' : data.passport_number ? 'success' : 'idle'; })()} error={data.passport_number ? (validatePassport(data.passport_number) || undefined) : undefined}>
                            <input type="text" value={data.passport_number || ''} onChange={e => onChange({ passport_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9) })} placeholder="Passport number" aria-label="Passport Number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                        </FieldWrapper>
                        <LookupSelect label="Permit Type" value={data.permit_type_code || ''} onChange={v => onChange({ permit_type_code: v as string })} dictName="permit_types" />
                        <FieldWrapper label="Permit Number" icon="description" state={(() => { const err = data.permit_number ? validatePermit(data.permit_number, data.permit_type_code || '') : null; return err ? 'error' : data.permit_number ? 'success' : 'idle'; })()} error={data.permit_number ? (validatePermit(data.permit_number, data.permit_type_code || '') || undefined) : undefined}>
                            <input type="text" value={data.permit_number || ''} onChange={e => onChange({ permit_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 13) })} placeholder="Permit number" aria-label="Permit Number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                        </FieldWrapper>
                    </ConditionalFieldGroup>

                    <FieldWrapper label="Bio / Notes" state={data.bio ? 'success' : 'idle'}>
                        <textarea value={data.bio || ''} onChange={e => onChange({ bio: e.target.value })} rows={3} placeholder="Short bio or notes..." className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>
                </>
            ),
        },

        // ── Step 3: Address & Employment ──
        {
            title: 'Address & Employment',
            helper: 'Residential address and employment details.',
            illustration: <EnrollmentIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <AddressInput
                        label="Residential Address"
                        value={data.address || EMPTY_ADDRESS}
                        onChange={addr => onChange({ address: addr })}
                    />

                    <FieldWrapper label="Assigned Branch" state={data.branch_id ? 'success' : 'idle'}>
                        <select
                            value={data.branch_id || ''}
                            onChange={e => onChange({ branch_id: e.target.value })}
                            aria-label="Assigned Branch"
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]"
                        >
                            <option value="">-- Select branch --</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                        </select>
                    </FieldWrapper>

                    <DateField label="Employment Start Date" value={data.joining_date || ''} onChange={v => onChange({ joining_date: v })} error={data.joining_date ? (validateDateNotWeekend(data.joining_date) || validateJoiningDateNotTooOld(data.joining_date) || undefined) : undefined} />

                    <LookupSelect label="Employment Type" value={data.employment_type_code || ''} onChange={v => onChange({ employment_type_code: v as string })} dictName="employment_types" />

                    <FieldWrapper label="Staff Code" state={data.staff_code ? 'success' : 'idle'} helper="Auto-generated if left blank">
                        <input type="text" value={data.staff_code || ''} onChange={e => onChange({ staff_code: e.target.value })} placeholder="Auto-generated" aria-label="Staff Code" className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <FieldWrapper label="Department" state={data.department ? 'success' : 'idle'}>
                        <input type="text" value={data.department || ''} onChange={e => onChange({ department: e.target.value })} placeholder="e.g. Mathematics, Admin" aria-label="Department" className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <FieldWrapper label="Job Title" state={data.job_title ? 'success' : 'idle'}>
                        <input type="text" value={data.job_title || ''} onChange={e => onChange({ job_title: e.target.value })} placeholder="e.g. Senior Teacher, Admin Clerk" aria-label="Job Title" className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <FieldWrapper label="SACE Number" icon="school" state={(() => { const err = data.sace_number ? validateSace(data.sace_number) : null; return err ? 'error' : data.sace_number ? 'success' : 'idle'; })()} error={data.sace_number ? (validateSace(data.sace_number) || undefined) : undefined} helper={!data.sace_number || !validateSace(data.sace_number) ? 'South African Council for Educators' : undefined}>
                        <input type="text" value={data.sace_number || ''} onChange={e => onChange({ sace_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) })} placeholder="e.g. 123456" aria-label="SACE Number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                    </FieldWrapper>

                    <LookupSelect label="Teaching Level" value={data.teaching_level_code || ''} onChange={v => onChange({ teaching_level_code: v as string })} dictName="teaching_levels" />
                    <LookupSelect label="REQV Level" value={data.reqv_level_code || ''} onChange={v => onChange({ reqv_level_code: v as string })} dictName="reqv_levels" />

                    <LookupSelect
                        label="Assigned Roles"
                        value={data.assigned_roles || []}
                        onChange={v => onChange({ assigned_roles: v })}
                        dictName="teaching_leadership_staff"
                        multiple
                    />

                    <FieldWrapper label="" state="idle">
                        <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active ?? true}
                                onChange={e => onChange({ is_active: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <span className="text-sm text-[hsl(var(--admin-text-main))]">Active staff member</span>
                        </label>
                    </FieldWrapper>
                </>
            ),
        },

        // ── Step 4: Documents & Review ──
        {
            title: 'Documents & Review',
            helper: 'Upload documents and review before submitting.',
            illustration: <DocumentIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <DocumentUpload
                        label="Staff Documents"
                        value={data.documents || []}
                        onChange={v => onChange({ documents: v })}
                        docTypes={STAFF_DOC_TYPES}
                        maxFiles={20}
                    />

                    {/* Review summary */}
                    <div className="mt-6 space-y-3">
                        <h4 className="text-[14px] font-bold text-[hsl(var(--admin-text-main))]">Review Summary</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                            <ReviewRow label="Name" value={[data.title_code, data.first_name, data.last_name].filter(Boolean).join(' ')} />
                            <ReviewRow label="Email" value={data.email} />
                            <ReviewRow label="Mobile" value={data.mobile?.raw} />
                            <ReviewRow label="DOB" value={data.dob} />
                            <ReviewRow label="Gender" value={data.gender_code} />
                            <ReviewRow label="Citizenship" value={data.citizenship_type} />
                            <ReviewRow label="SA ID" value={data.sa_id_number} />
                            <ReviewRow label="Branch" value={data.branch_id ? 'Selected' : 'Not set'} />
                            <ReviewRow label="Employment Type" value={data.employment_type_code} />
                            <ReviewRow label="Start Date" value={data.joining_date} />
                            <ReviewRow label="Department" value={data.department} />
                            <ReviewRow label="Documents" value={`${(data.documents || []).length} uploaded`} />
                        </div>
                    </div>
                </>
            ),
        },
    ];

    const handleComplete = async (data: Record<string, any>) => {
        const body = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            branch_id: data.branch_id || null,
            title_code: data.title_code || null,
            date_of_birth: data.dob || null,
            gender_code: data.gender_code || null,
            religion_code: data.religion_code || null,
            race_code: data.race_code || null,
            marital_status_code: data.marital_status_code || null,
            citizenship_type_code: data.citizenship_type || null,
            id_number: data.sa_id_number || null,
            passport_number: data.passport_number || null,
            permit_type_code: data.permit_type_code || null,
            permit_number: data.permit_number || null,
            preferred_name: data.preferred_name || null,
            initials: data.initials || (data.first_name && data.last_name ? initialsFromName(data.first_name, data.last_name) : null),
            secondary_email: data.secondary_email || null,
            bio: data.bio || null,
            staff_code: data.staff_code || null,
            department: data.department || null,
            job_title: data.job_title || null,
            is_active: data.is_active ?? true,
            address: data.address ? {
                formatted_address: data.address.formatted_address,
                google_place_id: data.address.google_place_id,
                street: data.address.street,
                suburb: data.address.suburb,
                city: data.address.city,
                province: data.address.province,
                postal_code: data.address.postal_code,
                country: data.address.country,
                lat: data.address.lat,
                lng: data.address.lng,
            } : null,
            joining_date: data.joining_date || null,
            employment_type_code: data.employment_type_code || null,
            assigned_roles: data.assigned_roles || [],
            sace_number: data.sace_number || null,
            teaching_level_code: data.teaching_level_code || null,
            reqv_level_code: data.reqv_level_code || null,
            phone_mobile: data.mobile?.e164 ? {
                raw: data.mobile.raw,
                e164: data.mobile.e164,
                country_iso2: data.mobile.country_iso2,
                dial_code: data.mobile.dial_code,
            } : null,
            phone_work: data.alt_phone?.e164 ? {
                raw: data.alt_phone.raw,
                e164: data.alt_phone.e164,
                country_iso2: data.alt_phone.country_iso2,
                dial_code: data.alt_phone.dial_code,
            } : null,
            phone_home: data.home_phone?.e164 ? {
                raw: data.home_phone.raw,
                e164: data.home_phone.e164,
                country_iso2: data.home_phone.country_iso2,
                dial_code: data.home_phone.dial_code,
            } : null,
            documents: data.documents || [],
        };

        const res = await fetch(`/v1/admin/tenants/${tenantId}/staff`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to create staff member');
        router.push(`/tenant/${tenantSlug}/admin/staff`);
    };

    return (
        <WizardShell
            steps={steps}
            formType="STAFF"
            tenantId={tenantId}
            submitLabel="Create Staff Member"
            onComplete={handleComplete}
            onCancel={() => router.push(`/tenant/${tenantSlug}/admin/staff`)}
        />
    );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
    return (
        <>
            <span className="text-[hsl(var(--admin-text-muted))] font-medium">{label}</span>
            <span className="text-[hsl(var(--admin-text-main))] font-medium">{value || '—'}</span>
        </>
    );
}
