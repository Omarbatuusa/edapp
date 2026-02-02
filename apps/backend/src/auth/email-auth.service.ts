import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomInt } from 'crypto';

interface OTPData {
    code: string;
    email: string;
    expiresAt: number;
    attempts: number;
}

interface MagicLinkData {
    email: string;
    tenantSlug: string;
    role: string;
    returnUrl: string;
    expiresAt: number;
    used: boolean;
}

@Injectable()
export class EmailAuthService {
    // In-memory storage for MVP (Production should use Redis)
    private readonly otpCodes = new Map<string, OTPData>();
    private readonly magicLinks = new Map<string, MagicLinkData>();

    private readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
    private readonly MAGIC_LINK_TTL_MS = 10 * 60 * 1000; // 10 minutes
    private readonly MAX_OTP_ATTEMPTS = 3;

    constructor(private configService: ConfigService) { }

    /**
     * Generate a 6-digit OTP code
     */
    private generateOTPCode(): string {
        return String(randomInt(100000, 999999));
    }

    /**
     * Generate a secure token for magic links
     */
    private generateMagicLinkToken(): string {
        return randomBytes(32).toString('hex');
    }

    /**
     * Create and send OTP code to email
     * Returns the OTP key for verification
     */
    async sendOTP(email: string): Promise<{ otpKey: string; expiresAt: number }> {
        const normalizedEmail = email.toLowerCase().trim();
        const code = this.generateOTPCode();
        const otpKey = randomBytes(16).toString('hex');
        const expiresAt = Date.now() + this.OTP_TTL_MS;

        this.otpCodes.set(otpKey, {
            code,
            email: normalizedEmail,
            expiresAt,
            attempts: 0,
        });

        // TODO: Send email via AWS SES / SMTP
        // For MVP, log the code (remove in production!)
        console.log(`[EMAIL OTP] Code for ${normalizedEmail}: ${code}`);

        // In production, use email service:
        // await this.emailService.sendOTP(normalizedEmail, code);

        return { otpKey, expiresAt };
    }

    /**
     * Verify OTP code
     */
    async verifyOTP(otpKey: string, code: string, email: string): Promise<boolean> {
        const data = this.otpCodes.get(otpKey);

        if (!data) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Check expiration
        if (Date.now() > data.expiresAt) {
            this.otpCodes.delete(otpKey);
            throw new BadRequestException('OTP expired');
        }

        // Check email matches
        if (data.email !== email.toLowerCase().trim()) {
            throw new UnauthorizedException('Email mismatch');
        }

        // Check attempts
        data.attempts++;
        if (data.attempts > this.MAX_OTP_ATTEMPTS) {
            this.otpCodes.delete(otpKey);
            throw new BadRequestException('Too many attempts. Request a new code.');
        }

        // Verify code
        if (data.code !== code) {
            throw new BadRequestException('Invalid code');
        }

        // Success - delete OTP (single use)
        this.otpCodes.delete(otpKey);
        return true;
    }

    /**
     * Create and send magic link
     */
    async sendMagicLink(
        email: string,
        tenantSlug: string,
        role: string,
        returnUrl: string,
    ): Promise<{ sent: boolean; expiresAt: number }> {
        const normalizedEmail = email.toLowerCase().trim();
        const token = this.generateMagicLinkToken();
        const expiresAt = Date.now() + this.MAGIC_LINK_TTL_MS;

        this.magicLinks.set(token, {
            email: normalizedEmail,
            tenantSlug,
            role,
            returnUrl,
            expiresAt,
            used: false,
        });

        // Build magic link URL
        const baseUrl = this.configService.get('AUTH_BROKER_URL', 'https://auth.edapp.co.za');
        const magicLinkUrl = `${baseUrl}/magic-link/verify?token=${token}`;

        // TODO: Send email via AWS SES / SMTP
        console.log(`[MAGIC LINK] Link for ${normalizedEmail}: ${magicLinkUrl}`);

        // In production, use email service:
        // await this.emailService.sendMagicLink(normalizedEmail, magicLinkUrl, tenantSlug);

        return { sent: true, expiresAt };
    }

    /**
     * Verify magic link token
     */
    async verifyMagicLink(token: string): Promise<{
        email: string;
        tenantSlug: string;
        role: string;
        returnUrl: string;
    }> {
        const data = this.magicLinks.get(token);

        if (!data) {
            throw new BadRequestException('Invalid or expired magic link');
        }

        // Check expiration
        if (Date.now() > data.expiresAt) {
            this.magicLinks.delete(token);
            throw new BadRequestException('Magic link expired');
        }

        // Check if already used
        if (data.used) {
            throw new BadRequestException('Magic link already used');
        }

        // Mark as used
        data.used = true;

        // Clean up after a short delay (allow for potential retries)
        setTimeout(() => this.magicLinks.delete(token), 5000);

        return {
            email: data.email,
            tenantSlug: data.tenantSlug,
            role: data.role,
            returnUrl: data.returnUrl,
        };
    }

    /**
     * Clean up expired tokens (call periodically via cron)
     */
    cleanupExpiredTokens(): void {
        const now = Date.now();

        for (const [key, data] of this.otpCodes) {
            if (now > data.expiresAt) {
                this.otpCodes.delete(key);
            }
        }

        for (const [key, data] of this.magicLinks) {
            if (now > data.expiresAt) {
                this.magicLinks.delete(key);
            }
        }
    }
}
