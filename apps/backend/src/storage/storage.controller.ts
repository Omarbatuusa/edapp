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

        return this.storageService.generateSignedUploadUrl(
            tenantSlug,
            body.category,
            body.filename,
            body.contentType || 'application/octet-stream',
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
