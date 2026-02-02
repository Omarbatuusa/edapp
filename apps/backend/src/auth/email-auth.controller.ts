import { Controller, Post, Get, Body, Query, Param, BadRequestException } from '@nestjs/common';
import { EmailAuthService } from './email-auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSettings } from '../tenants/tenant-settings.entity';
import { Tenant } from '../tenants/tenant.entity';

// DTOs
class SendOTPDto {
    email: string;
}

class VerifyOTPDto {
    otpKey: string;
    code: string;
    email: string;
}

class SendMagicLinkDto {
    email: string;
    tenantSlug: string;
    role: string;
    returnUrl: string;
}

@Controller('auth')
export class EmailAuthController {
    constructor(
        private readonly emailAuthService: EmailAuthService,
        @InjectRepository(TenantSettings)
        private readonly tenantSettingsRepository: Repository<TenantSettings>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) { }

    /**
     * Get auth methods enabled for a tenant
     */
    @Get('methods/:tenantSlug')
    async getAuthMethods(@Param('tenantSlug') tenantSlug: string) {
        const tenant = await this.tenantRepository.findOne({
            where: { tenant_slug: tenantSlug.toLowerCase() },
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        const settings = await this.tenantSettingsRepository.findOne({
            where: { tenant_id: tenant.id },
        });

        // Default auth methods if settings don't exist
        const defaultMethods = {
            google_enabled: true,
            email_password_enabled: true,
            email_magic_link_enabled: true,
            email_otp_enabled: false,
            mfa_enabled: false,
            mfa_required_roles: [],
        };

        return {
            tenant_slug: tenantSlug,
            auth_methods: settings?.auth_methods || defaultMethods,
        };
    }

    /**
     * Send OTP to email
     */
    @Post('otp/send')
    async sendOTP(@Body() dto: SendOTPDto) {
        if (!dto.email) {
            throw new BadRequestException('Email is required');
        }

        const result = await this.emailAuthService.sendOTP(dto.email);

        return {
            success: true,
            message: 'OTP sent to your email',
            otpKey: result.otpKey,
            expiresAt: result.expiresAt,
        };
    }

    /**
     * Verify OTP code
     */
    @Post('otp/verify')
    async verifyOTP(@Body() dto: VerifyOTPDto) {
        if (!dto.otpKey || !dto.code || !dto.email) {
            throw new BadRequestException('otpKey, code, and email are required');
        }

        const verified = await this.emailAuthService.verifyOTP(
            dto.otpKey,
            dto.code,
            dto.email,
        );

        return {
            success: verified,
            message: 'OTP verified successfully',
        };
    }

    /**
     * Send magic link to email
     */
    @Post('magic-link/send')
    async sendMagicLink(@Body() dto: SendMagicLinkDto) {
        if (!dto.email || !dto.tenantSlug || !dto.role) {
            throw new BadRequestException('email, tenantSlug, and role are required');
        }

        // Validate return URL pattern
        const allowedPatterns = [
            /^https:\/\/[a-z0-9-]+\.edapp\.co\.za\/auth\/finish$/,
            /^https:\/\/apply-[a-z0-9-]+\.edapp\.co\.za\/auth\/finish$/,
            /^https:\/\/admin\.edapp\.co\.za\/auth\/finish$/,
            /^http:\/\/[a-z0-9-]+\.localhost:\d+\/auth\/finish$/,
        ];

        const returnUrl = dto.returnUrl || `https://${dto.tenantSlug}.edapp.co.za/auth/finish`;

        if (!allowedPatterns.some(p => p.test(returnUrl))) {
            throw new BadRequestException('Invalid return URL');
        }

        const result = await this.emailAuthService.sendMagicLink(
            dto.email,
            dto.tenantSlug,
            dto.role,
            returnUrl,
        );

        return {
            success: result.sent,
            message: 'Magic link sent to your email',
            expiresAt: result.expiresAt,
        };
    }

    /**
     * Verify magic link token
     */
    @Get('magic-link/verify')
    async verifyMagicLink(@Query('token') token: string) {
        if (!token) {
            throw new BadRequestException('Token is required');
        }

        const result = await this.emailAuthService.verifyMagicLink(token);

        return {
            success: true,
            email: result.email,
            tenantSlug: result.tenantSlug,
            role: result.role,
            returnUrl: result.returnUrl,
        };
    }
}
