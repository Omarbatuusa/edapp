'use client';

import { FieldWrapper } from '../inputs/FieldWrapper';
import { PhoneField, PhoneFieldValue } from '../inputs/PhoneField';
import { AddressInput, AddressValue } from '../inputs/AddressInput';
import { LookupSelect } from '../inputs/LookupSelect';
import { ConditionalFieldGroup } from '../inputs/ConditionalFieldGroup';
import { DocumentUpload, DocFile } from '../inputs/DocumentUpload';
import { DateField } from '../inputs/DateField';
import { validateName, validateEmail, validateEmailOptional, validateSaId, validateSaIdDobMatch, validatePassport, validatePermit, autoCapitalizeName } from '@/lib/validators';

const EMPTY_PHONE: PhoneFieldValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = { formatted_address: '', google_place_id: '', street: '', suburb: '', city: '', province: '', postal_code: '', country: '', lat: null, lng: null };

export interface GuardianData {
    title_code: string;
    first_name: string;
    surname: string;
    preferred_name: string;
    initials: string;
    mobile_whatsapp: PhoneFieldValue;
    alt_contact_number: PhoneFieldValue;
    home_phone: PhoneFieldValue;
    work_phone: PhoneFieldValue;
    email: string;
    secondary_email: string;
    dob: string;
    gender_code: string;
    religion_code: string;
    religion_other: string;
    citizenship_type: string;
    sa_id_number: string;
    passport_number: string;
    permit_type_code: string;
    permit_number: string;
    permit_expiry_date: string;
    relationship_code: string;
    relationship_other: string;
    race_code: string;
    race_other: string;
    marital_status_code: string;
    marital_status_other: string;
    address: AddressValue;
    parent_type_code: string;
    company_name: string;
    is_fee_payer: boolean;
    payment_option_code: string;
    occupation: string;
    employer: string;
    credit_check_consent: boolean;
    has_custody_order: boolean;
    documents: DocFile[];
    financial_documents: DocFile[];
}

export function createEmptyGuardian(): GuardianData {
    return {
        title_code: '', first_name: '', surname: '', preferred_name: '', initials: '',
        mobile_whatsapp: EMPTY_PHONE, alt_contact_number: EMPTY_PHONE, home_phone: EMPTY_PHONE, work_phone: EMPTY_PHONE,
        email: '', secondary_email: '', dob: '', gender_code: '', religion_code: '', religion_other: '',
        citizenship_type: '', sa_id_number: '', passport_number: '', permit_type_code: '', permit_number: '', permit_expiry_date: '',
        relationship_code: '', relationship_other: '', race_code: '', race_other: '',
        marital_status_code: '', marital_status_other: '', address: EMPTY_ADDRESS,
        parent_type_code: '', company_name: '', is_fee_payer: false, payment_option_code: '',
        occupation: '', employer: '', credit_check_consent: false, has_custody_order: false,
        documents: [], financial_documents: [],
    };
}

interface GuardianSubformProps {
    data: GuardianData;
    onChange: (patch: Partial<GuardianData>) => void;
    index: number;
}

const GUARDIAN_DOC_TYPES = [
    { code: 'sa_id', label: 'SA ID Document' },
    { code: 'passport', label: 'Passport Copy' },
    { code: 'permit', label: 'Permit Document' },
    { code: 'custody_order', label: 'Custody Order' },
];

const FINANCIAL_DOC_TYPES = [
    { code: 'payslip', label: 'Payslip' },
    { code: 'bank_statement', label: 'Bank Statement' },
    { code: 'employment_letter', label: 'Employment Letter' },
];

