import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { Tenant } from '../../tenants/tenant.entity';

@Injectable()
export class QrTokenService {
    private readonly logger = new Logger(QrTokenService.name);

    constructor(
        @InjectRepository(Tenant)
        private tenantRepo: Repository<Tenant>,
    ) {}

    /**
     * Generate a compact HMAC-signed QR token for a learner.
     * Format: base64url(learner_id:hmac_signature)
     */
    async generateToken(tenant_id: string, learner_user_id: string): Promise<string> {
        const secret = await this.getSecret(tenant_id);
        const signature = this.computeHmac(learner_user_id, secret);
        const payload = `${learner_user_id}:${signature}`;
        return Buffer.from(payload).toString('base64url');
    }

    /**
     * Verify a QR token and extract the learner_user_id.
     * Returns learner_user_id if valid, throws if invalid.
     */
    async verifyToken(tenant_id: string, token: string): Promise<string> {
        const secret = await this.getSecret(tenant_id);

        let decoded: string;
        try {
            decoded = Buffer.from(token, 'base64url').toString('utf8');
        } catch {
            throw new UnauthorizedException('Invalid QR token format');
        }

        const separatorIndex = decoded.lastIndexOf(':');
        if (separatorIndex === -1) {
            throw new UnauthorizedException('Invalid QR token structure');
        }

        const learner_user_id = decoded.substring(0, separatorIndex);
        const providedSignature = decoded.substring(separatorIndex + 1);

        const expectedSignature = this.computeHmac(learner_user_id, secret);

        if (providedSignature !== expectedSignature) {
            this.logger.warn(`QR token signature mismatch for tenant ${tenant_id}`);
            throw new UnauthorizedException('Invalid QR token');
        }

        return learner_user_id;
    }

    /**
     * Verify a QR token offline (without DB access).
     * Requires the secret to be provided directly.
     */
    verifyTokenOffline(token: string, secret: string): string {
        let decoded: string;
        try {
            decoded = Buffer.from(token, 'base64url').toString('utf8');
        } catch {
            throw new UnauthorizedException('Invalid QR token format');
        }

        const separatorIndex = decoded.lastIndexOf(':');
        if (separatorIndex === -1) {
            throw new UnauthorizedException('Invalid QR token structure');
        }

        const learner_user_id = decoded.substring(0, separatorIndex);
        const providedSignature = decoded.substring(separatorIndex + 1);
        const expectedSignature = this.computeHmac(learner_user_id, secret);

        if (providedSignature !== expectedSignature) {
            throw new UnauthorizedException('Invalid QR token');
        }

        return learner_user_id;
    }

    private computeHmac(data: string, secret: string): string {
        return createHmac('sha256', secret).update(data).digest('base64url');
    }

    private async getSecret(tenant_id: string): Promise<string> {
        const tenant = await this.tenantRepo.findOne({
            where: { id: tenant_id },
            select: ['id', 'qr_token_secret'],
        });

        if (!tenant || !tenant.qr_token_secret) {
            throw new UnauthorizedException('QR token not configured for this tenant');
        }

        return tenant.qr_token_secret;
    }
}
