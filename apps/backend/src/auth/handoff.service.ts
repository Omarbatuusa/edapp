import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';

interface HandoffData {
    sessionToken: string;
    userId: string;
    tenantSlug: string;
    role: string;
    expiresAt: number;
}

@Injectable()
export class HandoffService {
    // In-memory storage for MVP (Production should use Redis)
    private readonly codes = new Map<string, HandoffData>();
    private readonly TTL_MS = 60 * 1000; // 60 seconds

    createCode(sessionToken: string, userId: string, tenantSlug: string, role: string): string {
        const code = randomBytes(32).toString('hex');
        const expiresAt = Date.now() + this.TTL_MS;

        this.codes.set(code, {
            sessionToken,
            userId,
            tenantSlug,
            role,
            expiresAt,
        });

        // Cleanup expired codes periodically could be done here or via cron
        // For MVP, valid-on-read is sufficient
        return code;
    }

    exchangeCode(code: string, expectedTenantSlug: string): { sessionToken: string; userId: string; role: string } {
        const data = this.codes.get(code);

        if (!data) {
            throw new NotFoundException('Invalid or expired handoff code');
        }

        // Check expiration
        if (Date.now() > data.expiresAt) {
            this.codes.delete(code);
            throw new UnauthorizedException('Handoff code expired');
        }

        // Enforce tenant isolation
        if (data.tenantSlug !== expectedTenantSlug) {
            // Security event: Attempt to redeem code on wrong tenant
            this.codes.delete(code);
            throw new UnauthorizedException('Tenant mismatch for handoff code');
        }

        // Single-use: delete immediately
        this.codes.delete(code);

        return {
            sessionToken: data.sessionToken,
            userId: data.userId,
            role: data.role
        };
    }
}
