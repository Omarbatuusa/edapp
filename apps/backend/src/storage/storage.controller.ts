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
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { SvgSanitizerService } from './svg-sanitizer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileObject, FileVisibility, FileCategory } from './file-object.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Tenant } from '../tenants/tenant.entity';

interface UploadRequestDto {
    category: string;
    filename: string;
    contentType?: string;
}

interface SignedUrlResponseDto {
    uploadUrl: string;
    objectKey: string;
}

const PLATFORM_ROLES = [
    'platform_super_admin',
    'app_super_admin',
    'brand_admin',
    'platform_secretary',
    'app_secretary',
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
        maxSizeMB: 5,
    },
    covers: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeMB: 10,
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
@UseGuards(FirebaseAuthGuard)
export class StorageController {
    constructor(
        private readonly storageService: StorageService,
        private readonly svgSanitizer: SvgSanitizerService,
        @InjectRepository(FileObject) private readonly fileRepo: Repository<FileObject>,
        @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    ) { }

    /**
     * Resolve storage scope from request.
     * 1. req.tenant (set by TenantsMiddleware from hostname)
     * 2. Platform admin roles → 'platform' prefix
     * 3. x-tenant-id header → look up tenant slug from DB
     * 4. Session JWT tenant claim → use as tenant ID
     */
    private async resolveStorageScope(req: any): Promise<{ slug: string; tenantId: string | null }> {
        // 1. Tenant from middleware (hostname-based)
        if (req.tenant?.slug) {
            return { slug: req.tenant.slug, tenantId: req.tenant_id || req.tenant.id };
        }
        // 2. Platform admin roles
        const role = req.user?.role || req.user?.customClaims?.role || '';
        if (PLATFORM_ROLES.some(r => role.includes(r))) {
            return { slug: 'platform', tenantId: null };
        }
        // 3. x-tenant-id header (sent by frontend when on platform admin domain)
        const headerTenantId = req.headers?.['x-tenant-id'];
        if (headerTenantId) {
            const tenant = await this.tenantRepo.findOne({ where: { id: headerTenantId } });
            if (tenant) {
                return { slug: tenant.tenant_slug, tenantId: tenant.id };
            }
        }
        // 4. Tenant ID from session JWT
        const jwtTenantId = req.user?.tenant;
        if (jwtTenantId) {
            const tenant = await this.tenantRepo.findOne({ where: { id: jwtTenantId } });
            if (tenant) {
                return { slug: tenant.tenant_slug, tenantId: tenant.id };
            }
        }
        throw new BadRequestException('Unable to determine storage scope. Please ensure you are logged in with a valid tenant context.');
    }

    /**
     * Check if user has platform-level access (can read any object).
     */
    private hasPlatformAccess(req: any): boolean {
        const role = req.user?.role || req.user?.customClaims?.role || '';
        return PLATFORM_ROLES.some(r => role.includes(r));
    }

    /**
     * Generate a signed URL for uploading a file.
     * Supports both tenant-scoped and platform-scoped uploads.
     */
    @Post('upload-url')
    @HttpCode(HttpStatus.OK)
    async getUploadUrl(
        @Body() body: UploadRequestDto,
        @Req() req: any,
    ): Promise<SignedUrlResponseDto> {
        const { slug } = await this.resolveStorageScope(req);

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

        return this.storageService.generateSignedUploadUrl(
            slug,
            body.category,
            body.filename,
            contentType,
        );
    }

    /**
     * Generate a signed URL for reading/downloading a file.
     * Tenant users can only read their own objects; platform admins can read any.
     */
    @Get('read-url')
    async getReadUrl(
        @Query('key') objectKey: string,
        @Req() req: any,
    ): Promise<{ readUrl: string }> {
        if (!objectKey) {
            throw new BadRequestException('Object key is required');
        }

        // Platform admins can read any object (platform-scoped or any tenant)
        if (this.hasPlatformAccess(req)) {
            const readUrl = await this.storageService.generateSignedReadUrl(objectKey);
            return { readUrl };
        }

        // Tenant users can only read their own objects
        const tenantSlug = req.tenant?.slug;
        if (!tenantSlug) {
            throw new BadRequestException('Tenant context required');
        }
        const expectedPrefix = `uploads/${tenantSlug}/`;
        if (!objectKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Access denied: object belongs to another tenant');
        }

        const readUrl = await this.storageService.generateSignedReadUrl(objectKey);
        return { readUrl };
    }

    /**
     * Confirm an upload after the file has been PUT to GCS via signed URL.
     * For SVGs: downloads, sanitizes, re-uploads the sanitized version.
     * Creates a file_objects record for tracking.
     */
    @Post('confirm-upload')
    @HttpCode(HttpStatus.OK)
    async confirmUpload(
        @Body() body: ConfirmUploadDto,
        @Req() req: any,
    ) {
        const { slug, tenantId } = await this.resolveStorageScope(req);

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
}
