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
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Res,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';
import { SvgSanitizerService } from './svg-sanitizer.service';
import { ImageProcessingService } from './image-processing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileObject, FileVisibility, FileCategory } from './file-object.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

interface UploadRequestDto {
    category: string;
    filename: string;
    contentType?: string;
}

interface SignedUrlResponseDto {
    uploadUrl: string;
    objectKey: string;
}

const ALLOWED_UPLOAD_ROLES = [
    'platform_super_admin',
    'app_super_admin',
    'brand_admin',
    'platform_secretary',
    'app_secretary',
    'platform_support',
    'tenant_admin',
    'main_branch_admin',
    'branch_admin',
    'finance_officer',
    'admissions_officer',
];

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
        maxSizeMB: 2,
    },
    covers: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
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

interface ConfirmUploadDto {
    objectKey: string;
    contentType: string;
    originalName?: string;
    sizeBytes?: number;
    category?: string;
    entityType?: string;
    entityId?: string;
}

@Controller('storage')
export class StorageController {
    private readonly logger = new Logger(StorageController.name);

    constructor(
        private readonly storageService: StorageService,
        private readonly svgSanitizer: SvgSanitizerService,
        private readonly imageProcessor: ImageProcessingService,
        @InjectRepository(FileObject) private readonly fileRepo: Repository<FileObject>,
    ) { }

    /**
     * Resolve storage scope from request.
     * 1. req.tenant (set by TenantsMiddleware from hostname)
     * 2. Allowed role check → use 'platform' prefix or tenant ID from JWT/header
     * 3. Any authenticated user → 'general' prefix as last resort
     */
    private resolveStorageScope(req: any): { slug: string; tenantId: string | null } {
        // 1. Tenant from middleware (hostname-based) — most reliable
        if (req.tenant?.slug) {
            return { slug: req.tenant.slug, tenantId: req.tenant_id || req.tenant.id };
        }
        // 2. Check if user has an allowed role
        const role = req.user?.role || req.user?.customClaims?.role || '';
        const hasAllowedRole = ALLOWED_UPLOAD_ROLES.some(r => role.includes(r));
        if (hasAllowedRole) {
            // Use tenant ID from JWT or header for tracking, 'platform' as GCS prefix
            const tenantId = req.user?.tenant || req.headers?.['x-tenant-id'] || null;
            return { slug: 'platform', tenantId: tenantId && tenantId.length > 10 ? tenantId : null };
        }
        // 3. Any authenticated user — general uploads
        if (req.user?.uid) {
            return { slug: 'general', tenantId: null };
        }
        throw new BadRequestException('Please log in to upload files.');
    }

    /**
     * Check if user has platform-level access (can read any object).
     */
    private hasPlatformAccess(req: any): boolean {
        const role = req.user?.role || req.user?.customClaims?.role || '';
        return ALLOWED_UPLOAD_ROLES.some(r => role.includes(r));
    }

