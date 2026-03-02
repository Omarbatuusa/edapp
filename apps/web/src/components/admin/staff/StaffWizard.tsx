'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { PhoneInput, PhoneValue } from '../inputs/PhoneInput';
import { AddressInput, AddressValue } from '../inputs/AddressInput';
import { LookupSelect } from '../inputs/LookupSelect';
import { ConditionalFieldGroup } from '../inputs/ConditionalFieldGroup';
import { DocumentUpload, DocFile } from '../inputs/DocumentUpload';
import { RepeaterField } from '../inputs/RepeaterField';
import { StaffIllustration } from '../illustrations/StaffIllustration';
import { MedicalIllustration } from '../illustrations/MedicalIllustration';
import { DocumentIllustration } from '../illustrations/DocumentIllustration';
import { EnrollmentIllustration } from '../illustrations/EnrollmentIllustration';

const EMPTY_PHONE: PhoneValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = { formatted_address: '', google_place_id: '', street: '', suburb: '', city: '', province: '', postal_code: '', country: '', lat: null, lng: null };

interface StaffWizardProps {
    tenantSlug: string;
    tenantId?: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// --- Zod Schemas ---

const step1Schema = z.object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Valid email is required'),
});

// --- Doc Types ---

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

// --- Emergency Contact Type ---

interface EmergencyContactData {
    full_name: string;
    relationship_code: string;
    mobile_number: PhoneValue;
    alternate_number: PhoneValue;
    email: string;
    authorized_to_pick_up: boolean;
    notes_medical_alert: string;
}

