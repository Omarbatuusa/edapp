import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Req,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { StorageService } from './storage.service';

interface UploadRequestDto {
    category: string;
    filename: string;
    contentType?: string;
}

interface SignedUrlResponseDto {
    uploadUrl: string;
    objectKey: string;
}

const CATEGORY_RULES: Record<string, { mimeTypes: string[]; maxSizeMB: number }> = {
    documents: {
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSizeMB: 10,
    },
    avatars: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeMB: 5,
    },
    logos: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        maxSizeMB: 5,
    },
    reports: {
        mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        maxSizeMB: 20,
    },
    attachments: {
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        maxSizeMB: 20,
    },
};

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    /**
     * Generate a signed URL for uploading a file
     * Requires tenant context from middleware
     */
    @Post('upload-url')
    @HttpCode(HttpStatus.OK)
    async getUploadUrl(
        @Body() body: UploadRequestDto,
        @Req() req: any,
    ): Promise<SignedUrlResponseDto> {
        const tenantSlug = req.tenant?.slug;
        if (!tenantSlug) {
            throw new BadRequestException('Tenant context required');
        }

        if (!body.category || !body.filename) {
            throw new BadRequestException('Category and filename are required');
        }

        // Validate category (whitelist approach)
        const validCategories = [
            'documents',
            'avatars',
            'logos',
            'reports',
            'attachments',
        ];
        if (!validCategories.includes(body.category)) {
            throw new BadRequestException(
                `Invalid category. Must be one of: ${validCategories.join(', ')}`,
            );
        }

        // Validate MIME type against category rules
        const contentType = body.contentType || 'application/octet-stream';
        const rules = CATEGORY_RULES[body.category];
        if (rules && !rules.mimeTypes.includes(contentType)) {
            throw new BadRequestException(
                `File type "${contentType}" is not allowed for category "${body.category}". Allowed types: ${rules.mimeTypes.join(', ')}`,
            );
        }

        return this.storageService.generateSignedUploadUrl(
            tenantSlug,
            body.category,
            body.filename,
            contentType,
        );
    }

    /**
     * Generate a signed URL for reading/downloading a file
     * Validates tenant ownership of the object
     */
    @Get('read-url')
    async getReadUrl(
        @Query('key') objectKey: string,
        @Req() req: any,
    ): Promise<{ readUrl: string }> {
        const tenantSlug = req.tenant?.slug;
        if (!tenantSlug) {
            throw new BadRequestException('Tenant context required');
        }

        if (!objectKey) {
            throw new BadRequestException('Object key is required');
        }

        // Validate tenant owns this object (key must contain tenant slug)
        const expectedPrefix = `uploads/${tenantSlug}/`;
        if (!objectKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Access denied: object belongs to another tenant');
        }

        const readUrl = await this.storageService.generateSignedReadUrl(objectKey);
        return { readUrl };
    }
}
