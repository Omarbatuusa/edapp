'use client';

import { useState, useRef, useEffect } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { ALL_COUNTRIES } from './countries';

interface CountrySelectFieldProps {
    label: string;
    value: string;           // iso2 code, e.g. 'ZA'
    onChange: (iso2: string) => void;
    required?: boolean;
    placeholder?: string;
}

export function CountrySelectField({
    label,
    value,
    onChange,
    required,
    placeholder = '— Select country —',
}: CountrySelectFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [touched, setTouched] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const selected = ALL_COUNTRIES.find(c => c.iso2 === value);

    const fieldState = value
        ? ('success' as const)
        : required && touched
        ? ('error' as const)
        : ('idle' as const);

    const filtered = ALL_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.iso2.toLowerCase().includes(search.toLowerCase())
    );

    // Close on outside click
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

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setIsOpen(false); setSearch(''); }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    const handleOpen = () => {
        setTouched(true);
        setIsOpen(!isOpen);
        setSearch('');
    };

    const handleSelect = (iso2: string) => {
        onChange(iso2);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="relative">
            <FieldWrapper
                label={label}
                required={required}
                state={fieldState}
                error={fieldState === 'error' ? 'Please select a country' : undefined}
                showIcon={false}
            >
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={handleOpen}
                    className="w-full flex items-center justify-between px-4 h-[44px] text-[15px] bg-transparent outline-none text-left"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen ? 'true' : 'false'}
                >
                    {selected ? (
                        <span className="flex items-center gap-2 text-[hsl(var(--admin-text-main))]">
                            <span className="text-base leading-none">{selected.flag}</span>
                            <span>{selected.name}</span>
                        </span>
                    ) : (
                        <span className="text-[hsl(var(--admin-text-muted)/0.6)]">{placeholder}</span>
                    )}
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))] flex-shrink-0">
                        expand_more
                    </span>
                </button>
            </FieldWrapper>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--admin-border)/0.5)] rounded-xl shadow-xl overflow-hidden"
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
                    <div className="max-h-52 overflow-y-auto" role="listbox">
                        {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-[13px] text-[hsl(var(--admin-text-muted))]">No results</p>
                        ) : (
                            filtered.map(c => {
                                const isSelected = c.iso2 === value;
                                return (
                                    <button
                                        key={c.iso2}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected ? 'true' : 'false'}
                                        onClick={() => handleSelect(c.iso2)}
                                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors ${
                                            isSelected
                                                ? 'bg-[hsl(var(--admin-primary)/0.08)] text-[hsl(var(--admin-primary))]'
                                                : 'text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))]'
                                        }`}
                                    >
                                        <span className="text-base leading-none flex-shrink-0">{c.flag}</span>
                                        <span className="flex-1 truncate">{c.name}</span>
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-[15px] text-[hsl(var(--admin-primary))] flex-shrink-0">
                                                check
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
