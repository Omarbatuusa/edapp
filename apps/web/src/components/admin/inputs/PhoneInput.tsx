'use client';

import { useState, useRef, useEffect } from 'react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { FieldWrapper } from './FieldWrapper';
import { authFetch } from '@/lib/authFetch';
import { CountryOption, ALL_COUNTRIES } from './countries';

export type { CountryOption };
export { ALL_COUNTRIES };

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

export function PhoneInput({ label, value, onChange, required, placeholder = 'e.g. 81 234 5678' }: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [validationState, setValidationState] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [search, setSearch] = useState('');
    const countryManuallySetRef = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const selected = ALL_COUNTRIES.find(c => c.iso2 === (value.country_iso2 || 'ZA')) || ALL_COUNTRIES[0];

    // Detect user's country from IP on mount (best-effort, only if not already set)
    useEffect(() => {
        if (value.country_iso2 && value.country_iso2 !== 'ZA') return;
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then((d: { country_code?: string }) => {
                const detected = ALL_COUNTRIES.find(c => c.iso2 === d.country_code);
                // Use ref so stale closure can't overwrite a country the user picked while fetch was in-flight
                if (detected && !countryManuallySetRef.current) {
                    onChange({ ...value, country_iso2: detected.iso2, dial_code: detected.dialCode });
                }
            })
            .catch(() => { /* best-effort */ });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        countryManuallySetRef.current = true;
        onChange({ ...value, country_iso2: country.iso2, dial_code: country.dialCode });
        setIsOpen(false);
        setSearch('');
        // Re-validate if there's an existing number
        if (value.raw) setValidationState('idle');
    };

    const handleBlur = async () => {
        if (!value.raw) {
            if (required) {
                setValidationState('error');
                setErrorMsg('Phone number is required');
            }
            return;
        }

        const raw = value.raw.trim();
        const startsWithZero = raw.startsWith('0');

        // Client-side pre-validation — instant feedback, no network round-trip needed
        const clientValid = isValidPhoneNumber(raw, selected.iso2 as any);
        if (!clientValid) {
            setValidationState('error');
            setErrorMsg(
                startsWithZero
                    ? 'Enter a valid number with no leading zero after the country code.'
                    : 'Number does not match selected country.'
            );
            return;
        }

        // Backend call only when client-side passes — needed for E.164 normalisation
        try {
            const res = await authFetch('/v1/admin/phone/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: raw, country_iso2: selected.iso2 }),
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
                setErrorMsg(
                    startsWithZero
                        ? 'Enter a valid number with no leading zero after the country code.'
                        : 'Number does not match selected country.'
                );
            }
        } catch {
            // Network error — keep idle, don't block user
            setValidationState('idle');
        }
    };

    return (
        <FieldWrapper label={label} required={required} state={validationState} error={errorMsg} showIcon={false}>
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
                            className="absolute top-full left-0 z-50 bg-white border border-[hsl(var(--admin-border)/0.5)] rounded-xl shadow-xl w-72 mt-1 overflow-hidden"
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
                            <div className="max-h-52 overflow-y-auto">
                                {filtered.length === 0 ? (
                                    <p className="px-4 py-3 text-[13px] text-[hsl(var(--admin-text-muted))]">No results</p>
                                ) : filtered.map(c => (
                                    <button
                                        key={c.iso2}
                                        type="button"
                                        onClick={() => handleCountrySelect(c)}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-[13px] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors ${c.iso2 === selected.iso2 ? 'bg-[hsl(var(--admin-primary)/0.08)] text-[hsl(var(--admin-primary))]' : 'text-[hsl(var(--admin-text-main))]'}`}
                                    >
                                        <span className="text-base leading-none flex-shrink-0">{c.flag}</span>
                                        <span className="flex-1 text-left truncate">{c.name}</span>
                                        <span className="text-[hsl(var(--admin-text-muted))] text-[11px] flex-shrink-0">{c.dialCode}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* Phone number input + inline validation icon */}
                <div className="flex flex-1 items-center">
                    <input
                        type="tel"
                        value={value.raw}
                        onChange={e => {
                            onChange({ ...value, raw: e.target.value });
                            setValidationState('idle');
                        }}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        aria-invalid={validationState === 'error'}
                        className="flex-1 h-[44px] pl-3 pr-2 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]"
                    />
                    {validationState !== 'idle' && (
                        <span aria-hidden="true" className={`material-symbols-outlined text-[16px] pr-2.5 flex-shrink-0 ${
                            validationState === 'success'
                                ? 'text-[hsl(var(--admin-success))]'
                                : 'text-[hsl(var(--admin-danger))]'
                        }`}>
                            {validationState === 'success' ? 'check_circle' : 'error'}
                        </span>
                    )}
                </div>
            </div>
        </FieldWrapper>
    );
}
