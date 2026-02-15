import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import {
    TranslationService,
    TranslateRequestDto,
    BatchTranslateRequestDto,
} from './translation.service';

@Controller('i18n')
export class TranslationController {
    constructor(private readonly translationService: TranslationService) { }

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
}
