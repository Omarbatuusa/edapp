import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomInt, createHmac } from 'crypto';
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

/**
 * Derive an SES SMTP password from an IAM secret access key.
 * Algorithm: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
 */
function deriveSesSmtpPassword(secretAccessKey: string, region: string): string {
    const DATE = '11111111';
    const SERVICE = 'ses';
    const TERMINAL = 'aws4_request';
    const MESSAGE = 'SendRawEmail';
    const VERSION = Buffer.from([0x04]);

    function sign(key: Buffer, msg: string): Buffer {
        return createHmac('sha256', key).update(msg).digest();
    }

    let signature = sign(Buffer.from('AWS4' + secretAccessKey, 'utf8'), DATE);
    signature = sign(signature, region);
    signature = sign(signature, SERVICE);
    signature = sign(signature, TERMINAL);
    signature = sign(signature, MESSAGE);

    return Buffer.concat([VERSION, signature]).toString('base64');
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
        // Try SES credentials first (access key + secret key → derive SMTP password)
        const sesAccessKey = this.configService.get('SES_ACCESS_KEY', '');
        const sesSecretKey = this.configService.get('SES_SECRET_KEY', '');
        const sesRegion = this.configService.get('SES_REGION', 'af-south-1');

        if (sesAccessKey && sesSecretKey) {
            const smtpHost = this.configService.get('SMTP_HOST', `email-smtp.${sesRegion}.amazonaws.com`);
            const smtpPort = parseInt(this.configService.get('SMTP_PORT', '587'), 10);
            const smtpPassword = deriveSesSmtpPassword(sesSecretKey, sesRegion);

            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: sesAccessKey, pass: smtpPassword },
            });
            console.log(`[EMAIL] SES SMTP configured (${smtpHost}, region: ${sesRegion})`);
        } else {
            // Fallback: raw SMTP credentials
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
                console.log(`[EMAIL] SMTP configured (${smtpHost})`);
            } else {
                console.warn('[EMAIL] No SMTP/SES credentials configured — OTP emails will be logged to console only');
            }
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

        // Send email — try SMTP first, then Firebase generateEmailVerificationLink as fallback
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

        let emailSent = false;

        // Try SMTP first
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: `EdApp <${this.configService.get('SES_FROM_EMAIL', 'no-reply@edapp.co.za')}>`,
                    to: normalizedEmail,
                    subject: 'EdApp - Your Verification Code',
                    html: htmlBody,
                });
                emailSent = true;
                console.log(`[EMAIL OTP] Sent via SMTP to ${normalizedEmail}`);
            } catch (err) {
                console.error('[EMAIL OTP] SMTP send failed:', err);
            }
        }

        // Fallback: use Firebase custom email (via nodemailer with Gmail App Password or log)
        if (!emailSent) {
            // Try sending via Firebase Admin — generate a passwordless link as carrier
            // Since Firebase doesn't support custom OTP emails, we log for dev and rely on SMTP in prod
            console.log(`[EMAIL OTP] Code for ${normalizedEmail}: ${code} (configure SMTP_USER/SMTP_PASS in .env.production to send emails)`);
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
