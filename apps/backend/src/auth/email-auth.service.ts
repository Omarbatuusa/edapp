import { Injectable, BadRequestException, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomInt } from 'crypto';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import Redis from 'ioredis';

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

const OTP_PREFIX = 'otp:';
const MAGIC_PREFIX = 'magic:';

@Injectable()
export class EmailAuthService implements OnModuleInit {
    private readonly logger = new Logger(EmailAuthService.name);
    private redis: Redis | null = null;

    // Fallback in-memory store when Redis is unavailable
    private readonly otpCodes = new Map<string, OTPData>();
    private readonly magicLinks = new Map<string, MagicLinkData>();

    private sesClient: SESClient | null = null;
    private fromEmail: string;

    private readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
    private readonly OTP_TTL_SECONDS = 5 * 60;
    private readonly MAGIC_LINK_TTL_MS = 10 * 60 * 1000; // 10 minutes
    private readonly MAGIC_LINK_TTL_SECONDS = 10 * 60;
    private readonly MAX_OTP_ATTEMPTS = 3;

    // Rate limiting: key = email, value = timestamps of recent sends
    private readonly RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    private readonly MAX_SENDS_PER_WINDOW = 5;

    constructor(private configService: ConfigService) {
        // Support both SES_* and AWS_* env var naming conventions
        const sesAccessKey = this.configService.get('SES_ACCESS_KEY', '')
            || this.configService.get('AWS_ACCESS_KEY_ID', '');
        const sesSecretKey = this.configService.get('SES_SECRET_KEY', '')
            || this.configService.get('AWS_SECRET_ACCESS_KEY', '');
        const sesRegion = this.configService.get('SES_REGION', '')
            || this.configService.get('AWS_REGION', 'af-south-1');
        this.fromEmail = this.configService.get('SES_FROM_EMAIL', 'no-reply@edapp.co.za');

        if (sesAccessKey && sesSecretKey) {
            this.sesClient = new SESClient({
                region: sesRegion,
                credentials: {
                    accessKeyId: sesAccessKey,
                    secretAccessKey: sesSecretKey,
                },
            });
            this.logger.log(`AWS SES SDK configured (region: ${sesRegion}, from: ${this.fromEmail})`);
        } else {
            this.logger.warn('No SES credentials configured — OTP emails will be logged to console only');
        }
    }

    onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL');
        if (redisUrl) {
            try {
                this.redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    lazyConnect: true,
                });
                this.redis.connect().then(() => {
                    this.logger.log('EmailAuthService connected to Redis');
                }).catch((err) => {
                    this.logger.warn(`Redis connection failed, using in-memory fallback: ${err.message}`);
                    this.redis = null;
                });
            } catch {
                this.logger.warn('Failed to initialize Redis, using in-memory fallback');
                this.redis = null;
            }
        } else {
            this.logger.warn('REDIS_URL not configured — OTP/magic links stored in-memory (not suitable for multi-instance)');
        }
    }

    // ────────────────────────────────────────────
    // Redis-backed storage helpers
    // ────────────────────────────────────────────

    private async storeOTP(key: string, data: OTPData): Promise<void> {
        if (this.redis) {
            await this.redis.set(`${OTP_PREFIX}${key}`, JSON.stringify(data), 'EX', this.OTP_TTL_SECONDS);
        } else {
            this.otpCodes.set(key, data);
        }
    }

    private async getOTP(key: string): Promise<OTPData | null> {
        if (this.redis) {
            const raw = await this.redis.get(`${OTP_PREFIX}${key}`);
            return raw ? JSON.parse(raw) : null;
        }
        return this.otpCodes.get(key) || null;
    }

    private async updateOTP(key: string, data: OTPData): Promise<void> {
        if (this.redis) {
            const ttl = await this.redis.ttl(`${OTP_PREFIX}${key}`);
            await this.redis.set(`${OTP_PREFIX}${key}`, JSON.stringify(data), 'EX', Math.max(ttl, 1));
        } else {
            this.otpCodes.set(key, data);
        }
    }

    private async deleteOTP(key: string): Promise<void> {
        if (this.redis) {
            await this.redis.del(`${OTP_PREFIX}${key}`);
        } else {
            this.otpCodes.delete(key);
        }
    }

    private async storeMagicLink(token: string, data: MagicLinkData): Promise<void> {
        if (this.redis) {
            await this.redis.set(`${MAGIC_PREFIX}${token}`, JSON.stringify(data), 'EX', this.MAGIC_LINK_TTL_SECONDS);
        } else {
            this.magicLinks.set(token, data);
        }
    }

    private async getMagicLink(token: string): Promise<MagicLinkData | null> {
        if (this.redis) {
            const raw = await this.redis.get(`${MAGIC_PREFIX}${token}`);
            return raw ? JSON.parse(raw) : null;
        }
        return this.magicLinks.get(token) || null;
    }

    private async deleteMagicLink(token: string): Promise<void> {
        if (this.redis) {
            await this.redis.del(`${MAGIC_PREFIX}${token}`);
        } else {
            this.magicLinks.delete(token);
        }
    }

    // ────────────────────────────────────────────
    // Rate limiting
    // ────────────────────────────────────────────

    private async checkRateLimit(email: string, type: 'otp' | 'magic'): Promise<void> {
        const key = `ratelimit:${type}:${email.toLowerCase().trim()}`;
        if (this.redis) {
            const count = await this.redis.incr(key);
            if (count === 1) {
                await this.redis.expire(key, Math.ceil(this.RATE_LIMIT_WINDOW_MS / 1000));
            }
            if (count > this.MAX_SENDS_PER_WINDOW) {
                throw new BadRequestException('Too many requests. Please wait before requesting another code.');
            }
        }
        // In-memory rate limiting not implemented for dev — only Redis in production
    }

    // ────────────────────────────────────────────
    // Token generation
    // ────────────────────────────────────────────

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
            this.logger.warn(`No SES client — cannot send to ${to}`);
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
            this.logger.log(`Email sent to ${to} (MessageId: ${result.MessageId})`);
            return true;
        } catch (err: any) {
            this.logger.error(`SES send failed to ${to}: ${err.message || err}`);
            return false;
        }
    }

    /**
     * Create and send OTP code to email
     */
    async sendOTP(email: string): Promise<{ otpKey: string; expiresAt: number }> {
        const normalizedEmail = email.toLowerCase().trim();

        // Rate limit
        await this.checkRateLimit(normalizedEmail, 'otp');

        const code = this.generateOTPCode();
        const otpKey = randomBytes(16).toString('hex');
        const expiresAt = Date.now() + this.OTP_TTL_MS;

        await this.storeOTP(otpKey, {
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
            this.logger.warn(`OTP fallback — Code for ${normalizedEmail}: ${code}`);
        }

        return { otpKey, expiresAt };
    }

    /**
     * Verify OTP code
     */
    async verifyOTP(otpKey: string, code: string, email: string): Promise<boolean> {
        const data = await this.getOTP(otpKey);

        if (!data) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        if (Date.now() > data.expiresAt) {
            await this.deleteOTP(otpKey);
            throw new BadRequestException('OTP expired');
        }

        if (data.email !== email.toLowerCase().trim()) {
            throw new UnauthorizedException('Email mismatch');
        }

        // Check attempts BEFORE incrementing (fix off-by-one)
        if (data.attempts >= this.MAX_OTP_ATTEMPTS) {
            await this.deleteOTP(otpKey);
            throw new BadRequestException('Too many attempts. Request a new code.');
        }

        if (data.code !== code) {
            // Increment attempts on wrong code only
            data.attempts++;
            await this.updateOTP(otpKey, data);
            const remaining = this.MAX_OTP_ATTEMPTS - data.attempts;
            throw new BadRequestException(`Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
        }

        // Success — delete the OTP (single-use)
        await this.deleteOTP(otpKey);
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

        // Rate limit
        await this.checkRateLimit(normalizedEmail, 'magic');

        const token = this.generateMagicLinkToken();
        const expiresAt = Date.now() + this.MAGIC_LINK_TTL_MS;

        await this.storeMagicLink(token, {
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
            this.logger.warn(`Magic link fallback — Link for ${normalizedEmail}: ${magicLinkUrl}`);
        }

        return { sent, expiresAt };
    }

    /**
     * Verify magic link token — atomic single-use via Redis DEL
     */
    async verifyMagicLink(token: string): Promise<{
        email: string;
        tenantSlug: string;
        role: string;
        returnUrl: string;
    }> {
        let data: MagicLinkData | null = null;

        if (this.redis) {
            // Atomic GET + DEL to prevent race condition
            const raw = await this.redis.get(`${MAGIC_PREFIX}${token}`);
            if (raw) {
                await this.redis.del(`${MAGIC_PREFIX}${token}`);
                data = JSON.parse(raw);
            }
        } else {
            const entry = this.magicLinks.get(token);
            if (entry) {
                this.magicLinks.delete(token);
                data = entry;
            }
        }

        if (!data) {
            throw new BadRequestException('Invalid or expired magic link');
        }

        if (Date.now() > data.expiresAt) {
            throw new BadRequestException('Magic link expired');
        }

        if (data.used) {
            throw new BadRequestException('Magic link already used');
        }

        return {
            email: data.email,
            tenantSlug: data.tenantSlug,
            role: data.role,
            returnUrl: data.returnUrl,
        };
    }

    /**
     * Send password reset email with OTP code
     */
    async sendPasswordResetOTP(email: string): Promise<{ otpKey: string; expiresAt: number }> {
        const normalizedEmail = email.toLowerCase().trim();

        await this.checkRateLimit(normalizedEmail, 'otp');

        const code = this.generateOTPCode();
        const otpKey = randomBytes(16).toString('hex');
        const expiresAt = Date.now() + this.OTP_TTL_MS;

        await this.storeOTP(otpKey, {
            code,
            email: normalizedEmail,
            expiresAt,
            attempts: 0,
        });

        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">EdApp</h1>
                    <p style="font-size: 14px; color: #666; margin-top: 4px;">Password Reset</p>
                </div>
                <div style="background: #f8f9fa; border-radius: 16px; padding: 32px; text-align: center;">
                    <p style="font-size: 14px; color: #555; margin: 0 0 16px;">Your password reset code is:</p>
                    <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1a1a1a; font-family: monospace; padding: 16px; background: white; border-radius: 12px; border: 2px solid #e5e7eb;">
                        ${code}
                    </div>
                    <p style="font-size: 13px; color: #888; margin: 16px 0 0;">This code expires in 5 minutes.</p>
                </div>
                <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
                    If you didn't request this code, your account is safe — someone may have entered your email by mistake.
                </p>
            </div>
        `;

        const sent = await this.sendEmail(
            normalizedEmail,
            'EdApp - Password Reset Code',
            htmlBody,
        );

        if (!sent) {
            this.logger.warn(`Password reset OTP fallback — Code for ${normalizedEmail}: ${code}`);
        }

        return { otpKey, expiresAt };
    }

    /**
     * Send welcome email with temporary password to a newly created user
     */
    async sendWelcomeEmail(email: string, displayName: string, tempPassword: string): Promise<boolean> {
        const normalizedEmail = email.toLowerCase().trim();

        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0;">Welcome to EdApp</h1>
                    <p style="font-size: 14px; color: #666; margin-top: 8px;">Your account has been created</p>
                </div>
                <div style="background: #f8f9fa; border-radius: 16px; padding: 32px;">
                    <p style="font-size: 15px; color: #333; margin: 0 0 8px;">Hi <strong>${displayName}</strong>,</p>
                    <p style="font-size: 14px; color: #555; margin: 0 0 20px; line-height: 1.6;">
                        An administrator has created an account for you on the EdApp platform.
                        Use the credentials below to sign in for the first time.
                    </p>

                    <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                        <p style="font-size: 13px; color: #888; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                        <p style="font-size: 15px; color: #1a1a1a; font-weight: 600; margin: 0 0 16px; font-family: monospace;">${normalizedEmail}</p>
                        <p style="font-size: 13px; color: #888; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
                        <p style="font-size: 18px; color: #1a1a1a; font-weight: 700; margin: 0; font-family: monospace; letter-spacing: 1px;">${tempPassword}</p>
                    </div>

                    <div style="background: #fef3c7; border-radius: 8px; padding: 12px 16px; border: 1px solid #fcd34d;">
                        <p style="font-size: 13px; color: #92400e; margin: 0; line-height: 1.5;">
                            <strong>Important:</strong> You will be asked to verify your email and set a new password on your first login.
                        </p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 24px;">
                    <a href="https://admin.edapp.co.za/login" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                        Sign In to EdApp
                    </a>
                </div>
                <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
                    If you did not expect this email, please contact your administrator.
                </p>
            </div>
        `;

        const sent = await this.sendEmail(
            normalizedEmail,
            'Welcome to EdApp — Your Account is Ready',
            htmlBody,
        );

        if (!sent) {
            this.logger.warn(`Welcome email fallback — Temp password for ${normalizedEmail}: ${tempPassword}`);
        }

        return sent;
    }

    /**
     * Clean up expired tokens (call periodically via cron)
     */
    cleanupExpiredTokens(): void {
        // Redis handles TTL automatically — only clean in-memory
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