export function GuardianSubform({ data, onChange, index }: GuardianSubformProps) {
    return (
        <div className="flex flex-col gap-5">
            {/* Section: Personal */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personal Details</p>

            <div className="grid grid-cols-2 gap-4">
                <LookupSelect label="Title" value={data.title_code} onChange={v => onChange({ title_code: v as string })} dictName="salutations" required />
                <LookupSelect label="Gender" value={data.gender_code} onChange={v => onChange({ gender_code: v as string })} dictName="genders" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="First Name" required icon="person" state={data.first_name ? (validateName(data.first_name) ? 'error' : 'success') : 'idle'} error={data.first_name ? (validateName(data.first_name) || undefined) : undefined}>
                    <input type="text" value={data.first_name} onChange={e => onChange({ first_name: e.target.value })} onBlur={() => { if (data.first_name) onChange({ first_name: autoCapitalizeName(data.first_name) }); }} placeholder="First name" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                </FieldWrapper>
                <FieldWrapper label="Surname" required icon="person" state={data.surname ? (validateName(data.surname) ? 'error' : 'success') : 'idle'} error={data.surname ? (validateName(data.surname) || undefined) : undefined}>
                    <input type="text" value={data.surname} onChange={e => onChange({ surname: e.target.value })} onBlur={() => { if (data.surname) onChange({ surname: autoCapitalizeName(data.surname) }); }} placeholder="Surname" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                </FieldWrapper>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Preferred Name" icon="person" state={data.preferred_name ? 'success' : 'idle'}>
                    <input type="text" value={data.preferred_name} onChange={e => onChange({ preferred_name: e.target.value })} onBlur={() => { if (data.preferred_name) onChange({ preferred_name: autoCapitalizeName(data.preferred_name) }); }} placeholder="Preferred name" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
                </FieldWrapper>
                <DateField label="Date of Birth" value={data.dob} onChange={v => onChange({ dob: v })} required icon="cake" />
            </div>

            <LookupSelect label="Relationship to Learner" value={data.relationship_code} onChange={v => onChange({ relationship_code: v as string })} dictName="emergency_relationships" required />
            <ConditionalFieldGroup watchValue={data.relationship_code} showWhen="OTHER">
                <FieldWrapper label="Specify Relationship" required state={data.relationship_other ? 'success' : 'idle'}>
                    <input type="text" value={data.relationship_other} onChange={e => onChange({ relationship_other: e.target.value })} placeholder="Specify relationship" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                </FieldWrapper>
            </ConditionalFieldGroup>

            <div className="grid grid-cols-2 gap-4">
                <LookupSelect label="Religion" value={data.religion_code} onChange={v => onChange({ religion_code: v as string })} dictName="religions" />
                <LookupSelect label="Race" value={data.race_code} onChange={v => onChange({ race_code: v as string })} dictName="races" />
            </div>

            <LookupSelect label="Marital Status" value={data.marital_status_code} onChange={v => onChange({ marital_status_code: v as string })} dictName="marital_statuses" />

            {/* Section: Contact */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Contact Details</p>

            <PhoneField label="Mobile / WhatsApp" value={data.mobile_whatsapp} onChange={v => onChange({ mobile_whatsapp: v })} required />
            <PhoneField label="Alternate Number" value={data.alt_contact_number} onChange={v => onChange({ alt_contact_number: v })} />
            <PhoneField label="Home Phone" value={data.home_phone} onChange={v => onChange({ home_phone: v })} />
            <PhoneField label="Work Phone" value={data.work_phone} onChange={v => onChange({ work_phone: v })} />

            <FieldWrapper label="Email" required icon="email" state={data.email ? (validateEmail(data.email) ? 'error' : 'success') : 'idle'} error={data.email ? (validateEmail(data.email) || undefined) : undefined}>
                <input type="email" value={data.email} onChange={e => onChange({ email: e.target.value })} placeholder="email@example.com" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
            </FieldWrapper>
            <FieldWrapper label="Secondary Email" icon="email" state={data.secondary_email ? (validateEmailOptional(data.secondary_email) ? 'error' : 'success') : 'idle'} error={data.secondary_email ? (validateEmailOptional(data.secondary_email) || undefined) : undefined}>
                <input type="email" value={data.secondary_email} onChange={e => onChange({ secondary_email: e.target.value })} placeholder="secondary@example.com" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))]" />
            </FieldWrapper>

            {/* Section: Citizenship */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Citizenship</p>

            <LookupSelect label="Citizenship Type" value={data.citizenship_type} onChange={v => onChange({ citizenship_type: v as string })} dictName="citizenship_types" required />

            <ConditionalFieldGroup watchValue={data.citizenship_type} showWhen={['SA_CITIZEN', 'SA_PERMANENT_RESIDENT']}>
                <FieldWrapper label="SA ID Number" required icon="badge" state={(() => { const err = data.sa_id_number ? (validateSaId(data.sa_id_number) || validateSaIdDobMatch(data.sa_id_number, data.dob || '')) : null; return err ? 'error' : data.sa_id_number ? 'success' : 'idle'; })()} error={data.sa_id_number ? (validateSaId(data.sa_id_number) || validateSaIdDobMatch(data.sa_id_number, data.dob || '') || undefined) : undefined}>
                    <input type="text" value={data.sa_id_number} onChange={e => onChange({ sa_id_number: e.target.value.replace(/\D/g, '').slice(0, 13) })} placeholder="e.g. 8501015800085" maxLength={13} className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                </FieldWrapper>
            </ConditionalFieldGroup>

            <ConditionalFieldGroup watchValue={data.citizenship_type} showWhen={['FOREIGN_NATIONAL', 'REFUGEE', 'ASYLUM_SEEKER']}>
                <FieldWrapper label="Passport Number" required icon="flight" state={(() => { const err = data.passport_number ? validatePassport(data.passport_number) : null; return err ? 'error' : data.passport_number ? 'success' : 'idle'; })()} error={data.passport_number ? (validatePassport(data.passport_number) || undefined) : undefined}>
                    <input type="text" value={data.passport_number} onChange={e => onChange({ passport_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9) })} placeholder="Passport number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                </FieldWrapper>
                <LookupSelect label="Permit Type" value={data.permit_type_code} onChange={v => onChange({ permit_type_code: v as string })} dictName="permit_types" />
                <FieldWrapper label="Permit Number" icon="description" state={(() => { const err = data.permit_number ? validatePermit(data.permit_number, data.permit_type_code || '') : null; return err ? 'error' : data.permit_number ? 'success' : 'idle'; })()} error={data.permit_number ? (validatePermit(data.permit_number, data.permit_type_code || '') || undefined) : undefined}>
                    <input type="text" value={data.permit_number} onChange={e => onChange({ permit_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 13) })} placeholder="Permit number" className="w-full h-[44px] px-3 text-[15px] bg-transparent outline-none font-mono text-[hsl(var(--admin-text-main))]" />
                </FieldWrapper>
                <DateField label="Permit Expiry Date" value={data.permit_expiry_date} onChange={v => onChange({ permit_expiry_date: v })} />
            </ConditionalFieldGroup>

            {/* Section: Address */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Address</p>
            <AddressInput label="Residential Address" value={data.address} onChange={v => onChange({ address: v })} required />

            {/* Section: Fees & Financial */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Fees & Financial</p>

            <LookupSelect label="Parent Type" value={data.parent_type_code} onChange={v => onChange({ parent_type_code: v as string })} dictName="parent_types" />

            <FieldWrapper label="" state="idle">
                <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                    <input type="checkbox" checked={data.is_fee_payer} onChange={e => onChange({ is_fee_payer: e.target.checked })} className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">This guardian is the fee payer</span>
                </label>
            </FieldWrapper>

            {data.is_fee_payer && (
                <>
                    <LookupSelect label="Payment Option" value={data.payment_option_code} onChange={v => onChange({ payment_option_code: v as string })} dictName="payment_options" required />
                    <FieldWrapper label="Occupation" state={data.occupation ? 'success' : 'idle'}>
                        <input type="text" value={data.occupation} onChange={e => onChange({ occupation: e.target.value })} placeholder="e.g. Software Engineer" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>
                    <FieldWrapper label="Employer" state={data.employer ? 'success' : 'idle'}>
                        <input type="text" value={data.employer} onChange={e => onChange({ employer: e.target.value })} placeholder="Company name" className="w-full px-3 py-3 text-sm bg-transparent outline-none" />
                    </FieldWrapper>
                    <DocumentUpload label="Financial Documents" value={data.financial_documents} onChange={v => onChange({ financial_documents: v })} docTypes={FINANCIAL_DOC_TYPES} maxFiles={5} />
                    <FieldWrapper label="" state="idle">
                        <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                            <input type="checkbox" checked={data.credit_check_consent} onChange={e => onChange({ credit_check_consent: e.target.checked })} className="rounded border-slate-300" />
                            <span className="text-sm text-slate-700 dark:text-slate-200">I consent to a credit check being performed</span>
                        </label>
                    </FieldWrapper>
                </>
            )}

            <FieldWrapper label="" state="idle">
                <label className="flex items-center gap-3 px-3 py-3 cursor-pointer">
                    <input type="checkbox" checked={data.has_custody_order} onChange={e => onChange({ has_custody_order: e.target.checked })} className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">There is a custody order in place</span>
                </label>
            </FieldWrapper>

            {/* Section: Documents */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Documents</p>
            <DocumentUpload label="Identity & Legal Documents" value={data.documents} onChange={v => onChange({ documents: v })} docTypes={GUARDIAN_DOC_TYPES} maxFiles={6} />
        </div>
    );
}
