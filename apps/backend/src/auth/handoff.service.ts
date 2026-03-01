import { Injectable, NotFoundException, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';

interface HandoffData {
    sessionToken: string;
    userId: string;
    tenantSlug: string;
    role: string;
    rememberDevice?: boolean;
    rememberDuration?: number;
}

const HANDOFF_PREFIX = 'handoff:';
const TTL_SECONDS = 60;

@Injectable()
export class HandoffService implements OnModuleInit {
    private readonly logger = new Logger(HandoffService.name);
    private redis: Redis | null = null;

    // Fallback in-memory store when Redis is unavailable
    private readonly codes = new Map<string, { data: HandoffData; expiresAt: number }>();

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL');
        if (redisUrl) {
            try {
                this.redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    lazyConnect: true,
                });
                this.redis.connect().then(() => {
                    this.logger.log('Handoff service connected to Redis');
                }).catch((err) => {
                    this.logger.warn(`Redis connection failed, using in-memory fallback: ${err.message}`);
                    this.redis = null;
                });
            } catch {
                this.logger.warn('Failed to initialize Redis, using in-memory fallback');
                this.redis = null;
            }
        } else {
            this.logger.warn('REDIS_URL not configured, handoff codes stored in-memory (not suitable for production)');
        }
    }

    async createCode(
        sessionToken: string,
        userId: string,
        tenantSlug: string,
        role: string,
        rememberDevice?: boolean,
        rememberDuration?: number,
    ): Promise<string> {
        const code = randomBytes(32).toString('hex');
        const data: HandoffData = { sessionToken, userId, tenantSlug, role, rememberDevice, rememberDuration };

        if (this.redis) {
            await this.redis.set(
                `${HANDOFF_PREFIX}${code}`,
                JSON.stringify(data),
                'EX',
                TTL_SECONDS,
            );
        } else {
            this.codes.set(code, {
                data,
                expiresAt: Date.now() + TTL_SECONDS * 1000,
            });
        }

        return code;
    }

    async exchangeCode(
        code: string,
        expectedTenantSlug: string,
    ): Promise<{ sessionToken: string; userId: string; role: string; rememberDevice?: boolean; rememberDuration?: number }> {
        let data: HandoffData | null = null;

        if (this.redis) {
            // Atomic GET + DEL (single-use)
            const raw = await this.redis.get(`${HANDOFF_PREFIX}${code}`);
            if (raw) {
                await this.redis.del(`${HANDOFF_PREFIX}${code}`);
                data = JSON.parse(raw);
            }
        } else {
            const entry = this.codes.get(code);
            if (entry) {
                this.codes.delete(code);
                if (Date.now() <= entry.expiresAt) {
                    data = entry.data;
                }
            }
        }

        if (!data) {
            throw new NotFoundException('Invalid or expired handoff code');
        }

        // Enforce tenant isolation
        if (data.tenantSlug !== expectedTenantSlug) {
            throw new UnauthorizedException('Tenant mismatch for handoff code');
        }

        return {
            sessionToken: data.sessionToken,
            userId: data.userId,
            role: data.role,
            rememberDevice: data.rememberDevice,
            rememberDuration: data.rememberDuration,
        };
    }
}
