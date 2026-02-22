import { Controller, Post, Body, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminDraft } from './admin-draft.entity';
import Redis from 'ioredis';

@Controller('v1/admin/email-verify')
export class AdminEmailVerifyController {
    private readonly sesClient: SESClient;
    private readonly redis: Redis;
    private readonly fromEmail: string;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(AdminDraft)
        private readonly draftRepo: Repository<AdminDraft>,
    ) {
        const region = configService.get<string>('AWS_REGION') || 'af-south-1';
        this.fromEmail = configService.get<string>('SES_FROM_EMAIL') || 'noreply@edapp.co.za';

        this.sesClient = new SESClient({
            region,
            credentials: {
                accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
            },
        });

        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        this.redis = new Redis(redisUrl);
    }

    private otpKey(draftId: string, email: string) {
        return `email_otp:${draftId}:${email.toLowerCase()}`;
    }

    private rateLimitKey(draftId: string, email: string) {
        return `email_otp_attempts:${draftId}:${email.toLowerCase()}`;
    }

    private resendCooldownKey(draftId: string, email: string) {
        return `email_otp_cooldown:${draftId}:${email.toLowerCase()}`;
    }

    @Post('send')
    async send(@Body() body: { email: string; draft_id: string }) {
        const { email, draft_id } = body;

        if (!email || !draft_id) {
            throw new BadRequestException('email and draft_id are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestException('Invalid email format');
        }

        // Rate limiting: max 5 sends per draft+email
        const attempts = await this.redis.incr(this.rateLimitKey(draft_id, email));
        if (attempts === 1) {
            await this.redis.expire(this.rateLimitKey(draft_id, email), 3600);
        }
        if (attempts > 5) {
            throw new BadRequestException('Too many verification attempts. Please try again later.');
        }

        // 30s resend cooldown
        const cooldown = await this.redis.get(this.resendCooldownKey(draft_id, email));
        if (cooldown) {
            throw new BadRequestException('Please wait 30 seconds before requesting another code.');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis with 15 min TTL
        await this.redis.set(this.otpKey(draft_id, email), otp, 'EX', 900);

        // Set resend cooldown (30s)
        await this.redis.set(this.resendCooldownKey(draft_id, email), '1', 'EX', 30);

        // Send via SES
        try {
            await this.sesClient.send(new SendEmailCommand({
                Source: `EdApp <${this.fromEmail}>`,
                Destination: { ToAddresses: [email] },
                Message: {
                    Subject: { Data: 'Verify your email — EdApp Admin' },
                    Body: {
                        Html: {
                            Data: `
                                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
                                    <h2 style="color:#1e293b;margin-bottom:8px">Verify your email</h2>
                                    <p style="color:#475569;margin-bottom:24px">Enter this code in the admin setup form:</p>
                                    <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#2563eb;font-family:monospace">
                                        ${otp}
                                    </div>
                                    <p style="color:#94a3b8;font-size:13px;margin-top:24px">This code expires in 15 minutes. If you did not request this, please ignore this email.</p>
                                </div>
                            `,
                        },
                    },
                },
            }));
        } catch (err) {
            // Don't expose SES errors to client
            console.error('SES send error:', err);
            throw new BadRequestException('Failed to send verification email. Please try again.');
        }

        return { sent: true };
    }

    @Post('check')
    async check(@Body() body: { email: string; otp: string; draft_id: string }) {
        const { email, otp, draft_id } = body;

        if (!email || !otp || !draft_id) {
            throw new BadRequestException('email, otp and draft_id are required');
        }

        const stored = await this.redis.get(this.otpKey(draft_id, email));

        if (!stored || stored !== otp.trim()) {
            return { verified: false };
        }

        // Clear OTP after successful verification
        await this.redis.del(this.otpKey(draft_id, email));

        // Persist verification in draft data
        const draft = await this.draftRepo.findOne({ where: { id: draft_id } });
        if (draft) {
            draft.data = {
                ...draft.data,
                emailVerified: true,
                emailVerifiedAt: new Date().toISOString(),
                verifiedEmail: email.toLowerCase(),
            };
            await this.draftRepo.save(draft);
        }

        return { verified: true };
    }
}
