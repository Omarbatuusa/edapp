'use client';

import React, { useState } from 'react';
import { locales, localeNames, type Locale } from '@/lib/i18n';
import { setStoredLocale, getStoredLocale } from '@/components/providers/IntlProvider';

// ============================================================
// LANGUAGE PICKER — For settings and header
// ============================================================

interface LanguagePickerProps {
    className?: string;
    onSelect?: (locale: Locale) => void;
}

export function LanguagePicker({ className = '', onSelect }: LanguagePickerProps) {
    const [current, setCurrent] = useState<Locale>(getStoredLocale());
    const [open, setOpen] = useState(false);

    const handleSelect = (locale: Locale) => {
        setCurrent(locale);
        setStoredLocale(locale);
        setOpen(false);
        onSelect?.(locale);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors text-sm"
            >
                <span className="material-symbols-outlined text-[18px]">translate</span>
                <span className="font-medium">{localeNames[current]}</span>
                <span className="material-symbols-outlined text-[16px]">
                    {open ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute top-full mt-1 left-0 z-50 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[200px] max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {locales.map((locale) => (
                            <button
                                key={locale}
                                onClick={() => handleSelect(locale)}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-secondary/50 transition-colors ${locale === current ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                                    }`}
                            >
                                <span>{localeNames[locale]}</span>
                                {locale === current && (
                                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// Compact variant for header/toolbar
export function LanguagePickerCompact({ onSelect }: { onSelect?: (locale: Locale) => void }) {
    return (
        <LanguagePicker
            className="inline-flex"
            onSelect={onSelect}
        />
    );
}
