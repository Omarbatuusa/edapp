import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('v1/discovery')
export class DiscoveryController {
    constructor(private readonly discoveryService: DiscoveryService) { }

    @Post('validate')
    async validateSchoolCode(
        @Body('code') code: string,
        @Headers('x-forwarded-for') ip: string,
    ) {
        if (!code) {
            throw new HttpException('School code is required', HttpStatus.BAD_REQUEST);
        }

        // Normalize code
        const normalizedCode = code.trim().toUpperCase();

        // Find tenant by code
        const result = await this.discoveryService.findByCode(normalizedCode);

        if (!result) {
            throw new HttpException('School not found', HttpStatus.NOT_FOUND);
        }

        // Return tenant info (without sensitive data)
        return {
            slug: result.tenant_slug,
            name: result.school_name,
            campus: result.main_branch?.name || '',
            logo: result.main_branch?.logo_url || null,
        };
    }
}
