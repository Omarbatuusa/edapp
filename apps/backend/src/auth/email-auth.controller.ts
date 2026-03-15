import { Controller, Post, Get, Body, Query, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EmailAuthService } from './email-auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as firebaseAdmin from 'firebase-admin';
import { TenantSettings } from '../tenants/tenant-settings.entity';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { PasswordHistory } from '../users/password-history.entity';
import { validatePassword } from './password-validator';

// DTOs
class SendOTPDto {
    @IsEmail()
    email: string;
}

class VerifyOTPDto {
    @IsString() @IsNotEmpty()
    otpKey: string;

    @IsString() @IsNotEmpty()
    code: string;

    @IsEmail()
    email: string;
}

class SendMagicLinkDto {
    @IsEmail()
    email: string;

    @IsString() @IsNotEmpty()
    tenantSlug: string;

    @IsString() @IsNotEmpty()
    role: string;

    @IsString() @IsOptional()
    returnUrl: string;
}

class PasswordResetRequestDto {
    @IsEmail()
    email: string;
}

class PasswordResetVerifyDto {
    @IsEmail()
    email: string;

    @IsString() @IsNotEmpty()
    otpKey: string;

    @IsString() @IsNotEmpty()
    code: string;

    @IsString() @IsNotEmpty()
    newPassword: string;
}

@Controller('auth')
export class EmailAuthController {
    constructor(
        private readonly emailAuthService: EmailAuthService,
        @InjectRepository(TenantSettings)
        private readonly tenantSettingsRepository: Repository<TenantSettings>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PasswordHistory)
        private readonly passwordHistoryRepo: Repository<PasswordHistory>,
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

    // ════════════════════════════════════════════
    // PASSWORD RESET FLOW
    // ════════════════════════════════════════════

    /**
     * POST /auth/password-reset/request — Send password reset OTP
     */
    @Post('password-reset/request')
    async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
        if (!dto.email) {
            throw new BadRequestException('Email is required');
        }

        const normalizedEmail = dto.email.toLowerCase().trim();

        // Check if user exists (don't reveal whether email is registered for security)
        const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });

        if (user) {
            // Send OTP via the password reset email template
            const result = await this.emailAuthService.sendPasswordResetOTP(normalizedEmail);
            return {
                success: true,
                message: 'If an account exists with this email, a reset code has been sent.',
                otpKey: result.otpKey,
                expiresAt: result.expiresAt,
            };
        }

        // User doesn't exist — return same message to prevent enumeration
        return {
            success: true,
            message: 'If an account exists with this email, a reset code has been sent.',
            otpKey: null,
            expiresAt: null,
        };
    }

    /**
     * POST /auth/password-reset/confirm — Verify OTP and set new password
     */
    @Post('password-reset/confirm')
    async confirmPasswordReset(@Body() dto: PasswordResetVerifyDto) {
        if (!dto.email || !dto.otpKey || !dto.code || !dto.newPassword) {
            throw new BadRequestException('email, otpKey, code, and newPassword are required');
        }

        const normalizedEmail = dto.email.toLowerCase().trim();

        // 1. Verify OTP
        await this.emailAuthService.verifyOTP(dto.otpKey, dto.code, normalizedEmail);

        // 2. Find user
        const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            throw new NotFoundException('No account found with this email');
        }

        // 3. Validate password strength
        const validation = validatePassword(dto.newPassword);
        if (!validation.valid) {
            throw new BadRequestException(validation.errors.join('. '));
        }

        // 4. Check password history — cannot reuse
        const previous = await this.passwordHistoryRepo.find({
            where: { user_id: user.id },
            order: { created_at: 'DESC' },
        });
        for (const prev of previous) {
            const isReused = await bcrypt.compare(dto.newPassword, prev.password_hash);
            if (isReused) {
                throw new BadRequestException('Please choose a different password. This one cannot be used.');
            }
        }
        if (user.password_hash) {
            const matchesCurrent = await bcrypt.compare(dto.newPassword, user.password_hash);
            if (matchesCurrent) {
                throw new BadRequestException('Please choose a different password. This one cannot be used.');
            }
        }

        // 5. Hash and update
        const hash = await bcrypt.hash(dto.newPassword, 10);

        // Record old password in history
        if (user.password_hash) {
            await this.passwordHistoryRepo.save({
                user_id: user.id,
                password_hash: user.password_hash,
                source: 'previous',
            } as Partial<PasswordHistory>);
        }

        await this.userRepository.update(user.id, {
            password_hash: hash,
            must_change_password: false,
        });

        // Record new password in history
        await this.passwordHistoryRepo.save({
            user_id: user.id,
            password_hash: hash,
            source: 'reset',
        } as Partial<PasswordHistory>);

        // 6. Sync to Firebase
        try {
            const fbUser = await firebaseAdmin.auth().getUserByEmail(normalizedEmail);
            await firebaseAdmin.auth().updateUser(fbUser.uid, {
                password: dto.newPassword,
                disabled: false,
            });
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                // Create Firebase account if it doesn't exist
                await firebaseAdmin.auth().createUser({
                    email: normalizedEmail,
                    password: dto.newPassword,
                    displayName: user.display_name || normalizedEmail,
                });
            }
            // Non-fatal for password reset — DB is already updated
        }

        return { success: true, message: 'Password reset successfully. You can now sign in.' };
    }
}
