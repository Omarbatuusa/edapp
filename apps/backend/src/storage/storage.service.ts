import { Injectable, Logger } from '@nestjs/common';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private storage: Storage;
    private bucket: string;

    constructor(private configService: ConfigService) {
        // Uses VM attached service account automatically (ADC)
        // No JSON key file needed - GCP org policy blocks key creation
        this.storage = new Storage({
            projectId: this.configService.get('GCS_PROJECT_ID'),
        });
        this.bucket = this.configService.get('GCS_BUCKET') || 'edapp-uploads';
        this.logger.log(`GCS Storage initialized for bucket: ${this.bucket}`);
    }

    /**
     * Generate a signed URL for uploading a file
     * Object key format: uploads/<tenant>/<category>/<yyyy>/<mm>/<uuid>.<ext>
     */
    async generateSignedUploadUrl(
        tenantSlug: string,
        category: string,
        filename: string,
        contentType: string = 'application/octet-stream',
    ): Promise<{ uploadUrl: string; objectKey: string }> {
        // Sanitize tenant slug
        const sanitizedTenant = this.sanitizeSlug(tenantSlug);
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const ext = path.extname(filename) || '';
        const uuid = uuidv4();

        const objectKey = `uploads/${sanitizedTenant}/${category}/${year}/${month}/${uuid}${ext}`;

        const options: GetSignedUrlConfig = {
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType,
        };

        try {
            const [url] = await this.storage
                .bucket(this.bucket)
                .file(objectKey)
                .getSignedUrl(options);

            this.logger.debug(`Generated upload URL for: ${objectKey}`);
            return { uploadUrl: url, objectKey };
        } catch (error) {
            this.logger.error(`Failed to generate upload URL: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate a signed URL for reading/downloading a file
     */
    async generateSignedReadUrl(
        objectKey: string,
        expiresInMinutes: number = 15,
    ): Promise<string> {
        // Validate object key starts with uploads/
        if (!objectKey.startsWith('uploads/')) {
            throw new Error('Invalid object key: must start with uploads/');
        }

        const options: GetSignedUrlConfig = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + expiresInMinutes * 60 * 1000,
        };

        try {
            const [url] = await this.storage
                .bucket(this.bucket)
                .file(objectKey)
                .getSignedUrl(options);

            this.logger.debug(`Generated read URL for: ${objectKey}`);
            return url;
        } catch (error) {
            this.logger.error(`Failed to generate read URL: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete an object from storage
     */
    async deleteObject(objectKey: string): Promise<void> {
        if (!objectKey.startsWith('uploads/')) {
            throw new Error('Invalid object key: must start with uploads/');
        }

        try {
            await this.storage.bucket(this.bucket).file(objectKey).delete();
            this.logger.debug(`Deleted object: ${objectKey}`);
        } catch (error) {
            this.logger.error(`Failed to delete object: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check if an object exists
     */
    async objectExists(objectKey: string): Promise<boolean> {
        try {
            const [exists] = await this.storage
                .bucket(this.bucket)
                .file(objectKey)
                .exists();
            return exists;
        } catch (error) {
            this.logger.error(`Failed to check object existence: ${error.message}`);
            return false;
        }
    }

    /**
     * Sanitize tenant slug to prevent directory traversal
     */
    private sanitizeSlug(slug: string): string {
        return slug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 50);
    }
}
