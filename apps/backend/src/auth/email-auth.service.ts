import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomInt } from 'crypto';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

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
    private sesClient: SESClient | null = null;
    private fromEmail: string;

    private readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
    private readonly MAGIC_LINK_TTL_MS = 10 * 60 * 1000; // 10 minutes
    private readonly MAX_OTP_ATTEMPTS = 3;

    constructor(private configService: ConfigService) {
        const sesAccessKey = this.configService.get('SES_ACCESS_KEY', '');
        const sesSecretKey = this.configService.get('SES_SECRET_KEY', '');
        const sesRegion = this.configService.get('SES_REGION', 'eu-west-1');
        this.fromEmail = this.configService.get('SES_FROM_EMAIL', 'no-reply@edapp.co.za');

        if (sesAccessKey && sesSecretKey) {
            this.sesClient = new SESClient({
                region: sesRegion,
                credentials: {
                    accessKeyId: sesAccessKey,
                    secretAccessKey: sesSecretKey,
                },
            });
            console.log(`[EMAIL] AWS SES SDK configured (region: ${sesRegion}, from: ${this.fromEmail})`);
        } else {
            console.warn('[EMAIL] No SES credentials configured — OTP emails will be logged to console only');
        }
    }

    private generateOTPCode(): string {
        return String(randomInt(100000, 999999));
    }

    private generateMagicLinkToken(): string {
        return randomBytes(32).toString('hex');
    }

    /**
     * Send an email via AWS SES SDK
     */
    private async sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
        if (!this.sesClient) {
            console.warn(`[EMAIL] No SES client — cannot send to ${to}`);
            return false;
        }

        const command = new SendEmailCommand({
            Source: `EdApp <${this.fromEmail}>`,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: { Data: subject, Charset: 'UTF-8' },
                Body: {
                    Html: { Data: htmlBody, Charset: 'UTF-8' },
                },
            },
        });

        try {
            const result = await this.sesClient.send(command);
            console.log(`[EMAIL] Sent to ${to} (MessageId: ${result.MessageId})`);
            return true;
        } catch (err: any) {
            console.error(`[EMAIL] SES send failed to ${to}:`, err.message || err);
            return false;
        }
    }

    /**
     * Create and send OTP code to email
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

        const htmlBody = `
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
        `;

        const sent = await this.sendEmail(
            normalizedEmail,
            'EdApp - Your Verification Code',
            htmlBody,
        );

        if (!sent) {
            console.log(`[EMAIL OTP] Fallback — Code for ${normalizedEmail}: ${code}`);
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

        if (Date.now() > data.expiresAt) {
            this.otpCodes.delete(otpKey);
            throw new BadRequestException('OTP expired');
        }

        if (data.email !== email.toLowerCase().trim()) {
            throw new UnauthorizedException('Email mismatch');
        }

        data.attempts++;
        if (data.attempts > this.MAX_OTP_ATTEMPTS) {
            this.otpCodes.delete(otpKey);
            throw new BadRequestException('Too many attempts. Request a new code.');
        }

        if (data.code !== code) {
            throw new BadRequestException('Invalid code');
        }

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

        const baseUrl = this.configService.get('AUTH_BROKER_URL', 'https://auth.edapp.co.za');
        const magicLinkUrl = `${baseUrl}/magic-link/verify?token=${token}`;

        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">EdApp</h1>
                    <p style="font-size: 14px; color: #666; margin-top: 4px;">Sign In Link</p>
                </div>
                <div style="background: #f8f9fa; border-radius: 16px; padding: 32px; text-align: center;">
                    <p style="font-size: 14px; color: #555; margin: 0 0 20px;">Click the button below to sign in:</p>
                    <a href="${magicLinkUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Sign In to EdApp
                    </a>
                    <p style="font-size: 13px; color: #888; margin: 20px 0 0;">This link expires in 10 minutes.</p>
                </div>
                <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
                    If you didn't request this link, you can safely ignore this email.
                </p>
            </div>
        `;

        const sent = await this.sendEmail(
            normalizedEmail,
            'EdApp - Your Sign In Link',
            htmlBody,
        );

        if (!sent) {
            console.log(`[MAGIC LINK] Fallback — Link for ${normalizedEmail}: ${magicLinkUrl}`);
        }

        return { sent, expiresAt };
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

        if (Date.now() > data.expiresAt) {
            this.magicLinks.delete(token);
            throw new BadRequestException('Magic link expired');
        }

        if (data.used) {
            throw new BadRequestException('Magic link already used');
        }

        data.used = true;
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
