'use client';

import { useState, useRef, useEffect } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { authFetch } from '@/lib/authFetch';

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

export const ALL_COUNTRIES: CountryOption[] = [
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
    const triggerRef = useRef<HTMLButtonElement>(null);

    const selected = ALL_COUNTRIES.find(c => c.iso2 === (value.country_iso2 || 'ZA')) || PRIORITY_COUNTRIES[0];

    const filtered = ALL_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dialCode.includes(search) ||
        c.iso2.toLowerCase().includes(search.toLowerCase())
    );

    // Close dropdown on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

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
            const res = await authFetch('/v1/admin/phone/validate', {
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
                        ref={triggerRef}
                        type="button"
                        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                        className="flex items-center gap-1.5 px-3 h-full border-r border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-surface-alt)/0.3)] text-[13px] font-medium hover:bg-[hsl(var(--admin-surface-alt))] transition-colors min-w-[80px]"
                        aria-label="Select country code"
                    >
                        <span className="text-base leading-none">{selected.flag}</span>
                        <span className="text-[hsl(var(--admin-text-muted))] text-[12px]">{selected.dialCode}</span>
                        <span className="material-symbols-outlined text-[12px] text-[hsl(var(--admin-text-muted))]">expand_more</span>
                    </button>
                    {isOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 z-50 bg-white border border-[hsl(var(--admin-border)/0.5)] rounded-xl shadow-xl w-64 mt-1 overflow-hidden"
                        >
                            <div className="p-2 border-b border-[hsl(var(--admin-border)/0.3)]">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search country..."
                                    aria-label="Search countries"
                                    className="w-full px-3 py-1.5 text-[13px] bg-[hsl(var(--admin-surface-alt)/0.5)] rounded-lg border border-[hsl(var(--admin-border)/0.4)] outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))]"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {filtered.map(c => (
                                    <button
                                        key={c.iso2}
                                        type="button"
                                        onClick={() => handleCountrySelect(c)}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-[13px] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors ${c.iso2 === selected.iso2 ? 'bg-[hsl(var(--admin-primary)/0.08)] text-[hsl(var(--admin-primary))]' : 'text-[hsl(var(--admin-text-main))]'}`}
                                    >
                                        <span className="text-base leading-none">{c.flag}</span>
                                        <span className="flex-1 text-left">{c.name}</span>
                                        <span className="text-[hsl(var(--admin-text-muted))] text-[11px]">{c.dialCode}</span>
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
                    className="flex-1 h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]"
                />
            </div>
        </FieldWrapper>
    );
}
