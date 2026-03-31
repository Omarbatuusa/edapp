'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { WizardShell, WizardStep } from '../wizard/WizardShell';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { TextField } from '../inputs/TextField';
import { DateField } from '../inputs/DateField';
import { CheckboxField } from '../inputs/CheckboxField';
import { PhoneInput, PhoneValue } from '../inputs/PhoneInput';
import { AddressInput, AddressValue } from '../inputs/AddressInput';
import { LookupSelect } from '../inputs/LookupSelect';
import { ConditionalFieldGroup } from '../inputs/ConditionalFieldGroup';
import { DocumentUpload, DocFile } from '../inputs/DocumentUpload';
import DateOfBirthInput from '../inputs/DateOfBirthInput';
import { validateName, validatePreferredName, validateSaId, validateSaIdDobMatch, validatePassport, validatePermit, validateBirthCertificate, validateEmail, validateEmailOptional, validateDateNotWeekend, autoCapitalizeName } from '@/lib/validators';
import { RepeaterField } from '../inputs/RepeaterField';
import { EnrollmentIllustration } from '../illustrations/EnrollmentIllustration';
import { AcademicIllustration } from '../illustrations/AcademicIllustration';
import { MedicalIllustration } from '../illustrations/MedicalIllustration';
import { LanguageIllustration } from '../illustrations/LanguageIllustration';
import { DocumentIllustration } from '../illustrations/DocumentIllustration';
import { GuardianSubform, GuardianData, createEmptyGuardian } from './GuardianSubform';

const EMPTY_PHONE: PhoneValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = { formatted_address: '', google_place_id: '', street: '', suburb: '', city: '', province: '', postal_code: '', country: '', lat: null, lng: null };

