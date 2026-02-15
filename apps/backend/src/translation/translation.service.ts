import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ContentTranslation } from './content-translation.entity';
import * as crypto from 'crypto';

// Google Cloud Translate v3 (Advanced)
import { v3 } from '@google-cloud/translate';

// ============================================================
// SUPPORTED LANGUAGES — South Africa defaults
// ============================================================
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
    { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
    { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
    { code: 'st', name: 'Sotho', nativeName: 'Sesotho' },
    { code: 'tn', name: 'Tswana', nativeName: 'Setswana' },
    { code: 'nso', name: 'Northern Sotho', nativeName: 'Sepedi' },
    { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga' },
    { code: 'ss', name: 'Swati', nativeName: 'siSwati' },
    { code: 've', name: 'Venda', nativeName: 'Tshivenḓa' },
    { code: 'nr', name: 'South Ndebele', nativeName: 'isiNdebele' },
];

// ============================================================
// DTOs (classes for runtime presence — required by emitDecoratorMetadata)
// ============================================================
export class TranslateRequestDto {
    tenantId: string;
    sourceLang?: string; // 'auto' or ISO code
    targetLang: string;
    contentType: string;
    contentId: string;
    text: string;
}

export class TranslateResponseDto {
    targetLang: string;
    translatedText: string;
    detectedSourceLang: string;
    cached: boolean;
}

export class BatchTranslateRequestDto {
    tenantId: string;
    targetLang: string;
    contentType: string;
    items: { contentId: string; text: string }[];
}

export class BatchTranslateResponseDto {
    targetLang: string;
    results: {
        contentId: string;
        translatedText: string;
        detectedSourceLang: string;
        cached: boolean;
    }[];
}

@Injectable()
export class TranslationService {
    private readonly logger = new Logger(TranslationService.name);
    private readonly translateClient: v3.TranslationServiceClient;
    private readonly projectId: string;
    private readonly location = 'global';

    // In-memory rate limiting: userId -> { count, resetAt }
    private rateLimits = new Map<string, { count: number; resetAt: number }>();
    private readonly rateLimit: number;

    constructor(
        @InjectRepository(ContentTranslation)
        private readonly translationRepo: Repository<ContentTranslation>,
        private readonly configService: ConfigService,
    ) {
        // ADC auth — no key file needed, uses VM service account
        this.translateClient = new v3.TranslationServiceClient();
        this.projectId = this.configService.get<string>(
            'GCP_PROJECT_ID',
            'project-de6af2c8-5927-4aeb-a27',
        );
        this.rateLimit = parseInt(
            this.configService.get<string>('TRANSLATE_RATE_LIMIT', '60'),
            10,
        );
    }

    // ============================================================
    // SINGLE TRANSLATE
    // ============================================================
    async translate(
        dto: TranslateRequestDto,
        userId?: string,
    ): Promise<TranslateResponseDto> {
        // Rate limit check
        if (userId) {
            this.checkRateLimit(userId);
        }

        const hash = this.hashText(dto.text);

        // 1. Check cache
        const cached = await this.translationRepo.findOne({
            where: {
                tenant_id: dto.tenantId,
                content_type: dto.contentType,
                content_id: dto.contentId,
                target_lang: dto.targetLang,
                original_hash: hash,
            },
        });

        if (cached) {
            return {
                targetLang: dto.targetLang,
                translatedText: cached.translated_text,
                detectedSourceLang: cached.source_lang,
                cached: true,
            };
        }

        // 2. Call Google Translate
        const result = await this.callGoogleTranslate(
            dto.text,
            dto.targetLang,
            dto.sourceLang === 'auto' ? undefined : dto.sourceLang,
        );

        // 3. Cache the result
        const entity = this.translationRepo.create({
            tenant_id: dto.tenantId,
            content_type: dto.contentType,
            content_id: dto.contentId,
            source_lang: result.detectedSourceLang,
            target_lang: dto.targetLang,
            original_hash: hash,
            translated_text: result.translatedText,
            provider: 'gcp',
        });

        try {
            await this.translationRepo.save(entity);
        } catch (err: any) {
            // Ignore duplicate key errors (concurrent requests)
            if (err.code !== '23505') throw err;
        }

        // Increment rate limit
        if (userId) this.incrementRateLimit(userId);

        return {
            targetLang: dto.targetLang,
            translatedText: result.translatedText,
            detectedSourceLang: result.detectedSourceLang,
            cached: false,
        };
    }

    // ============================================================
    // BATCH TRANSLATE
    // ============================================================
    async translateBatch(
        dto: BatchTranslateRequestDto,
        userId?: string,
    ): Promise<BatchTranslateResponseDto> {
        if (userId) this.checkRateLimit(userId);

        const results: BatchTranslateResponseDto['results'] = [];

        // 1. Compute hashes and check cache for all items
        const itemsWithHash = dto.items.map((item) => ({
            ...item,
            hash: this.hashText(item.text),
        }));

        const cachedEntries = await this.translationRepo.find({
            where: {
                tenant_id: dto.tenantId,
                content_type: dto.contentType,
                target_lang: dto.targetLang,
                content_id: In(itemsWithHash.map((i) => i.contentId)),
            },
        });

        // Build lookup map: contentId+hash -> cached entry
        const cacheMap = new Map<string, ContentTranslation>();
        for (const entry of cachedEntries) {
            cacheMap.set(`${entry.content_id}:${entry.original_hash}`, entry);
        }

        // 2. Separate cached vs uncached
        const uncached: typeof itemsWithHash = [];
        for (const item of itemsWithHash) {
            const key = `${item.contentId}:${item.hash}`;
            const hit = cacheMap.get(key);
            if (hit) {
                results.push({
                    contentId: item.contentId,
                    translatedText: hit.translated_text,
                    detectedSourceLang: hit.source_lang,
                    cached: true,
                });
            } else {
                uncached.push(item);
            }
        }

        // 3. Batch translate uncached items via Google
        if (uncached.length > 0) {
            const texts = uncached.map((i) => i.text);
            const translated = await this.callGoogleTranslateBatch(
                texts,
                dto.targetLang,
            );

            const entitiesToSave: ContentTranslation[] = [];

            for (let i = 0; i < uncached.length; i++) {
                const item = uncached[i];
                const tr = translated[i];

                results.push({
                    contentId: item.contentId,
                    translatedText: tr.translatedText,
                    detectedSourceLang: tr.detectedSourceLang,
                    cached: false,
                });

                entitiesToSave.push(
                    this.translationRepo.create({
                        tenant_id: dto.tenantId,
                        content_type: dto.contentType,
                        content_id: item.contentId,
                        source_lang: tr.detectedSourceLang,
                        target_lang: dto.targetLang,
                        original_hash: item.hash,
                        translated_text: tr.translatedText,
                        provider: 'gcp',
                    }),
                );
            }

            // Bulk save, ignore duplicates
            try {
                await this.translationRepo
                    .createQueryBuilder()
                    .insert()
                    .into(ContentTranslation)
                    .values(entitiesToSave)
                    .orIgnore()
                    .execute();
            } catch (err) {
                this.logger.warn('Batch cache save error (non-fatal)', err);
            }

            if (userId) {
                // Count uncached items against rate limit
                for (let i = 0; i < uncached.length; i++) {
                    this.incrementRateLimit(userId);
                }
            }
        }

        return { targetLang: dto.targetLang, results };
    }

    // ============================================================
    // SUPPORTED LANGUAGES
    // ============================================================
    getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }

    // ============================================================
    // GOOGLE TRANSLATE — Single
    // ============================================================
    private async callGoogleTranslate(
        text: string,
        targetLang: string,
        sourceLang?: string,
    ): Promise<{ translatedText: string; detectedSourceLang: string }> {
        try {
            const parent = `projects/${this.projectId}/locations/${this.location}`;

            const [response] = await this.translateClient.translateText({
                parent,
                contents: [text],
                mimeType: 'text/plain',
                ...(sourceLang ? { sourceLanguageCode: sourceLang } : {}),
                targetLanguageCode: targetLang,
            });

            const translation = response.translations?.[0];
            if (!translation?.translatedText) {
                throw new Error('Empty translation response from Google');
            }

            return {
                translatedText: translation.translatedText,
                detectedSourceLang:
                    translation.detectedLanguageCode || sourceLang || 'unknown',
            };
        } catch (err) {
            this.logger.error('Google Translate API error', err);
            throw new HttpException(
                'Translation service unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    // ============================================================
    // GOOGLE TRANSLATE — Batch (single API call, multiple texts)
    // ============================================================
    private async callGoogleTranslateBatch(
        texts: string[],
        targetLang: string,
    ): Promise<{ translatedText: string; detectedSourceLang: string }[]> {
        try {
            const parent = `projects/${this.projectId}/locations/${this.location}`;

            const [response] = await this.translateClient.translateText({
                parent,
                contents: texts,
                mimeType: 'text/plain',
                targetLanguageCode: targetLang,
            });

            return (response.translations || []).map((t) => ({
                translatedText: t.translatedText || '',
                detectedSourceLang: t.detectedLanguageCode || 'unknown',
            }));
        } catch (err) {
            this.logger.error('Google Translate batch API error', err);
            throw new HttpException(
                'Translation service unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    // ============================================================
    // RATE LIMITING (in-memory, per user)
    // ============================================================
    private checkRateLimit(userId: string): void {
        const now = Date.now();
        const entry = this.rateLimits.get(userId);

        if (entry && now < entry.resetAt && entry.count >= this.rateLimit) {
            throw new HttpException(
                `Translation rate limit exceeded. Max ${this.rateLimit} translations per hour.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    private incrementRateLimit(userId: string): void {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const entry = this.rateLimits.get(userId);

        if (!entry || now >= entry.resetAt) {
            this.rateLimits.set(userId, { count: 1, resetAt: now + oneHour });
        } else {
            entry.count++;
        }
    }

    // ============================================================
    // HELPERS
    // ============================================================
    private hashText(text: string): string {
        return crypto.createHash('sha256').update(text).digest('hex');
    }
}
