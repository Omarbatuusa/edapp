import { apiClient } from './api-client';

// ============================================================
// TRANSLATE API CLIENT
// ============================================================

export interface TranslateRequest {
    tenantId: string;
    sourceLang?: string;
    targetLang: string;
    contentType: string;
    contentId: string;
    text: string;
}

export interface TranslateResponse {
    targetLang: string;
    translatedText: string;
    detectedSourceLang: string;
    cached: boolean;
}

export interface BatchTranslateRequest {
    tenantId: string;
    targetLang: string;
    contentType: string;
    items: { contentId: string; text: string }[];
}

export interface BatchTranslateResponse {
    targetLang: string;
    results: {
        contentId: string;
        translatedText: string;
        detectedSourceLang: string;
        cached: boolean;
    }[];
}

export interface SupportedLanguage {
    code: string;
    name: string;
    nativeName: string;
}

export const translateApi = {
    // Translate a single piece of content
    async translate(data: TranslateRequest): Promise<TranslateResponse> {
        const response = await apiClient.post('/i18n/translate', data);
        return response.data;
    },

    // Batch translate multiple items
    async translateBatch(data: BatchTranslateRequest): Promise<BatchTranslateResponse> {
        const response = await apiClient.post('/i18n/translate/batch', data);
        return response.data;
    },

    // Get supported languages
    async getLanguages(): Promise<{ languages: SupportedLanguage[] }> {
        const response = await apiClient.get('/i18n/languages');
        return response.data;
    },

    // Get user language preferences
    async getPreferences(): Promise<{ preferred_language: string; auto_translate: boolean }> {
        const response = await apiClient.get('/i18n/preferences');
        return response.data;
    },

    // Save user language preferences
    async savePreferences(data: { preferred_language: string; auto_translate?: boolean }): Promise<void> {
        await apiClient.post('/i18n/preferences', data);
    },
};

export default translateApi;
