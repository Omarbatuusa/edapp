'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { FieldWrapper } from './FieldWrapper';
import { CountryOption, ALL_COUNTRIES } from './countries';

export interface PhoneFieldValue {
    raw: string;
    e164: string;
    country_iso2: string;
    dial_code: string;
}

interface PhoneFieldProps {
    label: string;
    value: PhoneFieldValue;
    onChange: (value: PhoneFieldValue) => void;
    required?: boolean;
    placeholder?: string;
    /** Fallback country if IP detection fails (e.g. tenant.country_code) */
    defaultCountry?: string;
    helper?: string;
    disabled?: boolean;
}

const EMPTY: PhoneFieldValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };

export function PhoneField({
    label,
    value,
    onChange,
    required,
    placeholder = 'e.g. 82 123 4567',
    defaultCountry,
    helper,
    disabled,
}: PhoneFieldProps) {
    // Guard against stale/invalid value from autosave drafts
    // Must have: raw (string), country_iso2 (2-letter ISO code)
    if (
        !value ||
        typeof value !== 'object' ||
        typeof value.raw !== 'string' ||
        typeof value.country_iso2 !== 'string' ||
        value.country_iso2.length !== 2
    ) {
        value = { ...EMPTY };
    }

    const [isOpen, setIsOpen] = useState(false);
    const [validationState, setValidationState] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [e164Preview, setE164Preview] = useState('');
    const [search, setSearch] = useState('');
    const countryManuallySetRef = useRef(false);
    const hasInteractedRef = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selected = ALL_COUNTRIES.find(c => c.iso2 === (value.country_iso2 || 'ZA')) || ALL_COUNTRIES[0];

    // ----- IP detection with sessionStorage cache + fallback -----
    useEffect(() => {
        if (countryManuallySetRef.current) return;
        // If the value already has a non-default country, skip detection
        if (value.country_iso2 && value.country_iso2 !== 'ZA' && value.country_iso2 !== (defaultCountry || 'ZA')) return;

        const apply = (iso2: string) => {
            const c = ALL_COUNTRIES.find(x => x.iso2 === iso2);
            if (c && !countryManuallySetRef.current) {
                onChange({ ...value, country_iso2: c.iso2, dial_code: c.dialCode });
            }
        };

        // Check sessionStorage cache first
        try {
            const cached = sessionStorage.getItem('edapp_ip_country');
            if (cached) { apply(cached); return; }
        } catch { /* SSR or no sessionStorage */ }

        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then((d: { country_code?: string }) => {
                if (d.country_code) {
                    try { sessionStorage.setItem('edapp_ip_country', d.country_code); } catch {}
                    apply(d.country_code);
                }
            })
            .catch(() => {
                // Fallback to defaultCountry prop (tenant's country_code)
                if (defaultCountry) apply(defaultCountry);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ----- Reload saved E.164 value into display format -----
    useEffect(() => {
        if (value.e164 && !value.raw) {
            try {
                const parsed = parsePhoneNumber(value.e164);
                if (parsed) {
                    onChange({
                        raw: parsed.formatNational(),
                        e164: value.e164,
                        country_iso2: parsed.country || value.country_iso2,
                        dial_code: `+${parsed.countryCallingCode}`,
                    });
                }
            } catch { /* leave as-is */ }
        }
    }, [value.e164]); // eslint-disable-line react-hooks/exhaustive-deps

    // ----- Client-side validation -----
    const validate = useCallback((raw: string, countryIso2: string): { valid: boolean; parsed?: ReturnType<typeof parsePhoneNumber> } => {
        if (!raw.trim()) return { valid: false };
        try {
            const country = countryIso2.toUpperCase() as CountryCode;
            const parsed = parsePhoneNumber(raw.trim(), country);
            if (parsed && parsed.isValid()) return { valid: true, parsed };
        } catch { /* fall through */ }

        // If starts with +, try without country hint
        if (raw.trim().startsWith('+')) {
            try {
                const parsed = parsePhoneNumber(raw.trim());
                if (parsed && parsed.isValid()) return { valid: true, parsed };
            } catch {}
        }
        return { valid: false };
    }, []);

    // ----- Country filtering -----
    const filtered = ALL_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dialCode.includes(search) ||
        c.iso2.toLowerCase().includes(search.toLowerCase())
    );

    // ----- Close dropdown on outside click -----
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

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // ----- Handlers -----
    const handleCountrySelect = (country: CountryOption) => {
        countryManuallySetRef.current = true;
        const updated = { ...value, country_iso2: country.iso2, dial_code: country.dialCode };

        // Revalidate existing number against new country
        if (value.raw.trim()) {
            const { valid, parsed } = validate(value.raw, country.iso2);
            if (valid && parsed) {
                updated.e164 = parsed.format('E.164');
                setValidationState('success');
                setErrorMsg('');
                setE164Preview(parsed.formatInternational());
            } else {
                updated.e164 = '';
                if (hasInteractedRef.current) {
                    setValidationState('error');
                    setErrorMsg('Number does not match the selected country.');
                } else {
                    setValidationState('idle');
                }
                setE164Preview('');
            }
        }

        onChange(updated);
        setIsOpen(false);
        setSearch('');
    };

    const handleInputChange = (rawInput: string) => {
        hasInteractedRef.current = true;
        // Clear previous validation on every keystroke
        setValidationState('idle');
        setErrorMsg('');

        // Auto-convert leading zero to international format for validation
        let raw = rawInput;
        if (/^0\d/.test(raw.replace(/\s/g, '')) && selected.dialCode) {
            const stripped = raw.replace(/\s/g, '').replace(/^0+/, '');
            // Validate with dial code prepended, but keep display as-is
            const intl = `${selected.dialCode}${stripped}`;
            const intlResult = validate(intl, value.country_iso2);
            if (intlResult.valid && intlResult.parsed) {
                setE164Preview(intlResult.parsed.formatInternational());
                onChange({
                    ...value,
                    raw: rawInput,
                    e164: intlResult.parsed.format('E.164'),
                    country_iso2: intlResult.parsed.country || value.country_iso2,
                    dial_code: `+${intlResult.parsed.countryCallingCode}`,
                });
                return;
            }
        }

        // Client-side live validation (non-blocking)
        const { valid, parsed } = validate(raw, value.country_iso2);
        if (valid && parsed) {
            setE164Preview(parsed.formatInternational());
            onChange({
                ...value,
                raw,
                e164: parsed.format('E.164'),
                country_iso2: parsed.country || value.country_iso2,
                dial_code: `+${parsed.countryCallingCode}`,
            });
        } else {
            setE164Preview('');
            onChange({ ...value, raw, e164: '' });
        }
    };

    const handleBlur = () => {
        if (!value.raw.trim()) {
            if (required) {
                setValidationState('error');
                setErrorMsg('This field is required.');
            }
            setE164Preview('');
            return;
        }

        const { valid, parsed } = validate(value.raw, value.country_iso2);
        if (valid && parsed) {
            setValidationState('success');
            setErrorMsg('');
            setE164Preview(parsed.formatInternational());
            onChange({
                ...value,
                e164: parsed.format('E.164'),
                country_iso2: parsed.country || value.country_iso2,
                dial_code: `+${parsed.countryCallingCode}`,
            });
        } else {
            setValidationState('error');
            setErrorMsg('Enter a valid number for the selected country.');
            setE164Preview('');
        }
    };

    // Compute helper text
    const helperText = validationState === 'success' && e164Preview
        ? `Will be saved as ${e164Preview}`
        : helper || undefined;

    return (
        <FieldWrapper
            label={label}
            required={required}
            state={validationState}
            error={errorMsg}
            helper={helperText}
            showIcon={false}
        >
            <div className="flex items-stretch min-h-[44px]">
                {/* Country selector — button always visible */}
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => { if (!disabled) { setIsOpen(!isOpen); setSearch(''); } }}
                    disabled={disabled}
                    className="flex items-center gap-1.5 px-3 h-[44px] border-r border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-surface-alt)/0.3)] text-[13px] font-medium hover:bg-[hsl(var(--admin-surface-alt))] transition-colors min-w-[80px] disabled:opacity-50 flex-shrink-0"
                    aria-label={`Select country code, currently ${selected.name}`}
                    aria-haspopup="listbox"
                >
                    <img src={`https://flagcdn.com/w40/${selected.iso2.toLowerCase()}.png`} alt={selected.name} className="w-5 h-3.5 object-cover rounded-[2px]" />
                    <span className="text-[hsl(var(--admin-text-muted))] text-[12px]">{selected.dialCode}</span>
                    <span className="material-symbols-outlined text-[12px] text-[hsl(var(--admin-text-muted))]">expand_more</span>
                </button>

                {/* Country dropdown — rendered in portal to avoid overflow clipping */}
                {isOpen && typeof document !== 'undefined' && createPortal(
                    <div
                        ref={dropdownRef}
                        role="listbox"
                        aria-label="Select country"
                        style={{
                            position: 'fixed',
                            top: (triggerRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                            left: triggerRef.current?.getBoundingClientRect().left ?? 0,
                            zIndex: 9999,
                        }}
                        className="bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border)/0.5)] rounded-xl shadow-xl w-72 overflow-hidden"
                    >
                        <div className="p-2 border-b border-[hsl(var(--admin-border)/0.3)]">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search country..."
                                aria-label="Search countries"
                                className="w-full px-3 py-1.5 text-[13px] bg-[hsl(var(--admin-surface-alt)/0.5)] rounded-lg border border-[hsl(var(--admin-border)/0.4)] outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))]"
                            />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <p className="px-4 py-3 text-[13px] text-[hsl(var(--admin-text-muted))]">No results</p>
                            ) : filtered.map(c => (
                                <button
                                    key={c.iso2}
                                    type="button"
                                    role="option"
                                    onClick={() => handleCountrySelect(c)}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-[13px] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors ${
                                        c.iso2 === selected.iso2
                                            ? 'bg-[hsl(var(--admin-primary)/0.08)] text-[hsl(var(--admin-primary))]'
                                            : 'text-[hsl(var(--admin-text-main))]'
                                    }`}
                                >
                                    <img src={`https://flagcdn.com/w40/${c.iso2.toLowerCase()}.png`} alt={c.name} className="w-5 h-3.5 object-cover rounded-[2px] flex-shrink-0" />
                                    <span className="flex-1 text-left truncate">{c.name}</span>
                                    <span className="text-[hsl(var(--admin-text-muted))] text-[11px] flex-shrink-0">{c.dialCode}</span>
                                </button>
                            ))}
                        </div>
                    </div>,
                    document.body,
                )}

                {/* Phone number input + inline validation icon */}
                <div className="flex flex-1 items-center">
                    <input
                        type="tel"
                        inputMode="tel"
                        value={value.raw}
                        onChange={e => handleInputChange(e.target.value)}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        aria-label={label}
                        aria-invalid={validationState === 'error'}
                        aria-describedby={errorMsg ? `${label}-error` : undefined}
                        className="flex-1 h-[44px] pl-3 pr-2 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)] disabled:opacity-50"
                    />
                    {validationState !== 'idle' && (
                        <span
                            aria-hidden="true"
                            className={`material-symbols-outlined text-[16px] pr-2.5 flex-shrink-0 ${
                                validationState === 'success'
                                    ? 'text-[hsl(var(--admin-success))]'
                                    : 'text-[hsl(var(--admin-danger))]'
                            }`}
                        >
                            {validationState === 'success' ? 'check_circle' : 'error'}
                        </span>
                    )}
                </div>
            </div>
        </FieldWrapper>
    );
}
