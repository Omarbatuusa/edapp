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
        const tenant = await this.discoveryService.findByCode(normalizedCode);

        if (!tenant) {
            throw new HttpException('School not found', HttpStatus.NOT_FOUND);
        }

        // Return tenant info (without sensitive data)
        return {
            slug: tenant.slug,
            name: tenant.name,
            campus: tenant.campus,
            logo: tenant.logo_url,
        };
    }
}
