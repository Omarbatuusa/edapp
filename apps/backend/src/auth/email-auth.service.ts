import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomInt } from 'crypto';
import * as nodemailer from 'nodemailer';

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
    private transporter: nodemailer.Transporter | null = null;

    private readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
    private readonly MAGIC_LINK_TTL_MS = 10 * 60 * 1000; // 10 minutes
    private readonly MAX_OTP_ATTEMPTS = 3;

    constructor(private configService: ConfigService) {
        // Initialize SMTP transporter
        const smtpHost = this.configService.get('SMTP_HOST', 'smtp.gmail.com');
        const smtpPort = parseInt(this.configService.get('SMTP_PORT', '587'), 10);
        const smtpUser = this.configService.get('SMTP_USER', '');
        const smtpPass = this.configService.get('SMTP_PASS', '');

        if (smtpUser) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass },
            });
        }
    }

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

        // Send email
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: this.configService.get('SMTP_FROM', 'EdApp <noreply@edapp.co.za>'),
                    to: normalizedEmail,
                    subject: 'EdApp - Your Verification Code',
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">EdApp</h1>
                                <p style="font-size: 14px; color: #666; margin-top: 4px;">Email Verification</p>
                            </div>
                            <div style="background: #f8f9fa; border-radius: 16px; padding: 32px; text-align: center;">
                                <p style="font-size: 14px; color: #555; margin: 0 0 16px;">Your verification code is:</p>
                                <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1a1a1a; font-family: monospace; padding: 16px; background: white; border-radius: 12px; border: 2px solid #e5e7eb;">
                                    ${code}
                                </div>
                                <p style="font-size: 13px; color: #888; margin: 16px 0 0;">This code expires in 5 minutes.</p>
                            </div>
                            <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
                                If you didn't request this code, you can safely ignore this email.
                            </p>
                        </div>
                    `,
                });
                console.log(`[EMAIL OTP] Sent to ${normalizedEmail}`);
            } catch (err) {
                console.error('[EMAIL OTP] Send failed:', err);
                // Fall through - still return the otpKey so flow isn't blocked
            }
        } else {
            // No SMTP configured - log for development
            console.log(`[EMAIL OTP] Code for ${normalizedEmail}: ${code} (SMTP not configured)`);
        }

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