interface LearnerEnrollmentWizardProps {
    tenantSlug: string;
    tenantId?: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// --- Zod Schemas ---

const step1Schema = z.object({});
const step2Schema = z.object({
    brand_id: z.string().min(1, 'Select a brand'),
    main_branch_id: z.string().min(1, 'Select a main branch'),
    branch_id: z.string().min(1, 'Select a branch'),
});
const step3Schema = z.object({ document_checklist_ack: z.literal(true).refine(v => v === true, 'You must acknowledge the document checklist') });
const step4Schema = z.object({ acceptance_ack: z.literal(true).refine(v => v === true, 'You must accept the enrolment terms') });
const step5Schema = z.object({
    phase_code: z.string().min(1, 'Select a phase'),
    grade_code: z.string().min(1, 'Select a grade'),
});
const step6Schema = z.object({
    learner_first_name: z.string().min(2, 'First name is required'),
    learner_surname: z.string().min(2, 'Surname is required'),
    learner_dob: z.string().min(1, 'Date of birth is required'),
    gender_code: z.string().min(1, 'Gender is required'),
});
const step7Schema = z.object({
    home_language_code: z.string().min(1, 'Home language is required'),
});

// Doc types for learner uploads
const LEARNER_DOC_TYPES = [
    { code: 'birth_certificate', label: 'Birth Certificate' },
    { code: 'sa_id', label: 'SA ID Document' },
    { code: 'passport', label: 'Passport Copy' },
    { code: 'permit', label: 'Permit Document' },
    { code: 'progress_report', label: 'Progress Report' },
    { code: 'transfer_card', label: 'Transfer Card' },
    { code: 'immunisation', label: 'Immunisation Proof' },
    { code: 'sna1', label: 'SNA1 Report' },
    { code: 'sna2', label: 'SNA2 Report' },
    { code: 'isp', label: 'ISP Document' },
    { code: 'sbst_minutes', label: 'SBST Minutes' },
];

// Emergency contact type
interface EmergencyContactData {
    full_name: string;
    relationship_code: string;
    mobile_number: PhoneValue;
    alternate_number: PhoneValue;
    email: string;
    address: AddressValue;
    priority_level: number;
    authorized_to_pick_up: boolean;
    notes_medical_alert: string;
}

function createEmptyContact(): EmergencyContactData {
    return {
        full_name: '', relationship_code: '', mobile_number: EMPTY_PHONE,
        alternate_number: EMPTY_PHONE, email: '', address: EMPTY_ADDRESS,
        priority_level: 1, authorized_to_pick_up: false, notes_medical_alert: '',
    };
}

export function LearnerEnrollmentWizard({ tenantSlug, tenantId }: LearnerEnrollmentWizardProps) {
    const router = useRouter();
    const [brands, setBrands] = useState<Array<{ id: string; brand_name: string }>>([]);
    const [mainBranches, setMainBranches] = useState<Array<{ id: string; branch_name: string }>>([]);
    const [branches, setBranches] = useState<Array<{ id: string; branch_name: string }>>([]);
    const [applicationId, setApplicationId] = useState<string | null>(null);

    // Fetch brands on mount
    useEffect(() => {
        fetch('/v1/admin/brands', { headers: getAuthHeaders() })
            .then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    // Fetch branches when brand changes
    const fetchBranches = useCallback(async (brandId: string, mainBranchId?: string) => {
        try {
            const res = await fetch('/v1/admin/branches', { headers: getAuthHeaders() });
            const data = await res.json();
            const all = Array.isArray(data) ? data : [];
            setMainBranches(all.filter((b: any) => b.brand_id === brandId && b.is_main_branch));
            if (mainBranchId) {
                setBranches(all.filter((b: any) => b.brand_id === brandId && !b.is_main_branch));
            }
        } catch {}
    }, []);

    // Create draft on mount
    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/enrollment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ tenant_id: tenantId }),
        })
            .then(r => r.json())
            .then(d => { if (d.id) setApplicationId(d.id); })
            .catch(() => {});
    }, [tenantId]);

    // Save step data
    const saveStep = useCallback(async (data: Record<string, any>, step: number) => {
        if (!applicationId || !tenantId) return;
        await fetch(`/v1/admin/tenants/${tenantId}/enrollment/${applicationId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...data, current_step: step + 1 }),
        }).catch(() => {});
    }, [applicationId, tenantId]);

    const steps: WizardStep[] = [
        // Step 1: Welcome
        {
            title: 'Welcome',
            helper: 'Welcome to the learner enrollment process. Please have all required documents ready.',
            illustration: <EnrollmentIllustration />,
            schema: step1Schema,
            content: () => (
                <div className="space-y-4">
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-2">Before you begin, please have ready:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Learner's birth certificate or ID document</li>
                            <li>Parent/guardian ID documents</li>
                            <li>Previous school reports (if applicable)</li>
                            <li>Medical records and immunisation card</li>
                            <li>Proof of address</li>
                        </ul>
                    </div>
                    <p className="text-sm text-slate-500">Click "Next" to begin the enrollment process.</p>
                </div>
            ),
        },

        // Step 2: Brand / Main Branch / Branch
        {
            title: 'Select School',
            helper: 'Choose which school and branch you are applying to.',
            illustration: <EnrollmentIllustration />,
            schema: step2Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <FieldWrapper label="Brand" required state={errors.brand_id ? 'error' : data.brand_id ? 'success' : 'idle'} error={errors.brand_id}>
                        <select
                            aria-label="Brand"
                            value={data.brand_id || ''}
                            onChange={e => {
                                onChange({ brand_id: e.target.value, main_branch_id: '', branch_id: '' });
                                if (e.target.value) fetchBranches(e.target.value);
                            }}
                            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                        >
                            <option value="">— Select brand —</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
                        </select>
                    </FieldWrapper>
                    {data.brand_id && (
                        <FieldWrapper label="Main Branch" required state={errors.main_branch_id ? 'error' : data.main_branch_id ? 'success' : 'idle'} error={errors.main_branch_id}>
                            <select
                                aria-label="Main Branch"
                                value={data.main_branch_id || ''}
                                onChange={e => {
                                    onChange({ main_branch_id: e.target.value, branch_id: '' });
                                    if (e.target.value) fetchBranches(data.brand_id, e.target.value);
                                }}
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            >
                                <option value="">— Select main branch —</option>
                                {mainBranches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                            </select>
                        </FieldWrapper>
                    )}
                    {data.main_branch_id && (
                        <FieldWrapper label="Branch" required state={errors.branch_id ? 'error' : data.branch_id ? 'success' : 'idle'} error={errors.branch_id}>
                            <select
                                aria-label="Branch"
                                value={data.branch_id || ''}
                                onChange={e => onChange({ branch_id: e.target.value })}
                                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
                            >
                                <option value="">— Select branch —</option>
                                {branches.length === 0 && (
                                    <option value={data.main_branch_id}>Same as main branch</option>
                                )}
                                {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                            </select>
                        </FieldWrapper>
                    )}
                </>
            ),
        },

        // Step 3: Document Checklist
        {
            title: 'Document Checklist',
            helper: 'Please confirm you have the required documents.',
            illustration: <DocumentIllustration />,
            schema: step3Schema,
            content: ({ data, onChange, errors }) => (
                <div className="space-y-4">
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-semibold mb-2">Required documents:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Learner birth certificate / ID document</li>
                            <li>Parent/Guardian ID documents</li>
                            <li>Latest school report (Grade R and above)</li>
                            <li>Transfer card (if from another school)</li>
                            <li>Immunisation record</li>
                            <li>Medical aid details (if applicable)</li>
                        </ul>
                    </div>
                    <CheckboxField
                        label="I have all the required documents ready"
                        checked={!!data.document_checklist_ack}
                        onChange={v => onChange({ document_checklist_ack: v })}
                        required
                        error={errors.document_checklist_ack}
                    />
                </div>
            ),
        },

        // Step 4: Acceptance Acknowledgement
        {
            title: 'Enrollment Terms',
            helper: 'Please read and accept the enrollment terms.',
            illustration: <EnrollmentIllustration />,
            schema: step4Schema,
            content: ({ data, onChange, errors }) => (
                <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto">
                        <p className="mb-2">By proceeding with this enrollment application, you acknowledge and agree that:</p>
                        <ul className="list-decimal list-inside space-y-1 text-xs">
                            <li>All information provided is true and accurate.</li>
                            <li>Submission does not guarantee acceptance.</li>
                            <li>The school reserves the right to verify all information.</li>
                            <li>You agree to the school's code of conduct and policies.</li>
                            <li>Fees are payable as per the school's fee structure.</li>
                        </ul>
                    </div>
                    <CheckboxField
                        label="I accept the enrollment terms and conditions"
                        checked={!!data.acceptance_ack}
                        onChange={v => onChange({ acceptance_ack: v })}
                        required
                        error={errors.acceptance_ack}
                    />
                </div>
            ),
        },

        // Step 5: Learner Placement
        {
            title: 'Learner Placement',
            helper: 'Select the phase, grade, and class for the learner.',
            illustration: <AcademicIllustration />,
            schema: step5Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <LookupSelect
                        label="Phase" value={data.phase_code || ''} onChange={v => onChange({ phase_code: v as string, grade_code: '', class_id: '' })}
                        dictName="phases" required error={errors.phase_code}
                    />
                    {data.phase_code && (
                        <LookupSelect
                            label="Grade" value={data.grade_code || ''} onChange={v => onChange({ grade_code: v as string, class_id: '' })}
                            dictName="grades" required error={errors.grade_code}
                        />
                    )}
                    {data.grade_code && data.branch_id && (
                        <LookupSelect
                            label="Class (optional)" value={data.class_id || ''} onChange={v => onChange({ class_id: v as string })}
                            endpoint={`/v1/admin/tenants/${tenantId}/grades-classes/classes?branch_id=${data.branch_id}&grade_code=${data.grade_code}`}
                            labelKey="class_name" valueKey="id"
                        />
                    )}
                </>
            ),
        },

        // Step 6: Learner Details
        {
            title: 'Learner Details',
            helper: 'Personal information about the learner.',
            illustration: <EnrollmentIllustration />,
            schema: step6Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField label="First Name" icon="person" value={data.learner_first_name || ''} onChange={v => onChange({ learner_first_name: v })} onBlur={() => { if (data.learner_first_name) onChange({ learner_first_name: autoCapitalizeName(data.learner_first_name) }); }} placeholder="First name" required error={errors.learner_first_name || (data.learner_first_name ? validateName(data.learner_first_name) : undefined) || undefined} />
                        <TextField label="Surname" icon="person" value={data.learner_surname || ''} onChange={v => onChange({ learner_surname: v })} onBlur={() => { if (data.learner_surname) onChange({ learner_surname: autoCapitalizeName(data.learner_surname) }); }} placeholder="Surname" required error={errors.learner_surname || (data.learner_surname ? validateName(data.learner_surname) : undefined) || undefined} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField label="Preferred Name" icon="person" value={data.learner_preferred_name || ''} onChange={v => onChange({ learner_preferred_name: v })} onBlur={() => { if (data.learner_preferred_name) onChange({ learner_preferred_name: autoCapitalizeName(data.learner_preferred_name) }); }} placeholder="Preferred name" error={data.learner_preferred_name ? (validatePreferredName(data.learner_preferred_name) || undefined) : undefined} />
                        <DateOfBirthInput label="Date of Birth" value={data.learner_dob || ''} onChange={v => onChange({ learner_dob: v })} context="learner" required error={errors.learner_dob} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <LookupSelect label="Gender" value={data.gender_code || ''} onChange={v => onChange({ gender_code: v as string })} dictName="genders" required error={errors.gender_code} />
                        <LookupSelect label="Religion" value={data.religion_code || ''} onChange={v => onChange({ religion_code: v as string })} dictName="religions" />
                    </div>

                    <LookupSelect label="Race" value={data.race_code || ''} onChange={v => onChange({ race_code: v as string })} dictName="races" />

                    <LookupSelect label="Citizenship Type" value={data.citizenship_type || ''} onChange={v => onChange({ citizenship_type: v as string })} dictName="citizenship_types" required />

                    <ConditionalFieldGroup watchValue={data.citizenship_type || ''} showWhen={['SA_CITIZEN', 'SA_PERMANENT_RESIDENT']}>
                        <FieldWrapper label="SA ID Number" required icon="badge" state={(() => { const err = data.sa_id_number ? (validateSaId(data.sa_id_number) || validateSaIdDobMatch(data.sa_id_number, data.learner_dob || '')) : null; return err ? 'error' : data.sa_id_number ? 'success' : 'idle'; })()} error={data.sa_id_number ? (validateSaId(data.sa_id_number) || validateSaIdDobMatch(data.sa_id_number, data.learner_dob || '') || undefined) : undefined}>
                            <input type="text" value={data.sa_id_number || ''} onChange={e => onChange({ sa_id_number: e.target.value.replace(/\D/g, '').slice(0, 13) })} placeholder="e.g. 0801015800085" maxLength={13} className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                        </FieldWrapper>
                    </ConditionalFieldGroup>

                    <ConditionalFieldGroup watchValue={data.citizenship_type || ''} showWhen={['FOREIGN_NATIONAL', 'REFUGEE', 'ASYLUM_SEEKER']}>
                        <FieldWrapper label="Passport Number" required icon="flight" state={(() => { const err = data.passport_number ? validatePassport(data.passport_number) : null; return err ? 'error' : data.passport_number ? 'success' : 'idle'; })()} error={data.passport_number ? (validatePassport(data.passport_number) || undefined) : undefined}>
                            <input type="text" value={data.passport_number || ''} onChange={e => onChange({ passport_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9) })} placeholder="Passport number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                        </FieldWrapper>
                        <LookupSelect label="Permit Type" value={data.permit_type_code || ''} onChange={v => onChange({ permit_type_code: v as string })} dictName="permit_types" />
                        <FieldWrapper label="Permit Number" icon="description" state={(() => { const err = data.permit_number ? validatePermit(data.permit_number, data.permit_type_code || '') : null; return err ? 'error' : data.permit_number ? 'success' : 'idle'; })()} error={data.permit_number ? (validatePermit(data.permit_number, data.permit_type_code || '') || undefined) : undefined}>
                            <input type="text" value={data.permit_number || ''} onChange={e => onChange({ permit_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 13) })} placeholder="Permit number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                        </FieldWrapper>
                    </ConditionalFieldGroup>

                    <AddressInput label="Learner's Residential Address" value={data.learner_address || EMPTY_ADDRESS} onChange={v => onChange({ learner_address: v })} required />
                </>
            ),
        },

        // Step 6B: Academic Details
        {
            title: 'Academic History',
            helper: 'Previous school and academic details.',
            illustration: <AcademicIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <DateField label="Starting Date" value={data.starting_date || ''} onChange={v => onChange({ starting_date: v })} error={data.starting_date ? (validateDateNotWeekend(data.starting_date) || undefined) : undefined} />

                    <CheckboxField
                        label="Learner attended a previous school"
                        checked={!!data.has_previous_school}
                        onChange={v => onChange({ has_previous_school: v })}
                    />

                    {data.has_previous_school && (
                        <>
                            <TextField label="Previous School Name" value={data.previous_school_name || ''} onChange={v => onChange({ previous_school_name: v })} placeholder="School name" />
                            <TextField label="Last Grade Passed" value={data.last_grade_passed || ''} onChange={v => onChange({ last_grade_passed: v })} placeholder="e.g. Grade 5" />
                        </>
                    )}

                    <CheckboxField
                        label="Learner has repeated a grade"
                        checked={!!data.has_repeated_grades}
                        onChange={v => onChange({ has_repeated_grades: v })}
                    />

                    {data.has_repeated_grades && (
                        <FieldWrapper label="Which grade(s) were repeated?" state={data.repeated_grades ? 'success' : 'idle'}>
                            <input type="text" value={data.repeated_grades || ''} onChange={e => onChange({ repeated_grades: e.target.value })} placeholder="e.g. Grade 3" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    )}
                </>
            ),
        },

        // Step 7: Languages
        {
            title: 'Languages',
            helper: 'Language preferences for the learner.',
            illustration: <LanguageIllustration />,
            schema: step7Schema,
            content: ({ data, onChange, errors }) => (
                <>
                    <LookupSelect label="Home Language" value={data.home_language_code || ''} onChange={v => onChange({ home_language_code: v as string })} dictName="home_languages" required error={errors.home_language_code} />
                    <LookupSelect label="First Additional Language (FAL)" value={data.fal_code || ''} onChange={v => onChange({ fal_code: v as string })} dictName="languages_fal" />
                    <LookupSelect label="Home Language (HL)" value={data.hl_code || ''} onChange={v => onChange({ hl_code: v as string })} dictName="languages_hl" />
                </>
            ),
        },

        // Step 7B: Subjects & Streams
        {
            title: 'Subjects & Support',
            helper: 'Subject choices, streams, and support needs.',
            illustration: <AcademicIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <LookupSelect label="Stream (if applicable)" value={data.stream_code || ''} onChange={v => onChange({ stream_code: v as string })} endpoint="/v1/admin/school-data/streams" labelKey="stream_name" valueKey="stream_code" />
                    <LookupSelect label="Educational Disabilities" value={data.educational_disabilities || []} onChange={v => onChange({ educational_disabilities: v })} dictName="educational_disabilities" multiple />
                    <LookupSelect label="Support Profile" value={data.support_profile_code || ''} onChange={v => onChange({ support_profile_code: v as string })} dictName="support_profiles" />

                    <FieldWrapper label="" state="idle">
                        <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                            <input type="checkbox" checked={data.extra_tutoring_needed || false} onChange={e => onChange({ extra_tutoring_needed: e.target.checked })} className="rounded border-slate-300" />
                            <span className="text-sm text-slate-700 dark:text-slate-200">Learner needs extra tutoring support</span>
                        </label>
                    </FieldWrapper>

                    {data.extra_tutoring_needed && (
                        <FieldWrapper label="Subjects needing support" state={data.subjects_needing_support ? 'success' : 'idle'}>
                            <input type="text" value={data.subjects_needing_support || ''} onChange={e => onChange({ subjects_needing_support: e.target.value })} placeholder="e.g. Mathematics, English" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    )}

                    <FieldWrapper label="" state="idle">
                        <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                            <input type="checkbox" checked={data.aftercare_required || false} onChange={e => onChange({ aftercare_required: e.target.checked })} className="rounded border-slate-300" />
                            <span className="text-sm text-slate-700 dark:text-slate-200">Aftercare required</span>
                        </label>
                    </FieldWrapper>

                    {data.aftercare_required && (
                        <LookupSelect label="Aftercare Months" value={data.aftercare_months || []} onChange={v => onChange({ aftercare_months: v })} dictName="months" multiple />
                    )}

                    <LookupSelect label="Extracurricular Activities" value={data.extracurricular_activities || []} onChange={v => onChange({ extracurricular_activities: v })} dictName="extracurricular_activities" multiple />
                </>
            ),
        },

        // Step 8: Medical
        {
            title: 'Medical Details',
            helper: 'Medical information and health records.',
            illustration: <MedicalIllustration />,
            content: ({ data, onChange }) => (
                <>
                    <LookupSelect label="Blood Type" value={data.blood_type || ''} onChange={v => onChange({ blood_type: v as string })} dictName="blood_types" />
                    <LookupSelect label="Medical Disabilities" value={data.medical_disabilities || []} onChange={v => onChange({ medical_disabilities: v })} dictName="medical_disabilities" multiple />
                    <LookupSelect label="Medical Aid Provider" value={data.medical_aid_provider_code || ''} onChange={v => onChange({ medical_aid_provider_code: v as string })} dictName="medical_aid_providers" />

                    {data.medical_aid_provider_code && (
                        <div className="grid grid-cols-2 gap-4">
                            <FieldWrapper label="Main Member Number" state={data.medical_aid_number ? 'success' : 'idle'}>
                                <input type="text" value={data.medical_aid_number || ''} onChange={e => onChange({ medical_aid_number: e.target.value })} placeholder="Member number" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                            </FieldWrapper>
                            <FieldWrapper label="Main Member Name" state={data.medical_aid_member_name ? 'success' : 'idle'}>
                                <input type="text" value={data.medical_aid_member_name || ''} onChange={e => onChange({ medical_aid_member_name: e.target.value })} placeholder="Member name" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                            </FieldWrapper>
                        </div>
                    )}

                    <LookupSelect label="Allergies" value={data.allergies || []} onChange={v => onChange({ allergies: v })} dictName="school_allergies" multiple />
                    <LookupSelect label="Psychological Challenges" value={data.psych_challenges || []} onChange={v => onChange({ psych_challenges: v })} dictName="psychological_issues" multiple />

                    <FieldWrapper label="" state="idle">
                        <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                            <input type="checkbox" checked={data.has_medical_conditions || false} onChange={e => onChange({ has_medical_conditions: e.target.checked })} className="rounded border-slate-300" />
                            <span className="text-sm text-slate-700 dark:text-slate-200">Has specific medical conditions</span>
                        </label>
                    </FieldWrapper>
                    {data.has_medical_conditions && (
                        <FieldWrapper label="Medical Condition Details" required state={data.medical_conditions_details ? 'success' : 'idle'}>
                            <textarea value={data.medical_conditions_details || ''} onChange={e => onChange({ medical_conditions_details: e.target.value })} rows={3} placeholder="Describe medical conditions..." className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none" />
                        </FieldWrapper>
                    )}

                    <FieldWrapper label="" state="idle">
                        <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                            <input type="checkbox" checked={data.vaccinated ?? true} onChange={e => onChange({ vaccinated: e.target.checked })} className="rounded border-slate-300" />
                            <span className="text-sm text-slate-700 dark:text-slate-200">Learner is vaccinated</span>
                        </label>
                    </FieldWrapper>
                    {data.vaccinated === false && (
                        <FieldWrapper label="Reason not vaccinated" state={data.not_vaccinated_reason ? 'success' : 'idle'}>
                            <input type="text" value={data.not_vaccinated_reason || ''} onChange={e => onChange({ not_vaccinated_reason: e.target.value })} placeholder="Reason" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    )}
                </>
            ),
        },

        // Step 9: Emergency Contacts
        {
            title: 'Emergency Contacts',
            helper: 'At least one emergency contact is required.',
            illustration: <EnrollmentIllustration />,
            content: ({ data, onChange }) => (
                <RepeaterField<EmergencyContactData>
                    label="Emergency Contacts"
                    items={data.emergency_contacts || []}
                    onChange={items => onChange({ emergency_contacts: items })}
                    maxItems={5}
                    minItems={1}
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
                            <FieldWrapper label="Priority Level" state="idle">
                                <select aria-label="Priority Level" value={contact.priority_level} onChange={e => update({ priority_level: Number(e.target.value) })} className="w-full px-3 py-3 text-sm bg-transparent outline-none">
                                    <option value={1}>1 - Primary</option>
                                    <option value={2}>2 - Secondary</option>
                                    <option value={3}>3 - Tertiary</option>
                                </select>
                            </FieldWrapper>
                            <FieldWrapper label="" state="idle">
                                <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                                    <input type="checkbox" checked={contact.authorized_to_pick_up} onChange={e => update({ authorized_to_pick_up: e.target.checked })} className="rounded border-slate-300" />
                                    <span className="text-sm text-slate-700 dark:text-slate-200">Authorized to pick up learner</span>
                                </label>
                            </FieldWrapper>
                            <FieldWrapper label="Medical Alert Notes" state={contact.notes_medical_alert ? 'success' : 'idle'}>
                                <textarea value={contact.notes_medical_alert} onChange={e => update({ notes_medical_alert: e.target.value })} rows={2} placeholder="Any medical alerts..." className="w-full px-3 py-3 text-sm bg-transparent outline-none resize-none" />
                            </FieldWrapper>
                        </>
                    )}
                />
            ),
        },

        // Step 10: Guardians
        {
            title: 'Parent / Guardian',
            helper: 'Add up to 3 parents or guardians. At least one must be designated as fee payer.',
            illustration: <EnrollmentIllustration />,
            content: ({ data, onChange }) => (
                <RepeaterField<GuardianData>
                    label="Parents / Guardians"
                    items={data.guardians || []}
                    onChange={items => onChange({ guardians: items })}
                    maxItems={3}
                    minItems={1}
                    createEmpty={createEmptyGuardian}
                    addLabel="Add Guardian"
                    renderItem={(guardian, idx, update) => (
                        <GuardianSubform data={guardian} onChange={update} index={idx} />
                    )}
                />
            ),
        },

        // Step 11: Document Uploads
        {
            title: 'Document Uploads',
            helper: 'Upload all supporting documents.',
            illustration: <DocumentIllustration />,
            content: ({ data, onChange }) => (
                <DocumentUpload
                    label="Supporting Documents"
                    value={data.uploaded_documents || []}
                    onChange={v => onChange({ uploaded_documents: v })}
                    docTypes={LEARNER_DOC_TYPES}
                    maxFiles={20}
                />
            ),
        },

        // Step 12: Review & Submit
        {
            title: 'Review & Submit',
            helper: 'Review all details before submitting your application.',
            illustration: <EnrollmentIllustration />,
            content: ({ data }) => {
                const guardians = data.guardians || [];
                const contacts = data.emergency_contacts || [];
                return (
                    <div className="flex flex-col gap-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learner</p>
                        {[
                            { label: 'Name', value: `${data.learner_first_name || ''} ${data.learner_surname || ''}`.trim() },
                            { label: 'DOB', value: data.learner_dob },
                            { label: 'Phase / Grade', value: `${data.phase_code || ''} / ${data.grade_code || ''}` },
                            { label: 'Home Language', value: data.home_language_code },
                            { label: 'Citizenship', value: data.citizenship_type },
                        ].filter(i => i.value).map(item => (
                            <div key={item.label} className="flex items-start gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="text-xs font-medium text-slate-400 w-28 flex-shrink-0">{item.label}</span>
                                <span className="text-sm text-slate-700 dark:text-slate-200">{item.value}</span>
                            </div>
                        ))}

                        {guardians.length > 0 && (
                            <>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3">Guardians ({guardians.length})</p>
                                {guardians.map((g: GuardianData, i: number) => (
                                    <div key={i} className="flex items-start gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-medium text-slate-400 w-28 flex-shrink-0">#{i + 1}</span>
                                        <span className="text-sm text-slate-700 dark:text-slate-200">
                                            {g.first_name} {g.surname} — {g.email || 'No email'}
                                            {g.is_fee_payer && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Fee Payer</span>}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}

                        {contacts.length > 0 && (
                            <>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3">Emergency Contacts ({contacts.length})</p>
                                {contacts.map((c: EmergencyContactData, i: number) => (
                                    <div key={i} className="flex items-start gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-medium text-slate-400 w-28 flex-shrink-0">#{i + 1}</span>
                                        <span className="text-sm text-slate-700 dark:text-slate-200">{c.full_name} — {c.mobile_number?.e164 || 'No phone'}</span>
                                    </div>
                                ))}
                            </>
                        )}

                        <div className="flex items-start gap-3 py-1.5 mt-3">
                            <span className="text-xs font-medium text-slate-400 w-28 flex-shrink-0">Documents</span>
                            <span className="text-sm text-slate-700 dark:text-slate-200">{(data.uploaded_documents || []).length} file(s) uploaded</span>
                        </div>

                        <FieldWrapper label="Submitter Email" required state={data.submitted_by_email ? 'success' : 'idle'} helper="We'll send confirmation to this address">
                            <input type="email" value={data.submitted_by_email || ''} onChange={() => {}} placeholder="your@email.com" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                        </FieldWrapper>
                    </div>
                );
            },
        },
    ];

    const handleComplete = async (data: Record<string, any>) => {
        if (!applicationId || !tenantId) throw new Error('No application ID');

        // Save final step data
        await saveStep(data, steps.length - 1);

        // Map data to enrollment application fields
        const updateBody = {
            placement_data: {
                phase_code: data.phase_code, grade_code: data.grade_code, class_id: data.class_id,
            },
            learner_data: {
                first_name: data.learner_first_name,
                last_name: data.learner_surname,
                preferred_name: data.learner_preferred_name,
                date_of_birth: data.learner_dob,
                gender_code: data.gender_code, religion_code: data.religion_code,
                race_code: data.race_code,
                citizenship_type_code: data.citizenship_type,
                id_number: data.sa_id_number, passport_number: data.passport_number,
                permit_type_code: data.permit_type_code, permit_number: data.permit_number,
                address: data.learner_address,
            },
            academic_data: {
                starting_date: data.starting_date, has_previous_school: data.has_previous_school,
                previous_school_name: data.previous_school_name, last_grade_passed: data.last_grade_passed,
                repeated_grades: data.repeated_grades,
            },
            subjects_data: {
                home_language_code: data.home_language_code, fal_code: data.fal_code, hl_code: data.hl_code,
                stream_code: data.stream_code, educational_disabilities: data.educational_disabilities,
                support_profile_code: data.support_profile_code,
            },
            aftercare_data: {
                aftercare_required: data.aftercare_required, aftercare_months: data.aftercare_months,
                extracurricular_activities: data.extracurricular_activities,
            },
            medical_data: {
                blood_type: data.blood_type, medical_disabilities: data.medical_disabilities,
                medical_aid_provider_code: data.medical_aid_provider_code,
                medical_aid_number: data.medical_aid_number,
                allergies: data.allergies, psych_challenges: data.psych_challenges,
                has_medical_conditions: data.has_medical_conditions,
                medical_conditions_details: data.medical_conditions_details,
                vaccinated: data.vaccinated, not_vaccinated_reason: data.not_vaccinated_reason,
            },
            guardians_data: (data.guardians || []).map((g: any) => ({
                ...g,
                last_name: g.last_name || g.surname,
                phone_mobile: g.mobile_whatsapp?.e164 || g.phone_mobile || '',
                phone_work: g.work_phone?.e164 || g.phone_work || '',
                phone_home: g.home_phone?.e164 || g.phone_home || '',
            })),
            emergency_contacts: (data.emergency_contacts || []).map((ec: any) => ({
                ...ec,
                contact_name: ec.contact_name || ec.full_name,
                mobile_number: ec.mobile_number?.e164 || ec.mobile_number || '',
            })),
            uploaded_documents: data.uploaded_documents || [],
            document_checklist_ack: data.document_checklist_ack,
            acceptance_ack: data.acceptance_ack,
            branch_id: data.branch_id,
        };

        // Update application with all data
        await fetch(`/v1/admin/tenants/${tenantId}/enrollment/${applicationId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateBody),
        });

        // Submit
        const submitRes = await fetch(`/v1/admin/tenants/${tenantId}/enrollment/${applicationId}/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                submitted_by_email: data.submitted_by_email || data.guardians?.[0]?.email || '',
            }),
        });

        if (!submitRes.ok) {
            const err = await submitRes.json();
            throw new Error(err.message || 'Failed to submit application');
        }

        // Redirect to success page or apply listing
        router.push(`/tenant/${tenantSlug}/apply/success`);
    };

    return (
        <WizardShell
            steps={steps}
            formType="LEARNER_ENROLLMENT"
            tenantId={tenantId}
            submitLabel="Submit Application"
            onComplete={handleComplete}
        />
    );
}