    /**
     * Generate a signed URL for uploading a file.
     * Supports both tenant-scoped and platform-scoped uploads.
     */
    @UseGuards(FirebaseAuthGuard)
    @Post('upload-url')
    @HttpCode(HttpStatus.OK)
    async getUploadUrl(
        @Body() body: UploadRequestDto,
        @Req() req: any,
    ): Promise<SignedUrlResponseDto> {
        const { slug } = this.resolveStorageScope(req);

        if (!body.category || !body.filename) {
            throw new BadRequestException('Category and filename are required');
        }

        // Validate category (whitelist approach)
        const validCategories = [
            'documents',
            'avatars',
            'logos',
            'covers',
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

        if (!this.storageService.isConfigured()) {
            throw new BadRequestException(
                'File storage is not configured. Please contact your administrator to set up GCS_PROJECT_ID and GCS_BUCKET.',
            );
        }

        try {
            return await this.storageService.generateSignedUploadUrl(
                slug,
                body.category,
                body.filename,
                contentType,
            );
        } catch (err: any) {
            this.logger.error(`Upload URL generation failed: ${err.message}`, err.stack);
            throw new BadRequestException(
                `Upload service error: ${err.message || 'Could not generate upload URL'}. Please try again.`,
            );
        }
    }

    /**
     * Generate a signed URL for reading/downloading a file.
     * Tenant users can only read their own objects; platform admins can read any.
     */
    @UseGuards(FirebaseAuthGuard)
    @Get('read-url')
    async getReadUrl(
        @Query('key') objectKey: string,
        @Req() req: any,
    ): Promise<{ readUrl: string }> {
        if (!objectKey) {
            throw new BadRequestException('Object key is required');
        }

        try {
            // Any authenticated user with an allowed role can read any object
            if (this.hasPlatformAccess(req)) {
                const readUrl = await this.storageService.generateSignedReadUrl(objectKey);
                return { readUrl };
            }

            // Tenant users can only read their own objects
            const tenantSlug = req.tenant?.slug;
            if (tenantSlug) {
                const expectedPrefix = `uploads/${tenantSlug}/`;
                if (!objectKey.startsWith(expectedPrefix)) {
                    throw new BadRequestException('Access denied: object belongs to another tenant');
                }
            }
            // If no tenant slug but user is authenticated, allow read (platform/general prefixes)
            const readUrl = await this.storageService.generateSignedReadUrl(objectKey);
            return { readUrl };
        } catch (err: any) {
            if (err instanceof BadRequestException) throw err;
            throw new BadRequestException(
                `Could not generate read URL: ${err.message || 'Storage service error'}`,
            );
        }
    }

    /**
     * Confirm an upload after the file has been PUT to GCS via signed URL.
     * For SVGs: downloads, sanitizes, re-uploads the sanitized version.
     * Creates a file_objects record for tracking.
     */
    @UseGuards(FirebaseAuthGuard)
    @Post('confirm-upload')
    @HttpCode(HttpStatus.OK)
    async confirmUpload(
        @Body() body: ConfirmUploadDto,
        @Req() req: any,
    ) {
        const { slug, tenantId } = this.resolveStorageScope(req);

        if (!body.objectKey || !body.contentType) {
            throw new BadRequestException('objectKey and contentType are required');
        }

        // Validate the object belongs to the resolved scope
        const expectedPrefix = `uploads/${slug}/`;
        if (!body.objectKey.startsWith(expectedPrefix)) {
            // Platform admins can also confirm objects under any tenant
            if (!this.hasPlatformAccess(req)) {
                throw new BadRequestException('Access denied: object belongs to another tenant');
            }
        }

        // SVG sanitization
        if (this.svgSanitizer.isSvg(body.contentType)) {
            try {
                const rawBuffer = await this.storageService.downloadObject(body.objectKey);
                const sanitized = this.svgSanitizer.sanitize(rawBuffer);
                await this.storageService.uploadBuffer(body.objectKey, sanitized, body.contentType);
            } catch (err) {
                throw new BadRequestException('SVG sanitization failed — file may be invalid or contain unsafe content');
            }
        }

        // Image processing — resize, convert to WebP, generate thumbnails
        if (!this.svgSanitizer.isSvg(body.contentType) && this.imageProcessor.isProcessable(body.contentType)) {
            try {
                const rawBuffer = await this.storageService.downloadObject(body.objectKey);
                const category = body.category || '';

                if (category === 'logos') {
                    const processed = await this.imageProcessor.processLogo(rawBuffer);
                    await this.storageService.uploadBuffer(body.objectKey, processed.buffer, processed.contentType);
                    body.contentType = processed.contentType;

                    // Generate 96x96 thumbnail for list views
                    const thumbKey = body.objectKey.replace(/(\.[^.]+)$/, '_thumb.webp');
                    const thumb = await this.imageProcessor.generateThumbnail(rawBuffer, 96);
                    await this.storageService.uploadBuffer(thumbKey, thumb.buffer, thumb.contentType);
                } else if (category === 'covers') {
                    const processed = await this.imageProcessor.processCover(rawBuffer);
                    await this.storageService.uploadBuffer(body.objectKey, processed.buffer, processed.contentType);
                    body.contentType = processed.contentType;
                }
            } catch (err: any) {
                this.logger.warn(`Image processing failed for ${body.objectKey}: ${err.message}`);
                // Non-fatal — keep original image if processing fails
            }
        }

        // Map category string to enum
        const categoryMap: Record<string, FileCategory> = {
            logos: FileCategory.LOGO,
            covers: FileCategory.COVER,
            avatars: FileCategory.AVATAR,
            documents: FileCategory.GENERAL_DOCUMENT,
            reports: FileCategory.REPORT_EXPORT,
            attachments: FileCategory.MESSAGE_ATTACHMENT,
        };

        // Create file_objects record (tenant_id is null for platform-scoped uploads)
        const fileObj = this.fileRepo.create({
            tenant_id: tenantId,
            bucket_name: this.storageService.getBucketName(),
            object_key: body.objectKey,
            original_name: body.originalName || body.objectKey.split('/').pop(),
            mime_type: body.contentType,
            size_bytes: body.sizeBytes || 0,
            visibility: FileVisibility.SIGNED,
            category: categoryMap[body.category || ''] || FileCategory.GENERAL_DOCUMENT,
            entity_type: body.entityType || null,
            entity_id: body.entityId || null,
            uploaded_by_user_id: req.user?.uid || req.user?.dbUserId || null,
        } as any);

        const saved = await this.fileRepo.save(fileObj) as any;

        return {
            status: 'success',
            fileId: saved.id,
            objectKey: body.objectKey,
            sanitized: this.svgSanitizer.isSvg(body.contentType),
        };
    }

    /**
     * Direct proxy upload — bypasses signed-URL generation entirely.
     * Frontend sends the file as multipart/form-data; backend writes
     * the buffer to GCS using the VM's ADC credentials (no signing needed).
     */
    @UseGuards(FirebaseAuthGuard)
    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
    async proxyUpload(
        @UploadedFile() file: Express.Multer.File,
        @Body('category') category: string,
        @Req() req: any,
    ): Promise<{ objectKey: string; contentType: string }> {
        if (!file) throw new BadRequestException('No file provided');
        if (!category) throw new BadRequestException('Category is required');

        const validCategories = ['documents', 'avatars', 'logos', 'covers', 'reports', 'attachments'];
        if (!validCategories.includes(category)) {
            throw new BadRequestException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }

        const rules = CATEGORY_RULES[category];
        if (rules && !rules.mimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `File type "${file.mimetype}" is not allowed for category "${category}". Allowed: ${rules.mimeTypes.join(', ')}`,
            );
        }

        if (!this.storageService.isConfigured()) {
            throw new BadRequestException('File storage is not configured.');
        }

        const { slug } = this.resolveStorageScope(req);
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const ext = path.extname(file.originalname) || '';
        const objectKey = `uploads/${slug}/${category}/${year}/${month}/${uuidv4()}${ext}`;

        let buffer = file.buffer;
        if (this.svgSanitizer.isSvg(file.mimetype)) {
            try {
                buffer = this.svgSanitizer.sanitize(buffer);
            } catch {
                throw new BadRequestException('SVG sanitization failed — file may be invalid or contain unsafe content');
            }
        }

        try {
            await this.storageService.uploadBuffer(objectKey, buffer, file.mimetype);
        } catch (err: any) {
            this.logger.error(`Proxy upload failed: ${err.message}`, err.stack);
            throw new BadRequestException(`Upload failed: ${err.message}`);
        }

        this.logger.log(`Proxy upload succeeded: ${objectKey}`);
        return { objectKey, contentType: file.mimetype };
    }

