import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// GIF CONTROLLER - Server-side Tenor API proxy
// Keeps API key secure on the server
// ============================================================

interface TenorGif {
    id: string;
    url: string;
    preview: string;
    width: number;
    height: number;
}

@Controller('api/v1/gifs')
@UseGuards(FirebaseAuthGuard)
export class GifController {
    private readonly logger = new Logger(GifController.name);
    private readonly apiKey: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('TENOR_API_KEY', '');
        if (!this.apiKey) {
            this.logger.warn('TENOR_API_KEY not configured — GIF search will return empty results');
        }
    }

    @Get('search')
    async search(
        @Query('q') query: string,
        @Query('limit') limit: string = '20',
    ): Promise<TenorGif[]> {
        if (!this.apiKey || !query) return [];

        try {
            const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${this.apiKey}&limit=${parseInt(limit, 10)}&media_filter=gif,tinygif&contentfilter=medium`;
            const response = await fetch(url);
            const data = await response.json();
            return this.mapResults(data.results || []);
        } catch (error) {
            this.logger.error('Tenor search error:', error);
            return [];
        }
    }

    @Get('trending')
    async trending(
        @Query('limit') limit: string = '20',
    ): Promise<TenorGif[]> {
        if (!this.apiKey) return [];

        try {
            const url = `https://tenor.googleapis.com/v2/featured?key=${this.apiKey}&limit=${parseInt(limit, 10)}&media_filter=gif,tinygif&contentfilter=medium`;
            const response = await fetch(url);
            const data = await response.json();
            return this.mapResults(data.results || []);
        } catch (error) {
            this.logger.error('Tenor trending error:', error);
            return [];
        }
    }

    private mapResults(results: any[]): TenorGif[] {
        return results.map((r: any) => {
            const gif = r.media_formats?.gif || {};
            const tiny = r.media_formats?.tinygif || {};
            return {
                id: r.id,
                url: gif.url || tiny.url || '',
                preview: tiny.url || gif.url || '',
                width: gif.dims?.[0] || 200,
                height: gif.dims?.[1] || 150,
            };
        });
    }
}
