import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscoveryService {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        private configService: ConfigService,
    ) { }

    async findTenantByCode(code: string): Promise<Tenant | null> {
        // Normalize code: uppercase, trim
        const normalizedCode = code.toUpperCase().trim();

        // Look up tenant by slug (school code)
        const tenant = await this.tenantRepository.findOne({
            where: { slug: normalizedCode.toLowerCase() }
        });

        return tenant;
    }

    async validateQRToken(token: string): Promise<Tenant | null> {
        try {
            // Verify JWT token
            const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
            const decoded: any = jwt.verify(token, secret);

            // Check expiration
            if (decoded.exp && decoded.exp < Date.now() / 1000) {
                return null;
            }

            // Get tenant by ID from token
            const tenant = await this.tenantRepository.findOne({
                where: { id: decoded.tenantId }
            });

            // TODO: Implement one-time use check if required
            // Store used tokens in Redis with TTL

            return tenant;
        } catch (error) {
            // Invalid token
            return null;
        }
    }

    async generateQRToken(tenantId: string): Promise<{
        token: string;
        expiresAt: Date;
    }> {
        const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId }
        });

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';

        // Token valid for 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const token = jwt.sign(
            {
                tenantId: tenant.id,
                slug: tenant.slug,
                type: 'qr_discovery',
            },
            secret,
            {
                expiresIn: '30d',
            }
        );

        return {
            token,
            expiresAt,
        };
    }
}