    /**
     * Serve a GCS object directly (no signed URL).
     * Public — no auth guard — limited to logos/ and illustrations/ prefixes only.
     * Browser can use this URL directly in <img src>.
     */
    @Get('serve')
    async serveFile(
        @Query('key') objectKey: string,
        @Res() res: Response,
    ): Promise<void> {
        if (!objectKey || !objectKey.startsWith('uploads/')) {
            res.status(400).json({ message: 'Invalid object key' });
            return;
        }

        const pathParts = objectKey.split('/');
        const category = pathParts[2]; // uploads/<tenant>/<category>/...
        // Only publicly servable categories — covers and avatars added alongside logos/illustrations.
        // Attachments, documents, and reports must go through signed read URLs (private).
        if (!['logos', 'illustrations', 'covers', 'avatars'].includes(category)) {
            res.status(400).json({ message: 'Direct serving not allowed for this category' });
            return;
        }

        try {
            const buffer = await this.storageService.downloadObject(objectKey);
            const ext = path.extname(objectKey).toLowerCase();
            const mimeMap: Record<string, string> = {
                '.svg': 'image/svg+xml',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.webp': 'image/webp',
            };
            const contentType = mimeMap[ext] || 'application/octet-stream';
            res.set('Content-Type', contentType);
            res.set('Cache-Control', 'public, max-age=3600');
            res.send(buffer);
        } catch (err: any) {
            this.logger.error(`Serve failed for ${objectKey}: ${err.message}`);
            res.status(404).json({ message: 'File not found' });
        }
    }
}
