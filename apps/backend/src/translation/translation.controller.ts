import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as express from 'express';
import {
    TranslationService,
    TranslateRequestDto,
    BatchTranslateRequestDto,
} from './translation.service';
import { UserLanguagePreference } from './user-language-preference.entity';

@Controller('i18n')
export class TranslationController {
    constructor(
        private readonly translationService: TranslationService,
        @InjectRepository(UserLanguagePreference)
        private readonly prefRepo: Repository<UserLanguagePreference>,
    ) { }

    // ============================================================
    // POST /v1/i18n/translate — Single text translation
    // ============================================================
    @Post('translate')
    async translate(
        @Body() body: TranslateRequestDto,
        @Req() req: express.Request,
    ) {
        const tenantId = (req as any).tenant_id || body.tenantId;
        if (!tenantId) {
            throw new HttpException('Tenant context required', HttpStatus.BAD_REQUEST);
        }
        if (!body.text || !body.targetLang) {
            throw new HttpException(
                'text and targetLang are required',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Extract user ID from request (set by auth middleware)
        const userId = (req as any).user?.uid || (req as any).userId;

        return this.translationService.translate(
            {
                ...body,
                tenantId,
                sourceLang: body.sourceLang || 'auto',
            },
            userId,
        );
    }

    // ============================================================
    // POST /v1/i18n/translate/batch — Batch translation
    // ============================================================
    @Post('translate/batch')
    async translateBatch(
        @Body() body: BatchTranslateRequestDto,
        @Req() req: express.Request,
    ) {
        const tenantId = (req as any).tenant_id || body.tenantId;
        if (!tenantId) {
            throw new HttpException('Tenant context required', HttpStatus.BAD_REQUEST);
        }
        if (!body.items?.length || !body.targetLang) {
            throw new HttpException(
                'items array and targetLang are required',
                HttpStatus.BAD_REQUEST,
            );
        }
        if (body.items.length > 100) {
            throw new HttpException(
                'Maximum 100 items per batch',
                HttpStatus.BAD_REQUEST,
            );
        }

        const userId = (req as any).user?.uid || (req as any).userId;

        return this.translationService.translateBatch(
            { ...body, tenantId },
            userId,
        );
    }

    // ============================================================
    // GET /v1/i18n/languages — Supported languages
    // ============================================================
    @Get('languages')
    getLanguages() {
        return {
            languages: this.translationService.getSupportedLanguages(),
        };
    }

    // ============================================================
    // GET /v1/i18n/preferences — Get user language preferences
    // ============================================================
    @Get('preferences')
    async getPreferences(@Req() req: express.Request) {
        const tenantId = (req as any).tenant_id;
        const userId = (req as any).user?.uid;
        if (!tenantId || !userId) {
            throw new HttpException('Auth context required', HttpStatus.UNAUTHORIZED);
        }

        const pref = await this.prefRepo.findOne({
            where: { tenant_id: tenantId, user_id: userId },
        });

        return pref || { preferred_language: 'en', auto_translate: false };
    }

    // ============================================================
    // POST /v1/i18n/preferences — Save user language preferences
    // ============================================================
    @Post('preferences')
    async savePreferences(
        @Body() body: { preferred_language: string; auto_translate?: boolean },
        @Req() req: express.Request,
    ) {
        const tenantId = (req as any).tenant_id;
        const userId = (req as any).user?.uid;
        if (!tenantId || !userId) {
            throw new HttpException('Auth context required', HttpStatus.UNAUTHORIZED);
        }

        let pref = await this.prefRepo.findOne({
            where: { tenant_id: tenantId, user_id: userId },
        });

        if (pref) {
            pref.preferred_language = body.preferred_language;
            if (body.auto_translate !== undefined) {
                pref.auto_translate = body.auto_translate;
            }
        } else {
            pref = this.prefRepo.create({
                tenant_id: tenantId,
                user_id: userId,
                preferred_language: body.preferred_language,
                auto_translate: body.auto_translate || false,
            });
        }

        return this.prefRepo.save(pref);
    }
}
