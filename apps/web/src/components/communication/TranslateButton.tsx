'use client';

import React, { useState, useCallback } from 'react';
import { translateApi } from '@/lib/translate-api';

// ============================================================
// TRANSLATE BUTTON — Reusable component for translating content
// ============================================================

interface TranslateButtonProps {
    contentId: string;
    contentType: string; // 'announcement' | 'chat_message' | 'ticket_message'
    text: string;
    tenantId: string;
    targetLang?: string; // defaults to user's content language preference
    className?: string;
    compact?: boolean; // smaller variant for inline use
    onTranslated?: (translatedText: string, sourceLang: string) => void;
}

export function TranslateButton({
    contentId,
    contentType,
    text,
    tenantId,
    targetLang,
    className = '',
    compact = false,
    onTranslated,
}: TranslateButtonProps) {
    const [state, setState] = useState<'idle' | 'loading' | 'translated' | 'error'>('idle');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('');
    const [showOriginal, setShowOriginal] = useState(false);

    // Get user's preferred content language
    const getTargetLang = useCallback(() => {
        if (targetLang) return targetLang;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('edapp_content_language') || 'en';
        }
        return 'en';
    }, [targetLang]);

    const handleTranslate = useCallback(async () => {
        if (state === 'translated') {
            // Toggle between original and translated
            setShowOriginal(!showOriginal);
            return;
        }

        setState('loading');
        try {
            const result = await translateApi.translate({
                tenantId,
                sourceLang: 'auto',
                targetLang: getTargetLang(),
                contentType,
                contentId,
                text,
            });

            setTranslatedText(result.translatedText);
            setSourceLang(result.detectedSourceLang);
            setState('translated');
            onTranslated?.(result.translatedText, result.detectedSourceLang);
        } catch (err: any) {
            setState('error');
            console.error('Translation failed:', err);
            // Reset to idle after 3s
            setTimeout(() => setState('idle'), 3000);
        }
    }, [state, showOriginal, tenantId, getTargetLang, contentType, contentId, text, onTranslated]);

    if (compact) {
        return (
            <button
                onClick={handleTranslate}
                disabled={state === 'loading'}
                className={`inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 ${className}`}
            >
                <span className="material-symbols-outlined text-[14px]">
                    {state === 'loading' ? 'progress_activity' : 'translate'}
                </span>
                <span>
                    {state === 'loading' && 'Translating...'}
                    {state === 'idle' && 'Translate'}
                    {state === 'translated' && (showOriginal ? 'View translated' : 'View original')}
                    {state === 'error' && 'Failed — retry'}
                </span>
            </button>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Translate/Toggle button */}
            <button
                onClick={handleTranslate}
                disabled={state === 'loading'}
                className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
          ${state === 'translated'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-secondary/60 text-muted-foreground hover:bg-secondary border border-border/50 hover:border-primary/30'
                    }
          disabled:opacity-50
        `}
            >
                <span className={`material-symbols-outlined text-[16px] ${state === 'loading' ? 'animate-spin' : ''}`}>
                    {state === 'loading' ? 'progress_activity' : 'translate'}
                </span>
                <span>
                    {state === 'loading' && 'Translating...'}
                    {state === 'idle' && 'Translate'}
                    {state === 'translated' && (showOriginal ? 'Translated' : 'Original')}
                    {state === 'error' && 'Translation failed'}
                </span>
            </button>

            {/* Translated content */}
            {state === 'translated' && !showOriginal && (
                <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-xl text-sm leading-relaxed">
                    <p>{translatedText}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">info</span>
                        Translated from {getLanguageName(sourceLang)}
                    </p>
                </div>
            )}
        </div>
    );
}

// ============================================================
// INLINE TRANSLATE — For chat messages (shows under original)
// ============================================================
interface InlineTranslateProps {
    contentId: string;
    contentType?: string;
    text: string;
    tenantId: string;
    targetLang?: string;
}

export function InlineTranslate({
    contentId,
    contentType = 'chat_message',
    text,
    tenantId,
    targetLang,
}: InlineTranslateProps) {
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('');
    const [expanded, setExpanded] = useState(true);

    if (!translatedText) {
        // Translate on mount
        return (
            <TranslateLoader
                contentId={contentId}
                contentType={contentType}
                text={text}
                tenantId={tenantId}
                targetLang={targetLang}
                onTranslated={(text, lang) => {
                    setTranslatedText(text);
                    setSourceLang(lang);
                }}
            />
        );
    }

    return (
        <div className="mt-1">
            <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] text-primary/70 hover:text-primary flex items-center gap-0.5"
            >
                <span className="material-symbols-outlined text-[12px]">
                    {expanded ? 'expand_less' : 'expand_more'}
                </span>
                {expanded ? 'Hide translation' : `Translated from ${getLanguageName(sourceLang)}`}
            </button>
            {expanded && (
                <p className="text-sm text-muted-foreground mt-0.5 italic">
                    {translatedText}
                </p>
            )}
        </div>
    );
}

// Internal loading component
function TranslateLoader({
    contentId,
    contentType,
    text,
    tenantId,
    targetLang,
    onTranslated,
}: InlineTranslateProps & { onTranslated: (text: string, lang: string) => void }) {
    React.useEffect(() => {
        const lang = targetLang || localStorage.getItem('edapp_content_language') || 'en';
        translateApi
            .translate({
                tenantId,
                sourceLang: 'auto',
                targetLang: lang,
                contentType: contentType || 'chat_message',
                contentId,
                text,
            })
            .then((res) => onTranslated(res.translatedText, res.detectedSourceLang))
            .catch((err) => console.error('Translation failed:', err));
    }, [contentId, contentType, text, tenantId, targetLang, onTranslated]);

    return (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
            Translating...
        </div>
    );
}

// ============================================================
// HELPER
// ============================================================
function getLanguageName(code: string): string {
    const names: Record<string, string> = {
        en: 'English',
        af: 'Afrikaans',
        zu: 'Zulu',
        xh: 'Xhosa',
        st: 'Sotho',
        tn: 'Tswana',
        nso: 'Northern Sotho',
        ts: 'Tsonga',
        ss: 'Swati',
        ve: 'Venda',
        nr: 'South Ndebele',
        fr: 'French',
        pt: 'Portuguese',
        es: 'Spanish',
        ar: 'Arabic',
        sw: 'Swahili',
    };
    return names[code] || code;
}