function createEmptyContact(): EmergencyContactData {
    return {
        full_name: '',
        relationship_code: '',
        mobile_number: EMPTY_PHONE,
        alternate_number: EMPTY_PHONE,
        email: '',
        authorized_to_pick_up: false,
        notes_medical_alert: '',
    };
}

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
        // Step 1: Profile
        {
            title: 'Profile',
            helper: 'Basic personal information for the staff member.',
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

                    <FieldWrapper label="First Name" required state={errors.first_name ? 'error' : data.first_name ? 'success' : 'idle'} error={errors.first_name}>
                        <input type="text" value={data.first_name || ''} onChange={e => onChange({ first_name: e.target.value })} placeholder="First name" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>

                    <FieldWrapper label="Last Name" required state={errors.last_name ? 'error' : data.last_name ? 'success' : 'idle'} error={errors.last_name}>
                        <input type="text" value={data.last_name || ''} onChange={e => onChange({ last_name: e.target.value })} placeholder="Last name" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>

                    <FieldWrapper label="Email" required state={errors.email ? 'error' : data.email ? 'success' : 'idle'} error={errors.email}>
                        <input type="email" value={data.email || ''} onChange={e => onChange({ email: e.target.value })} placeholder="email@example.com" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>

                    <PhoneInput label="Mobile" value={data.mobile || EMPTY_PHONE} onChange={v => onChange({ mobile: v })} placeholder="e.g. 060 000 0000" />
                    <PhoneInput label="Alternate Phone" value={data.alt_phone || EMPTY_PHONE} onChange={v => onChange({ alt_phone: v })} placeholder="e.g. 011 000 0000" />

                    <FieldWrapper label="Date of Birth" state={data.dob ? 'success' : 'idle'}>
                        <input type="date" value={data.dob || ''} onChange={e => onChange({ dob: e.target.value })} className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>

                    <LookupSelect label="Gender" value={data.gender_code || ''} onChange={v => onChange({ gender_code: v as string })} dictName="genders" />
                    <LookupSelect label="Religion" value={data.religion_code || ''} onChange={v => onChange({ religion_code: v as string })} dictName="religions" />
                    <LookupSelect label="Race" value={data.race_code || ''} onChange={v => onChange({ race_code: v as string })} dictName="races" />

                    <LookupSelect
                        label="Citizenship Type"
                        value={data.citizenship_type || ''}
                        onChange={v => onChange({ citizenship_type: v as string })}
                        dictName="citizenship_types"
                    />

                    <ConditionalFieldGroup watchValue={data.citizenship_type || ''} showWhen={['sa_citizen', 'SA_CITIZEN', 'permanent_resident', 'PERMANENT_RESIDENT']}>
                        <FieldWrapper label="SA ID Number" state={data.sa_id_number ? 'success' : 'idle'}>
                            <input type="text" value={data.sa_id_number || ''} onChange={e => onChange({ sa_id_number: e.target.value })} placeholder="13-digit SA ID number" maxLength={13} className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    </ConditionalFieldGroup>

                    <ConditionalFieldGroup watchValue={data.citizenship_type || ''} showWhen={['foreign_national', 'FOREIGN_NATIONAL', 'refugee', 'REFUGEE', 'asylum_seeker', 'ASYLUM_SEEKER']}>
                        <FieldWrapper label="Passport Number" state={data.passport_number ? 'success' : 'idle'}>
                            <input type="text" value={data.passport_number || ''} onChange={e => onChange({ passport_number: e.target.value })} placeholder="Passport number" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    </ConditionalFieldGroup>

                    <AddressInput
                        label="Residential Address"
                        value={data.address || EMPTY_ADDRESS}
                        onChange={addr => onChange({ address: addr })}
                    />
                </>
            ),
        },

        // Step 2: Employment
        {
            title: 'Employment',
            helper: 'Employment details and role assignments.',
            illustration: <StaffIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <FieldWrapper label="Assigned Branch" state={data.branch_id ? 'success' : 'idle'}>
                        <select
                            value={data.branch_id || ''}
                            onChange={e => onChange({ branch_id: e.target.value })}
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                        >
                            <option value="">-- Select branch --</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.branch_name}</option>
                            ))}
                        </select>
                    </FieldWrapper>

                    <FieldWrapper label="Joining Date" state={data.joining_date ? 'success' : 'idle'}>
                        <input type="date" value={data.joining_date || ''} onChange={e => onChange({ joining_date: e.target.value })} className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>

                    <LookupSelect label="Employment Type" value={data.employment_type_code || ''} onChange={v => onChange({ employment_type_code: v as string })} dictName="employment_types" />

                    <FieldWrapper label="SACE Number" state={data.sace_number ? 'success' : 'idle'} helper="South African Council for Educators registration number">
                        <input type="text" value={data.sace_number || ''} onChange={e => onChange({ sace_number: e.target.value })} placeholder="e.g. 123456" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
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
                </>
            ),
        },

        // Step 3: Medical
        {
            title: 'Medical',
            helper: 'Medical information and special requirements.',
            illustration: <MedicalIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <LookupSelect
                        label="Medical Disabilities"
                        value={data.medical_disabilities || []}
                        onChange={v => onChange({ medical_disabilities: v })}
                        dictName="medical_disabilities"
                        multiple
                    />

                    <LookupSelect
                        label="Medical Aid Provider"
                        value={data.medical_aid_provider_code || ''}
                        onChange={v => onChange({ medical_aid_provider_code: v as string })}
                        dictName="medical_aid_providers"
                    />

                    <LookupSelect
                        label="Allergies"
                        value={data.allergies || []}
                        onChange={v => onChange({ allergies: v })}
                        dictName="school_allergies"
                        multiple
                    />

                    <FieldWrapper label="" state="idle">
                        <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.has_medical_conditions ?? false}
                                onChange={e => onChange({ has_medical_conditions: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-200">Has medical conditions</span>
                        </label>
                    </FieldWrapper>

                    {data.has_medical_conditions && (
                        <FieldWrapper label="Medical Conditions Details" state={data.medical_conditions_details ? 'success' : 'idle'}>
                            <textarea
                                value={data.medical_conditions_details || ''}
                                onChange={e => onChange({ medical_conditions_details: e.target.value })}
                                rows={3}
                                placeholder="Describe medical conditions..."
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none"
                            />
                        </FieldWrapper>
                    )}
                </>
            ),
        },

        // Step 4: Emergency Contacts
        {
            title: 'Emergency Contacts',
            helper: 'Add emergency contact persons for this staff member.',
            illustration: <EnrollmentIllustration />,
            content: ({ data, onChange }) => (
                <RepeaterField<EmergencyContactData>
                    label="Emergency Contacts"
                    items={data.emergency_contacts || []}
                    onChange={items => onChange({ emergency_contacts: items })}
                    maxItems={5}
                    minItems={0}
                    createEmpty={createEmptyContact}
                    addLabel="Add Contact"
                    renderItem={(contact, idx, update) => (
                        <>
                            <FieldWrapper label="Full Name" required state={contact.full_name ? 'success' : 'idle'}>
                                <input type="text" value={contact.full_name} onChange={e => update({ full_name: e.target.value })} placeholder="Full name" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                            </FieldWrapper>
                            <LookupSelect label="Relationship" value={contact.relationship_code} onChange={v => update({ relationship_code: v as string })} dictName="emergency_relationships" required />
                            <PhoneInput label="Mobile" value={contact.mobile_number} onChange={v => update({ mobile_number: v })} required />
                            <PhoneInput label="Alternate Number" value={contact.alternate_number} onChange={v => update({ alternate_number: v })} />
                            <FieldWrapper label="Email" state={contact.email ? 'success' : 'idle'}>
                                <input type="email" value={contact.email} onChange={e => update({ email: e.target.value })} placeholder="email@example.com" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                            </FieldWrapper>
                            <FieldWrapper label="" state="idle">
                                <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={contact.authorized_to_pick_up}
                                        onChange={e => update({ authorized_to_pick_up: e.target.checked })}
                                        className="rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-200">Authorized to pick up</span>
                                </label>
                            </FieldWrapper>
                            <FieldWrapper label="Notes / Medical Alert" state={contact.notes_medical_alert ? 'success' : 'idle'}>
                                <textarea
                                    value={contact.notes_medical_alert}
                                    onChange={e => update({ notes_medical_alert: e.target.value })}
                                    rows={2}
                                    placeholder="Any notes or medical alerts..."
                                    className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none"
                                />
                            </FieldWrapper>
                        </>
                    )}
                />
            ),
        },

        // Step 5: Documents
        {
            title: 'Documents',
            helper: 'Upload supporting documents for the staff member.',
            illustration: <DocumentIllustration />,
            content: ({ data, onChange }) => (
                <DocumentUpload
                    label="Staff Documents"
                    value={data.documents || []}
                    onChange={v => onChange({ documents: v })}
                    docTypes={STAFF_DOC_TYPES}
                    maxFiles={20}
                />
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
            citizenship_type_code: data.citizenship_type || null,
            id_number: data.sa_id_number || null,
            passport_number: data.passport_number || null,
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
            phone_mobile: data.mobile ? {
                raw: data.mobile.raw,
                e164: data.mobile.e164,
                country_iso2: data.mobile.country_iso2,
                dial_code: data.mobile.dial_code,
            } : null,
            phone_work: data.alt_phone ? {
                raw: data.alt_phone.raw,
                e164: data.alt_phone.e164,
                country_iso2: data.alt_phone.country_iso2,
                dial_code: data.alt_phone.dial_code,
            } : null,
            medical_disabilities: data.medical_disabilities || [],
            medical_aid_provider_code: data.medical_aid_provider_code || null,
            allergies: data.allergies || [],
            has_medical_conditions: data.has_medical_conditions || false,
            medical_conditions_details: data.medical_conditions_details || null,
            emergency_contacts: (data.emergency_contacts || []).map((c: EmergencyContactData) => ({
                full_name: c.full_name,
                relationship_code: c.relationship_code,
                mobile_number: c.mobile_number?.e164 || c.mobile_number?.raw || null,
                alternate_number: c.alternate_number?.e164 || c.alternate_number?.raw || null,
                email: c.email || null,
                authorized_to_pick_up: c.authorized_to_pick_up,
                notes_medical_alert: c.notes_medical_alert || null,
            })),
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
