import { getRequestConfig } from 'next-intl/server';

// Supported South African locales
export const locales = [
    'en', 'af', 'zu', 'xh', 'st', 'tn', 'nso', 'ts', 'ss', 've', 'nr',
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
    en: 'English',
    af: 'Afrikaans',
    zu: 'isiZulu',
    xh: 'isiXhosa',
    st: 'Sesotho',
    tn: 'Setswana',
    nso: 'Sepedi',
    ts: 'Xitsonga',
    ss: 'siSwati',
    ve: 'Tshivenḓa',
    nr: 'isiNdebele',
};

// Load messages for a given locale
export async function loadMessages(locale: string) {
    const safeLocale = locales.includes(locale as Locale) ? locale : defaultLocale;

    // Load all namespace files and merge
    const [common, hub, chat, auth, translation] = await Promise.all([
        import(`../../locales/${safeLocale}/common.json`).then(m => m.default),
        import(`../../locales/${safeLocale}/hub.json`).then(m => m.default),
        import(`../../locales/${safeLocale}/chat.json`).then(m => m.default),
        import(`../../locales/${safeLocale}/auth.json`).then(m => m.default),
        import(`../../locales/${safeLocale}/translation.json`).then(m => m.default),
    ]);

    return { ...common, ...hub, ...chat, ...auth, ...translation };
}

// next-intl server config (used by the plugin)
export default getRequestConfig(async () => {
    // Default to English — client-side provider overrides with user preference
    const locale = defaultLocale;
    const messages = await loadMessages(locale);

    return {
        locale,
        messages,
    };
});
