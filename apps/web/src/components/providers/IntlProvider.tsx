'use client';

import React, { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { defaultLocale, loadMessages, locales, type Locale } from '@/lib/i18n';

// ============================================================
// LOCALE PREFERENCE — localStorage key
// ============================================================
const LOCALE_KEY = 'edapp_ui_language';

export function getStoredLocale(): Locale {
    if (typeof window === 'undefined') return defaultLocale;
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && (locales as readonly string[]).includes(stored)) {
        return stored as Locale;
    }
    return defaultLocale;
}

export function setStoredLocale(locale: Locale) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_KEY, locale);
        // Trigger re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('locale-change', { detail: locale }));
    }
}

// ============================================================
// PROVIDER COMPONENT
// ============================================================
export function IntlProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>(defaultLocale);
    const [messages, setMessages] = useState<Record<string, any> | null>(null);

    // Load messages for the current locale
    useEffect(() => {
        const currentLocale = getStoredLocale();
        setLocale(currentLocale);
        loadMessages(currentLocale).then(setMessages);
    }, []);

    // Listen for locale changes from LanguagePicker
    useEffect(() => {
        const handler = (e: Event) => {
            const newLocale = (e as CustomEvent).detail as Locale;
            setLocale(newLocale);
            loadMessages(newLocale).then(setMessages);
        };
        window.addEventListener('locale-change', handler);
        return () => window.removeEventListener('locale-change', handler);
    }, []);

    // Show nothing until messages are loaded (prevents flash)
    if (!messages) return null;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
