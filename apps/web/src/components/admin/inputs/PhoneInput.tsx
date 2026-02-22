'use client';

import { useState, useRef } from 'react';
import { FieldWrapper } from './FieldWrapper';

interface CountryOption {
    iso2: string;
    name: string;
    dialCode: string;
    flag: string;
}

const PRIORITY_COUNTRIES: CountryOption[] = [
    { iso2: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
    { iso2: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼' },
    { iso2: 'MZ', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿' },
    { iso2: 'NA', name: 'Namibia', dialCode: '+264', flag: '🇳🇦' },
    { iso2: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼' },
    { iso2: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
    { iso2: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
    { iso2: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
    { iso2: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
    { iso2: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

const ALL_COUNTRIES: CountryOption[] = [
    ...PRIORITY_COUNTRIES,
    { iso2: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴' },
    { iso2: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
    { iso2: 'CD', name: 'DR Congo', dialCode: '+243', flag: '🇨🇩' },
    { iso2: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
    { iso2: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { iso2: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { iso2: 'LS', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸' },
    { iso2: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼' },
    { iso2: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
    { iso2: 'SZ', name: 'Eswatini', dialCode: '+268', flag: '🇸🇿' },
    { iso2: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
    { iso2: 'ZM', name: 'Zambia', dialCode: '+260', flag: '🇿🇲' },
];

export interface PhoneValue {
    raw: string;
    e164: string;
    country_iso2: string;
    dial_code: string;
}

interface PhoneInputProps {
    label: string;
    value: PhoneValue;
    onChange: (value: PhoneValue) => void;
    required?: boolean;
    placeholder?: string;
}

export function PhoneInput({ label, value, onChange, required, placeholder = 'e.g. 081 234 5678' }: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [validationState, setValidationState] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = ALL_COUNTRIES.find(c => c.iso2 === (value.country_iso2 || 'ZA')) || PRIORITY_COUNTRIES[0];

    const filtered = ALL_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dialCode.includes(search) ||
        c.iso2.toLowerCase().includes(search.toLowerCase())
    );

    const handleCountrySelect = (country: CountryOption) => {
        onChange({ ...value, country_iso2: country.iso2, dial_code: country.dialCode });
        setIsOpen(false);
        setSearch('');
    };

    const handleBlur = async () => {
        if (!value.raw) {
            if (required) {
                setValidationState('error');
                setErrorMsg('Phone number is required');
            }
            return;
        }

        try {
            const res = await fetch('/v1/admin/phone/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: value.raw, country_iso2: selected.iso2 }),
            });
            const data = await res.json();
            if (data.valid) {
                setValidationState('success');
                setErrorMsg('');
                onChange({
                    raw: value.raw,
                    e164: data.e164,
                    country_iso2: data.country_iso2,
                    dial_code: data.dial_code,
                });
            } else {
                setValidationState('error');
                setErrorMsg('Invalid phone number for selected country');
            }
        } catch {
            // Network error — keep idle, don't block user
            setValidationState('idle');
        }
    };

    return (
        <FieldWrapper label={label} required={required} state={validationState} error={errorMsg}>
            <div className="flex items-stretch">
                {/* Country selector */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1.5 px-3 h-full border-r border-[#e2e8f0] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-w-[80px]"
                    >
                        <span className="text-base">{selected.flag}</span>
                        <span className="text-slate-500 text-xs">{selected.dialCode}</span>
                        <span className="material-symbols-outlined text-xs text-slate-400">expand_more</span>
                    </button>
                    {isOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 z-50 bg-white dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl shadow-xl w-64 mt-1 overflow-hidden"
                        >
                            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search country..."
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {filtered.map(c => (
                                    <button
                                        key={c.iso2}
                                        type="button"
                                        onClick={() => handleCountrySelect(c)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${c.iso2 === selected.iso2 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <span className="text-base">{c.flag}</span>
                                        <span className="flex-1 text-left">{c.name}</span>
                                        <span className="text-slate-400 text-xs">{c.dialCode}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* Phone input */}
                <input
                    type="tel"
                    value={value.raw}
                    onChange={e => {
                        onChange({ ...value, raw: e.target.value });
                        setValidationState('idle');
                    }}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
            </div>
        </FieldWrapper>
    );
}
