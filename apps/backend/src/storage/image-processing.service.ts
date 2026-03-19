import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ProcessedImage {
    buffer: Buffer;
    contentType: string;
    width: number;
    height: number;
}

@Injectable()
export class ImageProcessingService {
    private readonly logger = new Logger(ImageProcessingService.name);

    /** Check if content type is a processable raster image (not SVG) */
    isProcessable(contentType: string): boolean {
        return ['image/jpeg', 'image/png', 'image/webp'].includes(contentType);
    }

    /**
     * Process a logo image:
     * - Resize to fit within 512x512 (no upscale)
     * - Convert to WebP quality 85
     */
    async processLogo(buffer: Buffer): Promise<ProcessedImage> {
        const result = await sharp(buffer)
            .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer({ resolveWithObject: true });
        this.logger.debug(`Logo processed: ${result.info.width}x${result.info.height}, ${result.data.length} bytes`);
        return {
            buffer: result.data,
            contentType: 'image/webp',
            width: result.info.width,
            height: result.info.height,
        };
    }

    /**
     * Process a cover image:
     * - Resize to fit within 1200x400 (no upscale)
     * - Convert to WebP quality 85
     */
    async processCover(buffer: Buffer): Promise<ProcessedImage> {
        const result = await sharp(buffer)
            .resize(1200, 400, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer({ resolveWithObject: true });
        this.logger.debug(`Cover processed: ${result.info.width}x${result.info.height}, ${result.data.length} bytes`);
        return {
            buffer: result.data,
            contentType: 'image/webp',
            width: result.info.width,
            height: result.info.height,
        };
    }

    /**
     * Generate a square thumbnail for list views.
     * Returns cover-cropped WebP at the given size (default 96x96).
     */
    async generateThumbnail(buffer: Buffer, size: number = 96): Promise<ProcessedImage> {
        const result = await sharp(buffer)
            .resize(size, size, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer({ resolveWithObject: true });
        this.logger.debug(`Thumbnail generated: ${size}x${size}, ${result.data.length} bytes`);
        return {
            buffer: result.data,
            contentType: 'image/webp',
            width: result.info.width,
            height: result.info.height,
        };
    }
}
