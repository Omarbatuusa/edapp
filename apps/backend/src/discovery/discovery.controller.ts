import { Controller, Post, Body, Get, Param, Req, BadRequestException, UseGuards } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { RateLimitGuard, RateLimit } from '../auth/rate-limit.guard';

@Controller('discovery')
export class DiscoveryController {
    constructor(private discoveryService: DiscoveryService) { }

    @Post('validate-code')
    @UseGuards(RateLimitGuard)
    @RateLimit(10, 60) // 10 attempts per hour
    async validateSchoolCode(
        @Body('code') code: string,
        @Req() req: any
    ) {
        if (!code || code.trim().length === 0) {
            throw new BadRequestException('School code is required');
        }

        const tenant = await this.discoveryService.findTenantByCode(code);

        if (!tenant) {
            throw new BadRequestException('School not found');
        }

        return {
            success: true,
            tenant: {
                slug: tenant.slug,
                name: tenant.name,
                logo: tenant.logo || null,
                campus: tenant.campus || null,
            }
        };
    }

    @Get('qr/:token')
    async validateQRToken(@Param('token') token: string) {
        // TODO: Implement QR token validation
        // Token should be signed, short-lived, optionally one-time use

        const tenant = await this.discoveryService.validateQRToken(token);

        if (!tenant) {
            throw new BadRequestException('Invalid or expired QR code');
        }

        return {
            success: true,
            tenant: {
                slug: tenant.slug,
                name: tenant.name,
                logo: tenant.logo || null,
                campus: tenant.campus || null,
            }
        };
    }

    @Post('generate-qr')
    async generateQRCode(@Body('tenantId') tenantId: string) {
        // Platform admin endpoint to generate QR codes for tenants
        const qrData = await this.discoveryService.generateQRToken(tenantId);

        return {
            success: true,
            token: qrData.token,
            url: `https://app.edapp.co.za/q/${qrData.token}`,
            expiresAt: qrData.expiresAt,
        };
    }
}
